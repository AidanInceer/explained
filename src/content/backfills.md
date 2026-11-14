A pipeline normally processes new data: today’s orders, the last hour of events. A **backfill** runs it for the past. You will do this more often than you expect.

## When you need a backfill

- **A defect was corrected.** The revenue logic was wrong for three weeks. The code is now correct, and three weeks of output are not.
- **The logic changed.** Finance wants refunds subtracted. History must use the same rule, or the chart has a step in it.
- **A new table or column.** A new model starts empty and needs its history.
- **The source sent corrections.** A partner sends a new file for last month.
- **An outage.** The pipeline did not run for two days.

## What makes a backfill safe

A backfill is the same job, run many times for old periods. It is safe only if the job has two properties.

**1. The job takes its period as a parameter.** The job must process “the data for the date I am given”, not “the data for today”. In an [orchestrator](/lesson/orchestration) this is the logical date of the run.

```sql
-- wrong: depends on when it runs
where order_date = current_date - 1

-- correct: depends on the run parameter
where order_date = '{{ ds }}'
```

**2. The job is [idempotent](/lesson/idempotency).** A run for 3 June replaces the output for 3 June. If it adds rows, each backfill doubles the data.

The standard pattern has both: **overwrite one partition for each run**. Maxime Beauchemin describes this in his essay on functional data engineering. A partition is the unit of work. To backfill is to run again for a list of partitions.

## Things that go wrong

**The past is not available.** The source keeps 30 days and you need 90. A state table shows only the present, so a run for March reads today’s customer addresses. This is the strongest reason to keep **raw, immutable copies** of what you ingested. You can then build again from your own storage.

**Dimensions have changed.** A backfill of March sales joined to today’s product categories puts old sales in new categories. If history must be as it was, the dimension needs [Type 2 history](/lesson/scd), and the join must use the dates.

**Load on shared systems.** A backfill of two years is 730 daily runs. Run all at once, they can use all of the warehouse and delay the normal jobs. Limit the number of parallel runs, use a separate compute pool, and run outside working hours.

**Cost.** 730 runs cost about 730 times one run. Estimate before you start. Often one query for a large range of dates is much cheaper than one query for each day.

**Downstream tables.** A corrected table is used by other tables, and those by dashboards. Each one must also be built again, in order. The [lineage graph](/lesson/observability-lineage) tells you which.

**Consumers see the change.** Numbers that people saw last week are now different. Tell them before the backfill, with the reason and the size of the change.

## A procedure

1. Find the range of dates and the tables that are affected.
2. Confirm that the source data for that range exists.
3. Test on one day. Compare the result with the old output and explain each difference.
4. Estimate the time and the cost of the whole range.
5. Tell the consumers.
6. Run in sections, the most recent first, with limited parallelism. Recent data is used most.
7. Run the data tests on the result.
8. Build the downstream tables again.

For a very large or risky backfill, write to a new table, compare it with the old one, and then exchange the two in one step. Table formats with snapshots let you go back if the result is wrong.

## Late data: a small backfill each day

**Late-arriving data** is the same problem in a continuous form. An order made at 23:58 on 3 June can reach your platform at 00:20 on 4 June. A mobile application with no network sends its events a day later.

If the job for 3 June ran at 00:05, that order is in no daily table, or it is in the wrong one.

| Method | How it works | Cost |
|---|---|---|
| **Wait** | Run the job later, for example at 03:00 | Data is less fresh. Very late records are still missed |
| **Reprocess a window** | Each run builds the last 3 days again, not only the last one | Three times the compute. Simple and reliable |
| **Partition by event date, merge by key** | Late rows are merged into the partition of their event date | More complex logic. Old partitions change |
| **Accept and mark** | Publish early as provisional. Mark a period as final after a fixed delay | Consumers must understand the two states |

The second method is the most common. An incremental model that always processes the last few days corrects itself. Choose the length of the window from a measurement: for each row, compare the event time with the load time, and look at the distribution.

Always store the two times: **event time** (when it occurred) and **load time** (when you received it). Without the second, you cannot see lateness at all. For streams the same problem is handled with [watermarks](/lesson/windows-and-time).

> **Pitfall.** A filter on load time for a report by event time. “Rows loaded yesterday” and “events of yesterday” are different sets. Decide which one each table means and write it in the description.

> **Pitfall.** `current_date` or `now()` in transformation logic. The job gives a different result each day it runs, and a backfill cannot reproduce the past.

::scenario
? A defect made the daily revenue table wrong for the last 45 days. The correction is merged. Each daily run overwrites its own partition.
+ Run the job again for the 45 dates, a few at a time, then rebuild the tables that depend on it | The job is parameterised and idempotent, so this is routine. Limited parallelism protects the normal runs.
~ Write a single UPDATE statement that corrects the 45 days directly | It is fast. The correction is now in a script that is separate from the pipeline, and the two can disagree.
- Wait: the new code will produce correct numbers from today | History stays wrong, and each comparison with last month shows a false change.
::end

## Remember

- A backfill runs the normal job for past periods. It is routine work, not an emergency method.
- It is safe when the job takes its date as a parameter and overwrites its own partition.
- Keep raw copies, so that the past can be built again.
- Late data needs a window of reprocessing. Measure the lateness to choose the window.
- Do not use the current time in transformation logic.

::quiz
? A daily job filters on `current_date - 1`. Why can it not be backfilled?
+ Each run processes yesterday, whatever date you intended to rebuild
- It uses too much memory
- It writes Parquet files
! The period must be an input. A job that derives it from the clock can only ever process “yesterday”.
::end
