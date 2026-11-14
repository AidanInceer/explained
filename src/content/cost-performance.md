---
title: Cost and performance
summary: Cloud platforms charge for bytes scanned or for compute time. A small number of queries and tables cause most of the bill, and they can be found.
track: ops
level: deeper
minutes: 9
at: [1, 4]
prereqs: [observability-lineage, clustering]
tech: [warehouses, clouds]
refs:
  - fode: Ch. 4, “Cost optimization and business value”, “FinOps”
  - reddit: Recurring threads on warehouse cost
---
On your own hardware, a bad query was slow. In the cloud, a bad query is slow and it sends a bill. Compute that scales without limit also spends without limit. The control of cost is now a normal part of data engineering, and the practice has a name: **FinOps**.

Cost and performance are the same subject. Nearly every method that makes a query faster does so by reading or moving less data, and that also makes it cheaper.

## What you pay for

| Item | Charged by | Typical cause of waste |
|---|---|---|
| **Compute** | Bytes scanned (BigQuery on-demand), or time that a warehouse or cluster runs (Snowflake, Databricks, Redshift) | Full scans. Compute that runs with nothing to do |
| **Storage** | Gigabytes each month | Old copies, snapshots without expiry, data that nobody uses |
| **Data transfer** | Gigabytes that leave a region or a cloud | Engines and data in different regions |
| **Managed services** | Rows synced, events, users | Connectors that sync tables nobody reads |
| **People** | Salaries | Always the largest item. Do not spend a week of an engineer to save 50 a month |

Compute is usually most of the platform bill. Understand the price model of your platform before anything else: in a pay-for-scan model you reduce the bytes read, and in a pay-for-time model you reduce the running time and the size of the machines.

## Find where the money goes

Costs follow a strong pattern: **a small number of queries, tables and jobs cause most of the bill**. Find them before you optimise anything.

Each platform has a log of all queries with their cost: `INFORMATION_SCHEMA.JOBS` in BigQuery, `QUERY_HISTORY` and the metering views in Snowflake, system tables in Databricks. From it, build a small report:

1. The 20 most expensive queries or jobs of the last month, by total cost: cost of one run × number of runs.
2. Cost by **team** and by **pipeline**. This needs **labels** or **tags** on each job and each warehouse. Add them from the first day.
3. Cost by day, to see changes.

The list usually has surprises: a dashboard that refreshes each five minutes for nobody, a model that is built hourly and read weekly, a query that a person runs each morning without a date filter.

## Read less

These come from the storage lessons. They are the largest savings.

- **Partition filters.** Each query on a large table must filter on the [partition](/lesson/partitioning) column. Some platforms can require it.
- **Clustering.** [Sort the table](/lesson/clustering) by the columns that queries filter on.
- **Named columns.** `SELECT *` reads every column of a [column store](/lesson/row-vs-column).
- **Incremental models.** Process the new data, not all of history, on each run. See [SQL transformations and dbt](/lesson/transformation-dbt).
- **Aggregates.** If a dashboard needs daily totals, build a daily table. Do not let each chart aggregate a billion rows.
- **Materialise with thought.** A view that many people read runs its query each time. A table runs it once.

## Run less

- **Schedules that match the use.** A table that is read once a day does not need an hourly build. Check the real read frequency in the query log.
- **Remove what is not used.** Find the tables, models and dashboards with no reads in 90 days, and remove them with their pipelines.
- **Do not build everything.** Run only the changed models in [CI](/lesson/testing-ci-cd).

## Pay less for what runs

- **Auto-suspend.** A warehouse or cluster must stop when it has nothing to do, after one to five minutes.
- **The correct size.** A larger warehouse costs more each second and finishes sooner. For a query that scales well the cost is about the same and you get the answer faster. For a small query, the larger size is waste. Test.
- **Separate workloads.** Give loading, transformation and BI their own compute. Each one can then have the correct size, and a heavy job does not make the dashboards slow.
- **Spot or preemptible machines** for batch jobs that can run again: they cost much less and can be taken away.
- **Commitments.** If the use is stable, a reservation for one to three years gives a large discount. Commit to the base, not the peak.
- **Storage tiers and expiry.** Move old raw data to a colder [storage class](/lesson/object-storage). Set a retention period for snapshots and temporary tables.

## Limits that prevent accidents

- A **maximum bytes billed** for each query, or a time limit.
- **Budgets with alerts** by project or team, at 50%, 80% and 100%.
- **Resource monitors** or quotas that suspend compute at a limit.
- **Alerts on anomalies**: a daily cost far above the usual value.
- Review of the estimated cost in the pull request, for changes to large models.

## Make cost visible to the people who cause it

A central team cannot reduce a bill that 200 people create. Show each team its own cost, each month, with the queries that caused it. This is called **showback**. If the cost is also charged to the budget of the team, it is **chargeback**. Most of the saving comes from the visibility alone: people correct a 400-a-month query when they see that it is theirs.

## Performance without cost thinking

Sometimes the goal is speed. The order of work is the same as for cost:

1. Measure. Find the slow step in the [query plan](/lesson/query-engines).
2. Read less data.
3. Move less data: fewer and smaller shuffles.
4. Compute in advance: aggregates and materialised results.
5. Only then, add compute.

## The compromise

Cost is one of three things that you balance. Fresher data costs more: an hourly build costs up to 24 times a daily one. More reliable systems cost more: copies in two regions double the storage. The task is not the lowest cost. It is the lowest cost that meets the [agreed objectives](/lesson/incidents-reliability), and a clear price for each improvement, so that the business can choose.

> **Pitfall.** Optimisation of what is cheap. Two days of work on a query that costs 3 a month. Sort by total cost and start at the top.

> **Pitfall.** A warehouse that never suspends, because a dashboard queries it each minute. One low-value refresh keeps the compute on for all 24 hours.

::scenario
? The warehouse bill doubled in three months. Nobody knows why.
+ Query the usage log for the most expensive queries and jobs, grouped by owner | Cost is concentrated. This usually shows a few causes in an hour, and each one has a clear correction.
~ Ask every team to reduce their usage by 20% | It can reduce the bill for a time. Nobody knows what to change, and useful work is cut together with waste.
- Change to a different warehouse product | The queries and schedules that caused the cost move with you, and a migration costs months.
::end

## Remember

- You pay mainly for compute. Know if your platform charges by scan or by time.
- A few queries cause most of the cost. Find them in the query log before you change anything.
- Read less, run less, then pay less for what runs.
- Tag everything, set budgets and limits, and show each team its own cost.
- The goal is the lowest cost that meets the agreed objectives.

::quiz
? What is the first step to reduce a data platform bill?
+ Find which queries and jobs cause most of the cost
- Buy a commitment for three years
- Reduce the size of all warehouses
! Without the measurement you optimise at random. A commitment made too early fixes the waste in place.
::end
