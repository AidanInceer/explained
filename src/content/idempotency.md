---
title: Idempotent pipelines
summary: A job is idempotent when running it twice gives the same result as running it once. This makes retries and backfills safe.
track: pipelines
level: core
minutes: 8
at: [0, 3]
prereqs: [incremental-loading]
tech: [orchestrators, tableformats]
refs:
  - functional: Whole essay
  - fode: Ch. 7, “Idempotency” in ingestion considerations
---
Pipelines fail, and then they are run again. A scheduler retries a task after a timeout. An engineer runs last Tuesday's job again after a correction. If a second run changes the result, each retry is a risk. If it does not, a retry is a safe and routine operation.

A job is **idempotent** when running it many times with the same input gives the same result as running it once.

::fig idempotency | Choose a write method and run the job again. Only the append method changes the result.

## Why reruns are not rare

- The job wrote its data, and then the network failed before it could report success. The orchestrator sees a failure and retries.
- The job failed at row 600,000 of a million. The first 600,000 rows are already in the target.
- Upstream data was wrong and has been corrected. You must process that day again.
- A business rule changed and applies to the past two years. You must run 730 days again. This is a **backfill**.

In each case, an append-only job duplicates data and an idempotent job does not.

## Three ways to make a load idempotent

### 1. Overwrite a partition

The job is given a period of time, usually a day. It replaces *all* the target data for that period.

```sql
DELETE FROM sales WHERE day = '2026-03-05';
INSERT INTO sales
SELECT * FROM staging_sales WHERE day = '2026-03-05';
```

Do both statements in one transaction, or use the engine's atomic form, such as `INSERT OVERWRITE` or a partition replace. The result depends only on the input for that day, not on what was in the target before. This is the reason [partitioning](/lesson/partitioning) by date is so common.

### 2. Merge on a key

If each row has a unique key, use an upsert. A row that is already in the target is updated to the same values, which has no effect.

```sql
MERGE INTO sales t
USING staging_sales s ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET amount = s.amount
WHEN NOT MATCHED THEN INSERT (order_id, amount) VALUES (s.order_id, s.amount);
```

This needs a key that is truly unique. If the key has duplicates in the source, the merge fails or gives results that depend on row order.

### 3. Rebuild the full table

For small tables, drop and create the table on each run. It is idempotent by construction.

## The rules of functional data engineering

Maxime Beauchemin, who created Airflow, described the approach in an essay with that title. The main rules:

- **A task is a pure function.** The same input partition always gives the same output partition. The task has no hidden state.
- **Partitions are immutable.** A task does not edit a partition in place. It replaces it completely.
- **The run date is a parameter.** The job does not ask the system clock for "today". The orchestrator gives it the date of the data to process. A run for 5 March that is started on 20 March then processes the data of 5 March.

The third rule is the one that most often goes wrong.

```sql
-- Not idempotent: the result depends on when it runs
WHERE order_date = CURRENT_DATE - 1

-- Idempotent: the result depends only on the parameter
WHERE order_date = '{{ run_date }}'
```

> **Pitfall.** Other sources of non-idempotent results: `NOW()` or `RANDOM()` inside a transformation, a sequence that gives new ids on each run, and reading "the latest file" from a folder that changes. Give the job its inputs explicitly.

## Idempotency is for effects too

A pipeline that sends an email, calls a payment API or publishes a message has effects outside the warehouse. Overwriting cannot undo them. For these, record what you have done under a unique key and check the record first, or use an API that accepts an **idempotency key** and ignores a repeated request. [Delivery guarantees](/lesson/delivery-semantics) continues this subject.

## Remember

- Idempotent: one run and ten runs give the same result.
- Overwrite a partition, merge on a unique key, or rebuild the table. Do not append without a check.
- Pass the run date as a parameter. Do not read the clock.

::quiz
? A daily job filters with <code>WHERE order_date = CURRENT_DATE - 1</code>. You run the job for 5 March again on 20 March. What does it process?
- 5 March
+ 19 March
- Nothing
! The filter reads the clock, so it processes yesterday relative to the time of the run. The date must be a parameter from the orchestrator.
? A job uses <code>INSERT INTO target SELECT ...</code> and is retried after a timeout. The first attempt had in fact finished. What is the result?
+ The rows are in the target twice
- The second insert is ignored
- The database removes the duplicates
! A plain insert appends. Nothing connects the second set of rows to the first, unless a unique constraint is enforced.
? Which write method is idempotent without a unique key on the rows?
+ Replace the full partition for the run date
- Merge on the key
- Append, then remove duplicates later
! Overwriting a partition does not need to identify individual rows. It replaces all rows for the period.
::end
