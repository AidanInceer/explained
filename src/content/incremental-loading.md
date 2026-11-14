---
title: Full and incremental loads
summary: Copy everything each run, or copy only what changed. Incremental loads need a reliable way to find the changes.
track: pipelines
level: core
minutes: 9
at: [0, 2]
prereqs: [ingestion-patterns]
tech: [ingestion, transformation]
refs:
  - fode: Ch. 7, Ingestion
  - kimball: Ch. 19 and 20, ETL subsystems
---
Each time a pipeline runs, it must decide how much data to copy. The two basic answers are all of it, or only what changed.

## Full load

Copy the complete source table and replace the target.

It is the simplest method, and it is always correct: the target is an exact copy of the source at extract time. It also handles deleted rows with no extra work, because a row that is gone from the source is gone from the new copy.

Use a full load when the table is small, for example a table of 5,000 products or 200 countries. Many pipelines use incremental logic for tables where a full load would take ten seconds.

It stops working when the table is large. Copying 500 million orders each night, when 200,000 are new, wastes time and money and puts load on the source.

## Incremental load

Copy only the rows that are new or changed since the last run. For this, the pipeline needs a way to find them.

### Method 1: a high-water mark

If the table has a column that only increases, such as an `updated_at` timestamp or an auto-increment id, save the largest value you have loaded. On the next run, ask for rows above it.

```sql
SELECT * FROM orders
WHERE updated_at > :last_loaded_updated_at;
```

After a successful load, save the new maximum. The saved value is the **high-water mark**, also named a cursor or a bookmark.

Then apply the extracted rows to the target with an **upsert**, which is a `MERGE`: update the row if the key exists, insert it if it does not.

### What the high-water mark does not see

This method is common, and it has four failure modes that you must know:

1. **Hard deletes.** A deleted row has no `updated_at`. It is absent. The query cannot return it, and the target keeps the row. Solutions: the source uses soft deletes (a `deleted_at` column), or you run a full comparison of keys from time to time, or you use [change data capture](/lesson/cdc).
2. **Columns that are not maintained.** If one code path updates a row and does not set `updated_at`, you do not see the change. Check that a database trigger, and not application code, sets the column.
3. **Late commits.** A transaction starts at 09:59:58, sets `updated_at` to that time, and commits at 10:00:03. Your extract ran at 10:00:00 and saved a mark of 10:00:00. The row becomes visible later with a timestamp *below* the mark, and is never loaded. The usual protection is an overlap: extract again from the mark minus a safety interval, and rely on the upsert to remove the duplicates.
4. **Equal timestamps.** If you use `>` and several rows have the same timestamp as the mark, some can be missed. If you use `>=`, some are loaded twice. Use `>=` with an upsert.

### Method 2: partitions of immutable events

If the data is events that never change after they are written, such as clicks, log lines and sensor readings, there is nothing to update. Each run loads one period of time, for example yesterday, into its own partition. This is the simplest and most reliable form of incremental load, and the next lesson, [Idempotent pipelines](/lesson/idempotency), is based on it.

### Method 3: read the database log

Change data capture reads every insert, update and delete from the database's transaction log. It sees deletes and every intermediate change, and it puts little load on the source. It needs more setup. See [Change data capture](/lesson/cdc).

## Comparison

| Method | Sees updates | Sees deletes | Load on source | Complexity |
|---|---|---|---|---|
| Full load | Yes | Yes | High | Lowest |
| High-water mark | Yes, if the column is reliable | No | Low | Low |
| Event partitions | Not applicable | Not applicable | Low | Low |
| Change data capture | Yes, every change | Yes | Lowest | Highest |

> **Rule of thumb.** Start with full loads. Change a table to incremental when its size makes that necessary, and write down which of the four failure modes can apply to it.

## Remember

- A full load is simple and correct. Use it for small tables.
- A high-water mark finds new and changed rows. It does not find hard deletes.
- Extract with an overlap and apply with an upsert, so that late and repeated rows do no harm.

::quiz
? An incremental load uses <code>WHERE updated_at > last_mark</code>. A customer row is deleted in the source. What occurs in the target?
- The row is deleted on the next run
+ The row stays, because the query cannot return a row that does not exist
- The pipeline fails
! A deleted row is absent from the result. The target needs soft deletes, a periodic key comparison or change data capture to learn about it.
? Why extract with an overlap, such as the mark minus 10 minutes?
+ To get rows from transactions that committed after the extract but have a timestamp before the mark
- To make the load faster
- To avoid the need for a primary key
! A row can become visible with a timestamp that is already below the saved mark. The overlap reads that interval again, and the upsert removes the duplicates.
::end
