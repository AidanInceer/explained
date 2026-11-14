---
title: How to debug a pipeline
summary: A number is wrong. Work backward along the lineage, halve the search at each step, and compare a good day with a bad day.
track: ops
level: core
minutes: 10
at: [0, 4]
prereqs: [observability-lineage]
tech: [quality, monitor, vcs]
refs:
  - sre: Ch. 12, Effective Troubleshooting
  - fode: Ch. 2, “DataOps” undercurrent
---
Debugging is a skill of its own, and a large part of the [day-to-day work](/lesson/working-day). Engineers who debug well are not the ones who know the most. They follow a method and do not guess. The chapter on troubleshooting in Google’s *Site Reliability Engineering* describes the same loop: observe, form a theory, test it, repeat.

There are two kinds of problem, and they need different starting points.

| Kind | Sign | Start with |
|---|---|---|
| **The pipeline failed** | A red task. An error message | The log |
| **The data is wrong** | Everything is green. A number looks wrong | The data |

The second kind is harder and more common.

## First, before any investigation

1. **Can you reproduce it?** Get the exact query, table, date and number from the person who reported it. “The dashboard is wrong” is not enough. “Revenue for Spain on 3 June shows 41,000, and finance has 52,000” is.
2. **Is it still happening, and is it spreading?** If bad data is being read by other jobs or sent to other systems, [stop the spread](/lesson/incidents-reliability) first.
3. **What changed?** Most problems follow a change. Look at the recent deployments, the recent source changes, and the first day on which the number was wrong.

The third question solves a large share of cases in minutes, if the code is in [version control](/lesson/software-engineering) and the deployments are recorded.

## When a task fails

**Read the whole error.** The useful line is often the first exception in the log, not the last. The last one is usually “task failed”.

**Classify it.**

| Error | Usual cause | Action |
|---|---|---|
| Timeout, connection reset, `429`, `503` | Transient | Rerun. If it repeats, look at the other system |
| Permission denied | A role or a policy changed, or a credential expired | See [secrets and access](/lesson/secrets-access) |
| Column or table not found | The schema changed upstream | Look at the source. See [schema evolution](/lesson/schema-evolution) |
| Out of memory | Data grew, or a key is [skewed](/lesson/spark-tuning) | Look at the volume and the partitions |
| Unique key or constraint error | Duplicates in the source, or a step that is not [idempotent](/lesson/idempotency) | Find the duplicate rows |
| Type or parse error | A value that the code did not expect | Find the row. Look at it |
| Disk full, quota exceeded | Growth, or a missing clean-up | Free space. Then find what grew |

**Ask why now.** The job ran for 200 days. What is different today: the volume, a new value, a new version, the date (month end, a clock change, 29 February)?

## When the data is wrong: work backward

A wrong number in a dashboard came through a chain: source → raw → staging → model → mart → dashboard. The defect is in exactly one link. The method is to find which.

### 1. Make the problem small

Reduce it to **one row or one key** that is wrong. Not “revenue is too low”, but “order 88231 has an amount of 0 in the mart, and 59.90 in the source”. One concrete row can be followed. A total cannot.

To find such a row, cut the total by dimensions: by day, then by country, then by product, until the difference is in a small group.

### 2. Follow it through the layers, by halves

Use the [lineage](/lesson/observability-lineage) to list the tables between the source and the report. Then check the **middle** table for your row.

- Is it correct there? Then the defect is after it.
- Is it wrong there? Then the defect is at or before it.

Each check removes half of the chain. With eight steps, three checks find the link. This is a **binary search**, and it is much faster than reading the code from the top.

### 3. At the faulty step, compare input and output

Run the step’s query for your one row. Remove parts of the logic one by one: the joins, the filters, the aggregation. See at which point the row becomes wrong or disappears.

The usual causes:

| What you see | Usual cause |
|---|---|
| The row is **missing** | A filter that excludes it. An inner join with no match. A `NULL` in a join key or in a `not in` list |
| The row appears **several times** | A join that is not one-to-one. See [fan-out](/lesson/sql-and-queries) |
| The value is **`NULL`** | A left join with no match. A failed cast |
| The value is **wrong by a factor** | Units (cents and euros). Duplicates. A sign |
| It is on the **wrong day** | Time zone. Event time and load time are mixed |
| It is correct for old data and wrong for new | A source change. A new category or status value |
| It is correct today and was wrong yesterday | [Late data](/lesson/backfills). The number was read before the data was complete |

### 4. Compare a good case with a bad case

If one day, country or customer is correct and another is wrong, the difference between them contains the cause. Compare the row counts at each step for the two. Compare the distinct values of the status columns. Something will differ.

This is the most productive single technique. Use [table history](/lesson/table-formats) to compare a table with itself as it was yesterday.

## Row counts are the stethoscope

Before and after each join, filter and aggregation, the number of rows must be what you expect. Write the counts down.

```sql
select 'orders' as step, count(*) as n, count(distinct order_id) as keys from stg_orders
union all
select 'after join to payments', count(*), count(distinct order_id) from joined
```

If `n` is larger than `keys` after a join, the join multiplies rows. If `keys` falls, the join loses rows. Most defects in SQL transformations are visible in these two numbers.

## Is it a defect, or a definition?

Many “wrong numbers” are two correct numbers with different definitions. Before you look for a defect, compare:

- the **filters**: test orders, cancelled orders, internal users;
- the **date**: order date, payment date, shipping date;
- the **time zone** and where the day ends;
- **gross or net**, with or without tax;
- the **moment** the number was read.

If the definitions differ, the correction is in the [semantic layer](/lesson/semantic-layer) or in the documentation, not in the pipeline.

## Performance problems

A job that is slow, not wrong, uses the method of the processing line: find the slow step in the plan, then ask what it reads and what it moves. See [the worked example](/lesson/worked-slow-query) and [skew and shuffles](/lesson/spark-tuning). If the job was fast last week, compare the two runs: the volume, the plan and the number of files.

## Problems that come and go

A failure that occurs once in ten runs is the hardest kind. Useful questions:

- **Timing:** does it depend on the hour, on another job that runs at the same time, or on the order of two events?
- **Data:** does it need a rare value? Keep the input of each failed run.
- **Resources:** does it occur when memory or connections are short?
- **Order without a tie-break:** a `row_number()` with ties, or a `limit` with no `order by`, gives a different result on each run.

Add logging of counts and keys at each step, and wait for the next occurrence with more information.

## After the repair

1. **Correct the data**, not only the code: [backfill](/lesson/backfills) the affected period, and the tables downstream.
2. **Add the test** that would have found it. Each incident should leave one behind.
3. **Tell the consumers** what was wrong, for which period, and that it is corrected.
4. **Write it down**: the sign, the cause and the repair, in a place that the next person will search.

## Use the tools, with care

An [AI assistant](/lesson/ai-for-data-engineering) is good at explaining an error message and suggesting causes. It does not know your data. Give it the error, the query and the counts, and then confirm its theory in the system before you act.

> **Pitfall.** Changing things until it works. You do not know which change mattered, or if the problem is solved or only hidden. Form one theory, test it, and write down the result.

> **Pitfall.** A rerun as the repair. The job passes the second time, and nobody asks why it failed the first time. If it was not a clear transient error, it will return.

::scenario
? Daily revenue is 12% too high since Tuesday. All pipeline runs are green.
+ Look at what was deployed and what changed in the sources on Monday and Tuesday. Then find one order that is counted more than once and follow it | A sudden step on a known date points to a change. A total that is too high usually means repeated rows, and one such row shows which join does it.
~ Read the SQL of the revenue model from the top | You may find it. With 400 lines and five upstream models, a search by halves with one concrete row is much faster.
- Rerun the pipeline for the week | The same logic on the same data gives the same wrong number.
::end

## Remember

- Get an exact, reproducible case. Then ask what changed.
- For a failed task, read the first error and classify it. Ask why today.
- For wrong data, reduce it to one row and search the chain by halves.
- Count rows and distinct keys before and after each step.
- Compare a good case with a bad one.
- After the repair: backfill, add a test, tell the consumers, write it down.

::quiz
? A pipeline has eight steps between the source and the report. One order has a wrong value in the report. What is the fastest way to find the faulty step?
+ Check the order in the middle table, then in the middle of the half that contains the error
- Check each table in order from the source
- Rerun all eight steps
! Each check removes half of the remaining steps. Three checks are enough for eight steps.
::end
