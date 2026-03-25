# Triage Playbook

Use this playbook to turn pasted MySQL evidence into a stable diagnosis path.

## Primary Buckets

### 1. Slow SQL / Poor Query Plans

Look for:

- Queries staying in `Query`, `Sending data`, `Copying to tmp table`, `Creating sort index`
- Many sessions blocked behind the same expensive statement but without lock-wait evidence
- Slow query log dominated by full scans, large sorts, temp tables, or missing indexes
- Recent release or workload change affecting one query family

Supporting evidence:

- Repeated long-running statements in `SHOW PROCESSLIST`
- Slow query log entries with high rows examined or large sort/tmp usage
- `performance_schema` summaries dominated by one digest

Counter-signals:

- Clear lock waits in InnoDB status
- Connections exhausted mostly by idle `Sleep`
- IO/checkpoint saturation without one dominant query pattern

Immediate actions:

- Identify the worst query family and run `EXPLAIN` or `EXPLAIN ANALYZE` if available
- Stop or throttle the worst offender if it is safe
- Confirm whether the slowdown started after a release or traffic change

Low-traffic actions:

- Add or adjust indexes after plan review
- Rewrite large sort/join/temp-table queries
- Revisit pagination, batch size, or fan-out patterns

High-risk / manual review:

- Query-killing during critical traffic
- Large index builds on hot tables
- Schema changes without rollback planning

Candidate parameter suggestions:

- `tmp_table_size`
- `max_heap_table_size`
- `sort_buffer_size`

Only mention them if evidence shows temp-table or sort pressure and query fixes are not the whole story.

### 2. Lock Contention / Long Transactions

Look for:

- `LOCK WAIT` or equivalent transaction wait signals in InnoDB status
- Long-lived transactions holding row locks
- `SHOW PROCESSLIST` threads stuck on `Waiting for ... lock`
- History list or transaction backlog growing around write-heavy paths

Supporting evidence:

- Blocking transaction details in `SHOW ENGINE INNODB STATUS`
- Many sessions waiting on the same table or row set
- Application symptoms focused on writes or mixed read/write endpoints

Counter-signals:

- No waiting transactions and no lock sections pointing to conflict
- Mostly read-only slowdowns dominated by scans or sorts

Immediate actions:

- Identify the blocker transaction and owning workload
- Verify whether the blocker can be ended safely
- Reduce concurrent writes from the offending job or endpoint

Low-traffic actions:

- Shorten transaction scope
- Reorder statements to reduce lock time
- Add indexes that reduce touched rows

High-risk / manual review:

- Killing transactions on critical business flows
- Emergency rollback of large write batches

Candidate parameter suggestions:

- Usually none first. Prefer workload and transaction fixes before config tuning.

### 3. Connection Saturation / Thread Pressure

Look for:

- `Too many connections` symptoms
- `max_connections` reached or nearly reached
- Large `Sleep` population consuming slots
- Application pool misconfiguration or bursty reconnect behavior

Supporting evidence:

- `SHOW PROCESSLIST` count near `max_connections`
- Many idle threads with long `Time`
- User complaints map to connection acquisition latency rather than one slow query

Counter-signals:

- Low active thread count with clear lock or query bottleneck
- Plenty of headroom in connections but high IO or flush pressure

Immediate actions:

- Confirm active versus idle connection mix
- Reduce abusive pool settings or reconnect storms
- Free obviously abandoned sessions if safe

Low-traffic actions:

- Tune application pooling
- Right-size `max_connections` to host memory and workload
- Add admission control or queueing upstream

High-risk / manual review:

- Blindly raising `max_connections` without memory analysis
- Bulk-killing sessions tied to production traffic

Candidate parameter suggestions:

- `max_connections`
- `wait_timeout`
- `interactive_timeout`

Only mention them together with connection-mix evidence and memory caution.

### 4. InnoDB Memory Pressure / Buffer Pool Mismatch

Look for:

- Buffer pool too small for hot working set
- High read pressure with poor cache hit behavior
- Excessive churn or eviction symptoms in InnoDB status
- Memory-related spillover making disk work worse

Supporting evidence:

- Buffer pool metrics in InnoDB status indicate sustained pressure
- Host RAM is clearly larger than current buffer pool allocation
- Slowdown concentrated on reads with no dominant lock story

Counter-signals:

- One bad query or lock chain explains most of the pain
- Storage or flush bottleneck is clearly dominant

Immediate actions:

- Confirm host RAM, current buffer pool sizing, and workload mix
- Check whether the working set recently grew

Low-traffic actions:

- Increase `innodb_buffer_pool_size` if the host has safe memory headroom
- Re-evaluate per-connection memory settings when connection counts are high

High-risk / manual review:

- Aggressive memory increases on already tight hosts
- Concurrent tuning of multiple memory knobs without measurement

Candidate parameter suggestions:

- `innodb_buffer_pool_size`
- `innodb_buffer_pool_instances`
- `tmp_table_size`
- `max_heap_table_size`

### 5. IO Bottlenecks / Flush or Checkpoint Pressure

Look for:

- Dirty-page or checkpoint pressure in InnoDB status
- High fsync / flush activity
- Writes slowing down more than reads
- Storage saturation symptoms from the operator note

Supporting evidence:

- InnoDB status shows flush backlog or checkpoint-age pressure
- Slowness clusters around write-heavy traffic
- Host storage is known to be weak or recently degraded

Counter-signals:

- Lock waits explain the waits directly
- One bad query dominates without flush signals

Immediate actions:

- Confirm whether the slowdown is write-heavy
- Reduce burst writes from jobs, migrations, or batch workers if possible
- Check host-level IO saturation if available

Low-traffic actions:

- Review redo log sizing and flush behavior
- Smooth ingestion or batch write patterns
- Revisit storage class if the host is underprovisioned

High-risk / manual review:

- Changing durability-related settings without business sign-off
- Redo log changes requiring careful rollout

Candidate parameter suggestions:

- `innodb_log_file_size` or redo log capacity equivalents
- `innodb_flush_log_at_trx_commit`
- `innodb_io_capacity`

Only mention durability tradeoffs explicitly.

### 6. Unknown / Insufficient Evidence

Use this when:

- The user provided only symptoms, not evidence
- Signals conflict and no dominant bottleneck emerges
- The output is too partial to support a safe conclusion

Required behavior:

- State that confidence is low
- Ask only the next best `1-3` questions
- Avoid speculative tuning

## Cross-Cutting Rules

- Prefer root-cause buckets over surface symptoms.
- A configuration suggestion is secondary, never the first diagnosis.
- If lock and slow-query evidence coexist, decide which one explains the waiting sessions more directly.
- If connection saturation is downstream of a query or lock problem, say so explicitly.
- If you recommend a risky action, include why it is risky and what to verify before doing it.
- For MySQL `5.7` versus `8.0`, mention version-sensitive commands or metrics only when relevant; do not let version differences dominate the report.
