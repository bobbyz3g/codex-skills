# Example Incidents

Use these examples to calibrate output shape, evidence chaining, and risk language.

## Example 1: One Query Family Dominates

Scenario:

- A release changed an endpoint.
- `SHOW PROCESSLIST` shows many long `Sending data` sessions on the same query pattern.
- No strong lock-wait signals in InnoDB status.

Expected diagnosis:

- Primary bucket: `Slow SQL / Poor Query Plans`
- Confidence: `high`

Expected emphasis:

- Point to the repeated query family
- Recommend `EXPLAIN` / plan review before touching global settings
- Treat temp-table or sort-buffer tuning as secondary

## Example 2: Write Requests Stuck Behind One Transaction

Scenario:

- Users report write timeouts.
- InnoDB status shows clear lock waits and one long transaction holding locks.
- Processlist has multiple `Waiting for ... lock` threads.

Expected diagnosis:

- Primary bucket: `Lock Contention / Long Transactions`
- Confidence: `high`

Expected emphasis:

- Name the blocker and waiting pattern
- Separate safe investigation from risky kill/rollback actions
- Avoid generic memory or connection tuning

## Example 3: Connection Pool Storm

Scenario:

- App reports `Too many connections`.
- Processlist is near `max_connections` with a large `Sleep` population.
- No dominant slow query or lock chain.

Expected diagnosis:

- Primary bucket: `Connection Saturation / Thread Pressure`
- Confidence: `high`

Expected emphasis:

- Distinguish active versus idle connections
- Warn against blindly raising `max_connections`
- Point to app pool settings and abandoned sessions

## Example 4: Read-Heavy Workload Outgrows Cache

Scenario:

- Traffic increased gradually.
- Reads got slower more than writes.
- Host RAM is healthy, but `innodb_buffer_pool_size` is small for dataset size.
- No strong lock story.

Expected diagnosis:

- Primary bucket: `InnoDB Memory Pressure / Buffer Pool Mismatch`
- Confidence: `medium`

Expected emphasis:

- Tie the slowdown to cache pressure rather than one SQL statement
- Suggest validating working-set growth
- Keep `innodb_buffer_pool_size` advice parameter-level and low-risk-window only

## Example 5: Flush Pressure After Batch Import

Scenario:

- Slowness started during or after a batch write job.
- Writes are much slower than reads.
- InnoDB status shows checkpoint or flush pressure signals.

Expected diagnosis:

- Primary bucket: `IO Bottlenecks / Flush or Checkpoint Pressure`
- Confidence: `medium`

Expected emphasis:

- Focus on write burst smoothing and storage pressure
- Explain durability tradeoffs before mentioning flush-related tuning

## Example 6: Evidence Too Thin

Scenario:

- User says "database is slow" and only gives CPU high.
- No `SHOW PROCESSLIST`, no InnoDB status, no variables.

Expected diagnosis:

- Primary bucket: `Unknown / Insufficient Evidence`
- Confidence: `low`

Expected emphasis:

- Ask for the next best `1-3` evidence items
- Do not produce confident tuning advice

## Example 7: Lock Waits Are Secondary to One Bad Query

Scenario:

- One expensive update touches many rows.
- Some sessions then show lock waits.
- Processlist and logs make the expensive statement obviously dominant.

Expected diagnosis:

- Primary bucket: `Slow SQL / Poor Query Plans`
- Confidence: `medium`

Expected emphasis:

- Explain that lock pain is downstream of the query pattern
- Keep the main remediation on query shape and row-touch reduction

## Example 8: Connections Are Full Because Transactions Never Finish

Scenario:

- Connection count is high.
- Many sessions are open because long transactions hold resources and clients pile up.
- InnoDB status shows transaction backlog.

Expected diagnosis:

- Primary bucket: `Lock Contention / Long Transactions`
- Confidence: `medium`

Expected emphasis:

- Explain why connection pressure is a downstream symptom
- Avoid treating `max_connections` as the root fix
