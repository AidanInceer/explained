You write SQL that says *what* you want. The engine decides *how* to get it. When a query is slow, the cause is nearly always in that “how”. To find it you must be able to read the plan.

This applies to all the engines: Snowflake, BigQuery, Spark, Trino, DuckDB and Postgres go through the same steps.

## From text to result

1. **Parse.** The SQL text is checked and turned into a tree.
2. **Analyse.** Table and column names are resolved against the catalogue. Types are checked.
3. **Logical plan.** A tree of operations: scan, filter, join, aggregate.
4. **Optimise.** The engine rewrites the plan into an equivalent one that is cheaper.
5. **Physical plan.** Each logical operation gets a specific algorithm, and the plan is divided into stages that can run in parallel.
6. **Execute.** Workers run the stages and exchange data between them.

## What the optimiser does

Three rewrites give most of the benefit.

**Predicate pushdown.** Filters are moved as near to the data as possible. A filter on `order_date` is applied when files are selected ([partition pruning](/lesson/partitioning)) and when blocks are read ([statistics](/lesson/clustering)), not after a join.

**Projection pushdown.** Only the columns that the query uses are read. In a [column store](/lesson/row-vs-column) the other columns are never touched.

**Join order and join method.** For a query with five joins there are many possible orders. A **cost-based optimiser** uses statistics about the tables (row counts, distinct values) to estimate the size of each intermediate result, and joins the small results first.

The optimiser is only as good as its statistics. If it believes that a table has 1,000 rows and it has a billion, it will choose a bad plan.

## The three join methods

::fig joins | Change the size of the second table to see which method the engine chooses.

| Method | How it works | Good when | Problem when |
|---|---|---|---|
| **Broadcast hash join** | Copy the small table to every worker. Build a hash table. Each worker looks up its own rows | One side is small: megabytes, not gigabytes | The “small” side is not small. Workers run out of memory |
| **Shuffle hash join** | [Shuffle](/lesson/distributed-processing) both sides by the join key. In each partition, build a hash table of one side | Both sides are large, one fits in memory per partition | A key with very many rows |
| **Sort-merge join** | Shuffle both sides, sort by key, walk through both in order | Both sides are very large. It can use disk | The sort is slow |

The broadcast join avoids the shuffle of the large table, so it is much faster. Engines choose it automatically when the statistics say that one side is under a size limit. A wrong or missing statistic is a common reason that a fast join becomes a slow one.

## How to read a plan

Put `EXPLAIN` before a query to see the plan. `EXPLAIN ANALYZE` also runs it and shows real numbers. Cloud warehouses show the same information as a graphical **query profile**.

```
Aggregate  [country, sum(amount)]
└─ HashJoin  [o.customer_id = c.customer_id]   (broadcast right)
   ├─ Scan orders      partitions: 30 of 1,460   columns: 3 of 42
   │    filter: order_date >= '2025-06-01'
   └─ Scan customers   rows: 180,000
```

Read it from the bottom. Look for these things:

1. **Partitions and files read.** “30 of 1,460” means that pruning works. “1,460 of 1,460” with a date filter means that it does not: look for a function on the filter column.
2. **Columns read.** A plan that reads 42 of 42 columns comes from `SELECT *`.
3. **Join methods.** A shuffle join against a small dimension table means that the engine does not know that it is small.
4. **Rows in and rows out of each step.** A join that gives more rows than its largest input is a [fan-out](/lesson/sql-and-queries).
5. **Estimated and actual rows.** A large difference points to old statistics.
6. **Where the time went.** One step usually takes most of it. Correct that step first.
7. **Spill to disk.** A step that did not fit in memory. It still works, and it is many times slower.

## Common causes of a slow query

| Sign in the plan | Probable cause | Correction |
|---|---|---|
| All partitions scanned | Filter uses a function, or is on the wrong column | Filter on the partition column directly |
| All columns read | `SELECT *` | Name the columns you need |
| Rows multiply after a join | Join key is not unique on one side | Aggregate or remove duplicates before the join |
| Shuffle join with a small table | Statistics are missing | Collect statistics, or give a broadcast hint |
| One task much slower than the others | A skewed key | See [skew and tuning](/lesson/spark-tuning) |
| Spill to disk in a sort or aggregate | Too much data for each task | Filter earlier. Aggregate earlier. More partitions |
| `ORDER BY` on a very large result | A global sort needs all the data in order | Sort only the final small result, or remove the sort |

## Adaptive execution

Modern engines change the plan while it runs. Spark’s adaptive query execution measures the real size of each stage’s output. It can then change a sort-merge join to a broadcast join, combine many small shuffle partitions, and split a skewed one. This corrects many problems that came from bad estimates, but it cannot repair a query that reads data it does not need.

> **In practice.** Before you add compute to a slow query, look at how much data it reads. To read less is nearly always the largest and cheapest improvement.

## Remember

- The engine turns SQL into a logical plan, optimises it, and chooses algorithms.
- Pushdown of filters and columns means that less data is read. Check the plan to confirm it.
- A broadcast join avoids the shuffle when one side is small.
- Read plans from the bottom: data read, join method, row counts, time.
- Good plans need current statistics.

::quiz
? A plan shows “partitions: 1,460 of 1,460” for a query with `WHERE DATE(created_at) = '2025-06-03'`. What is the probable cause?
+ The function on the column prevents partition pruning
- The table has too few partitions
- The join is a broadcast join
! Many engines cannot match a function result against partition values. Filter on the stored column with a range.
::end
