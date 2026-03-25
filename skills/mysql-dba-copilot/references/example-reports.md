# Example Reports

Use these examples to calibrate the final report shape. They are intentionally compact but concrete enough to show how evidence should map to conclusions and risk tiers.

## Example A: Slow SQL After Release

### Input Snapshot

```text
Symptom summary:
- Order list API became slow after today's release
- CPU high, reads slower than usual

Environment:
- MySQL version: 8.0.34
- CPU: 8 vCPU
- RAM: 32 GB
- Storage type: SSD

SHOW VARIABLES:
- max_connections = 500
- innodb_buffer_pool_size = 17179869184
- tmp_table_size = 16777216
- max_heap_table_size = 16777216

SHOW PROCESSLIST:
- 14 sessions in "Sending data" for:
  SELECT * FROM orders WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50 OFFSET 50000
- query time ranges from 18s to 64s
- no obvious lock-wait states

SHOW ENGINE INNODB STATUS:
- no active lock waits
- buffer pool not under obvious pressure

Slow query log:
- same SELECT appears repeatedly
- Rows_examined is very high
```

### Expected Output

#### Incident Summary

Order list reads became slow immediately after a release. The slowdown appears concentrated on one query family rather than a host-wide InnoDB or lock problem.

#### Most Likely Bottleneck

`Slow SQL / Poor Query Plans` with `high` confidence.

#### Evidence Observed

- `SHOW PROCESSLIST` has 14 concurrent sessions running the same `ORDER BY ... LIMIT ... OFFSET ...` query in `Sending data`
- Query runtimes are long at `18s-64s`
- Slow query log shows the same statement with very high `Rows_examined`
- InnoDB status does not show a meaningful lock-wait pattern

#### What To Check Next

- Run `EXPLAIN` on the slow query and verify whether the sort or pagination pattern is forcing large scans
- Confirm whether the release changed index usage, pagination style, or filter conditions

#### Recommended Actions by Priority

Immediate:
- Identify the exact query shape introduced by the release and roll back or throttle that code path if user impact is severe
- Capture `EXPLAIN` output for the query before making global database changes

Low-Traffic Window:
- Add or adjust an index that supports `tenant_id` and `created_at`
- Replace deep `OFFSET` pagination with seek pagination if the endpoint allows it

High-Risk / Manual Review:
- Killing many live query sessions during peak traffic can create user-visible failures
- Building a large new index on a hot table needs rollout planning

#### Risk Notes

The main risk here is misdiagnosing this as a memory or connection problem and tuning global variables while the real issue is one inefficient query family.

#### Candidate Config Changes

- `tmp_table_size`: consider only if `EXPLAIN` and runtime evidence show temp-table pressure beyond the query-shape issue
- `max_heap_table_size`: consider together with `tmp_table_size`, not in isolation

#### Plain-Language Explanation

这更像是“新版本带来了一条很贵的查询”，不是 MySQL 整体突然变差。先盯住这条 SQL，比先改全局参数更安全也更有效。

## Example B: Lock Waits From Long Transaction

### Input Snapshot

```text
Symptom summary:
- Payment write requests timing out
- Writes much slower than reads

Environment:
- MySQL version: 5.7.42
- CPU: 4 vCPU
- RAM: 16 GB

SHOW PROCESSLIST:
- 9 sessions in "Waiting for row lock"
- one session running UPDATE payments ... for 412s

SHOW ENGINE INNODB STATUS:
- TRANSACTION 412391 active 421 sec
- 8 lock struct(s), 120 row lock(s)
- 9 transactions waiting for the same row set

SHOW VARIABLES:
- innodb_lock_wait_timeout = 50
```

### Expected Output

#### Incident Summary

Payment-related writes are timing out because multiple transactions are queued behind one long-running write transaction.

#### Most Likely Bottleneck

`Lock Contention / Long Transactions` with `high` confidence.

#### Evidence Observed

- `SHOW PROCESSLIST` shows 9 sessions waiting on row locks
- One `UPDATE payments ...` session has been active for `412s`
- InnoDB status shows one long transaction with many held row locks and several waiting transactions behind it

#### What To Check Next

- Confirm which application job, request, or deploy owns the blocking transaction
- Verify whether the blocking transaction is still doing useful work or is stuck

#### Recommended Actions by Priority

Immediate:
- Identify the owning workload and stop new requests from piling onto the same hot rows if possible
- Decide whether the blocking transaction can be ended safely with application-owner approval

Low-Traffic Window:
- Reduce transaction scope so rows are held for less time
- Add or improve indexes to reduce rows touched by the update path

High-Risk / Manual Review:
- Killing the blocking transaction may roll back a large write set and cause business inconsistency if done blindly
- Emergency app-level retries can worsen pileups if they increase write concurrency

#### Risk Notes

The risky step is ending the blocker without understanding the business operation it belongs to. That may relieve pressure quickly, but it can also trigger a large rollback or partial workflow failure.

#### Candidate Config Changes

No primary config change is justified yet. This looks like a workload and transaction-shape problem first.

#### Plain-Language Explanation

这里像是一辆大车横在路口，后面的写请求全堵住了。先找到那笔长事务，比先调锁超时或内存参数更重要。

## Example C: Connection Saturation From Idle Sessions

### Input Snapshot

```text
Symptom summary:
- API sporadically returns "Too many connections"
- No recent schema change

Environment:
- MySQL version: 8.0.31
- CPU: 8 vCPU
- RAM: 64 GB

SHOW VARIABLES:
- max_connections = 300
- wait_timeout = 28800

SHOW PROCESSLIST:
- 285 total sessions
- 220 sessions in "Sleep"
- many sleep times over 3000s
- only a few active queries, none obviously slow

SHOW ENGINE INNODB STATUS:
- no lock backlog
- no obvious flush pressure
```

### Expected Output

#### Incident Summary

The database is running out of connection slots, and the pressure appears to come mainly from idle or abandoned sessions rather than one dominant SQL or lock problem.

#### Most Likely Bottleneck

`Connection Saturation / Thread Pressure` with `high` confidence.

#### Evidence Observed

- `SHOW PROCESSLIST` has `285` sessions against `max_connections = 300`
- `220` sessions are in `Sleep`
- Sleep times are long, many above `3000s`
- InnoDB status does not show a competing lock or IO bottleneck

#### What To Check Next

- Confirm application pool settings and whether clients are returning connections promptly
- Check whether a recent deploy introduced connection leaks or retry storms

#### Recommended Actions by Priority

Immediate:
- Identify whether abandoned sessions can be safely cleaned up
- Reduce connection storm behavior in the application if a pool leak or reconnect loop is active

Low-Traffic Window:
- Tune application pool size and idle timeout
- Re-evaluate `wait_timeout` so dead sessions do not occupy slots for hours

High-Risk / Manual Review:
- Raising `max_connections` blindly can increase memory pressure and hide the real leak
- Bulk-killing sessions tied to active traffic can fail user requests

#### Risk Notes

The common mistake here is to raise `max_connections` first. That may buy a little time, but it often masks a pool leak and increases memory risk.

#### Candidate Config Changes

- `wait_timeout`: consider lowering it if the app safely reconnects and idle sessions are clearly excessive
- `max_connections`: consider only after checking memory headroom and pool behavior

#### Plain-Language Explanation

不是数据库在忙着算很多 SQL，而是连接名额被大量闲置连接占满了。先治连接泄漏或池配置，比单纯把上限调大更靠谱。

## Example D: Insufficient Evidence

### Input Snapshot

```text
Symptom summary:
- Database is slow
- CPU high

Environment:
- MySQL version: unknown

No SHOW PROCESSLIST
No SHOW ENGINE INNODB STATUS
No SHOW VARIABLES
```

### Expected Output

#### Incident Summary

There is a real slowdown signal, but the current evidence is too thin to safely distinguish query cost, locks, connections, memory pressure, or IO pressure.

#### Most Likely Bottleneck

`Unknown / Insufficient Evidence` with `low` confidence.

#### Evidence Observed

- Only a generic symptom note is available: `CPU high`
- There is no process list, InnoDB status, or variable context yet

#### What To Check Next

- Paste `SHOW PROCESSLIST`
- Paste `SHOW ENGINE INNODB STATUS`
- Paste `SHOW VARIABLES`

#### Recommended Actions by Priority

Immediate:
- Gather the three baseline outputs above before making tuning changes

Low-Traffic Window:
- None yet

High-Risk / Manual Review:
- Do not change global MySQL settings based only on `CPU high`

#### Risk Notes

With evidence this thin, confident tuning advice is more likely to waste time or create a second incident than solve the first one.

#### Candidate Config Changes

None yet.

#### Plain-Language Explanation

目前只能确认“有问题”，还不能确认“问题是什么”。先补最基础的三份输出，再判断是 SQL、锁、连接还是 IO。
