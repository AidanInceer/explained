---
title: Anatomy of a Spark job
summary: Transformations build a plan and do nothing. An action runs it as jobs, stages and tasks. A stage ends at each shuffle.
track: processing
level: core
minutes: 9
at: [0, 1]
prereqs: [distributed-processing]
tech: [batch, clouds]
refs:
  - spark: Part II, structured APIs, and Ch. 15, How Spark Runs on a Cluster
  - ddia: Ch. 10, “Beyond MapReduce”
---
The lesson on [distributed batch processing](/lesson/distributed-processing) explained the idea: partitions, parallel work, and a shuffle when rows must meet. This lesson shows how Apache Spark turns your code into that work. With these terms you can read the Spark UI, and the two tuning lessons that follow need them.

## The parts of a running application

| Part | What it does |
|---|---|
| **Driver** | One process. It runs your program, makes the plan and tells the executors what to do |
| **Executors** | Many processes on the worker machines. They hold data in memory and run the tasks |
| **Cluster manager** | Gives machines to the application: YARN, Kubernetes, or the platform’s own |

Data is on the executors. The driver holds the plan and small results only. This is why `collect()` on a large DataFrame fails: it tries to bring all rows to the one driver.

## Transformations are lazy. Actions run them

```python
orders = spark.read.parquet("s3://lake/orders/")          # nothing is read
paid   = orders.filter(orders.status == "paid")           # nothing runs
by_cty = paid.groupBy("country").sum("amount")            # nothing runs

by_cty.write.parquet("s3://lake/revenue_by_country/")     # now everything runs
```

A **transformation** (`filter`, `select`, `join`, `groupBy`) returns a new DataFrame and only adds a step to a plan. An **action** (`write`, `count`, `collect`, `show`) asks for a result, and Spark then runs the whole plan.

Laziness lets the [optimiser](/lesson/query-engines) see everything before any work starts. It can push the `status` filter into the file read, and read only the three columns that the query uses.

It also has a consequence that surprises beginners: **each action runs the plan again from the start**. If you call `count()` to print a number and then `write()`, the data is read and filtered twice.

## Narrow and wide transformations

- A **narrow** transformation works on each partition alone: `filter`, `select`, `withColumn`. No rows move between machines.
- A **wide** transformation needs rows from many partitions to meet: `groupBy`, `join`, `distinct`, `orderBy`, `repartition`. It causes a **shuffle**.

::fig shuffle | A group by country. The rows of each country are on several machines, so they must be moved before they can be counted.

## Jobs, stages and tasks

These three words are the structure of the Spark UI.

| Unit | Is created by | Contains |
|---|---|---|
| **Job** | Each action | One or more stages |
| **Stage** | Each shuffle boundary | A set of narrow steps that run together |
| **Task** | Each partition of a stage | The work of one stage on one partition, on one executor |

For the example above:

```
Job 0  (the write)
├─ Stage 0   read Parquet → filter status → partial sum by country
│            200 tasks  (one for each input partition)
│            ── shuffle: rows are sent by hash of country ──
└─ Stage 1   final sum by country → write Parquet
             200 tasks  (spark.sql.shuffle.partitions)
```

Read it as follows. Spark puts as many narrow steps as it can into one stage, and runs them as one pass over each partition. At a wide transformation the stage ends, its output is written to shuffle files, and the next stage starts by reading them.

So: **the number of stages is the number of shuffles plus one.** A job with nine stages has eight shuffles, and that is where its time goes.

Note the “partial sum” in stage 0. Spark aggregates inside each partition before the shuffle, so that it sends one row for each country from each partition, not each order. This is why an aggregation moves much less data than a join.

## Where the number of partitions comes from

| Point | Number of partitions | Setting |
|---|---|---|
| Reading files | About total size ÷ 128 MB | `spark.sql.files.maxPartitionBytes` |
| After a shuffle | 200 by default | `spark.sql.shuffle.partitions` |
| After `repartition(n)` | `n`, with a shuffle | |
| After `coalesce(n)` | `n`, with no shuffle | |

With **adaptive query execution** (on by default in current versions), Spark looks at the real size of the shuffle output and joins small partitions together. The 200 is then a starting value and not a fixed one.

## How to read the Spark UI

Open the UI of the application, or the history server after it ends.

1. **Jobs tab.** Which job took the longest?
2. **Stages of that job.** Which stage? Look at its duration, its **input size**, its **shuffle read** and its **shuffle write**.
3. **Tasks of that stage.** Look at the summary table: minimum, median and maximum of duration and of size. If the maximum is far above the median, the cause is [skew](/lesson/spark-tuning).
4. **SQL tab.** The plan as a diagram, with the real row counts at each step. This is where you see a join that multiplies rows, or a scan that reads every partition.
5. **Executors tab.** Memory in use, time in garbage collection, failed tasks.

Three numbers in the stage view tell most of the story:

| Sign | Meaning |
|---|---|
| **Spill (disk)** is more than zero | A partition did not fit in memory. It works, and it is slow |
| **GC time** is more than about 10% of task time | Too little memory for each task |
| **Shuffle write** is as large as the input | Nothing was filtered or aggregated before the shuffle |

## Cache, and when it helps

Because each action runs the plan again, a DataFrame that is used several times is computed several times. `df.cache()` keeps the result in executor memory after the first computation.

Use it when the same intermediate result feeds **two or more** actions and is expensive to compute. Do not use it for a DataFrame that is used once. It then costs memory and gives nothing. Call `unpersist()` when you are finished.

## The same ideas in SQL

All of this applies if you write SQL and not Python. A SQL query in Spark, Databricks, Trino or a warehouse becomes the same kind of plan with the same stages. The warehouse shows it as a query profile. The words differ and the structure does not.

> **Pitfall.** `df.count()` in a log line before each step, “to see progress”. Each one is an action that runs the full plan to that point. A job with five such lines does the work about five times.

> **Pitfall.** A Python loop over rows, with `collect()` or `toPandas()`. The data leaves the cluster and is processed on one machine. Express the logic as DataFrame operations or SQL.

## Remember

- The driver plans. The executors hold the data and do the work.
- Transformations build a plan. An action runs all of it, each time.
- Narrow transformations stay in a partition. Wide ones shuffle.
- A job is one action. A stage ends at a shuffle. A task is one partition of one stage.
- In the UI, find the slow stage, then compare the median and the maximum task.

::quiz
? A program calls `df.count()`, then `df.write.parquet(...)`, with no cache. How many times is the source read?
+ Two times, once for each action
- Once
- Zero times, because transformations are lazy
! Each action runs the plan from the start. Without a cache, nothing is kept between actions.
? A job has seven stages. How many shuffles does it have?
- Seven
+ Six
- It cannot be known
! A stage ends at each shuffle, so the number of shuffles is the number of stages minus one.
::end
