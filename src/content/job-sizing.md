---
title: "Sizing a job: partitions, memory, cores"
summary: "Simple arithmetic gives a first cluster size: data volume to partitions, partitions to tasks, tasks to cores and memory. Then measure and adjust."
track: processing
level: deeper
minutes: 8
at: [0, 5]
prereqs: [spark-tuning]
tech: [batch, clouds]
refs:
  - spark: Part IV, production applications and tuning
---
“How large must the cluster be?” has no exact answer before the job has run. But simple arithmetic gives a reasonable start, and it also tells you when a number is clearly wrong. This lesson works through one example. The names are from Spark. The reasoning applies to any distributed engine.

## The quantities

| Quantity | Meaning |
|---|---|
| **Input size on disk** | Compressed Parquet |
| **Size in memory** | Often 3 to 10 times the Parquet size, because the data is decompressed and decoded |
| **Partition** | The unit of work of one task |
| **Core** | Runs one task at a time |
| **Executor** | A process with several cores and a share of memory |

The two rules that connect them:

1. **One task works on one partition, on one core, in a share of the executor’s memory.**
2. **A partition must fit in that share of memory.** If it does not, the task spills to disk or fails.

## Example: a daily job

The job reads one day of events, joins them to a users table, aggregates, and writes the result.

- Events for one day: **240 GB** of Parquet.
- Users: **4 GB** of Parquet.
- Compression factor in memory, assumed: **4**.

### Step 1: input partitions

Spark makes about one partition for each 128 MB of input.

`240 GB ÷ 128 MB ≈ 1,900 partitions` → 1,900 tasks in the first stage.

### Step 2: shuffle partitions

The join shuffles the events. The shuffled data, after the filter and the column selection, is perhaps half of the input: 120 GB on disk, so about `120 × 4 = 480 GB` in memory.

Target for each partition: **about 200 MB** in memory.

`480 GB ÷ 200 MB = 2,400 shuffle partitions`

The default is 200. With 200 partitions, each one would be `480 GB ÷ 200 = 2.4 GB`. That is the cause of most “executor out of memory” errors in jobs that worked on small data: nobody changed the default.

With adaptive execution on, set the initial number high (for example 2,400) and let Spark join the small ones.

### Step 3: memory for each task

Each task needs its partition, plus working space for the join or the sort. A common allowance is two to three times the partition.

`200 MB × 3 ≈ 600 MB for each task`

### Step 4: the shape of an executor

An executor with **5 cores** runs 5 tasks at once.

`5 × 600 MB = 3 GB` of working memory. The execution memory is only a part of the heap (about 60% by default), so:

`3 GB ÷ 0.6 = 5 GB heap`, plus about 10% overhead outside the heap → **about 6 GB for each executor**. Round up to 8 GB for safety.

Why 5 cores and not 32? Very large executors have long garbage collection pauses, and they lose much work when one fails. Very small ones have too little memory for each task and more overhead. Four to eight cores is the usual range.

### Step 5: how many executors

This is a choice between time and cost. Total work:

`1,900 + 2,400 = 4,300 tasks`, at perhaps 20 seconds each → `86,000 task-seconds`.

| Executors | Cores | Time, about | Note |
|---|---|---|---|
| 10 | 50 | 29 min | |
| 20 | 100 | 14 min | |
| 40 | 200 | 7 min | |
| 80 | 400 | 4 min | Little gain. Start-up and the driver now limit the time |

The cost in core-minutes is nearly the same in the first three rows. Within the range where the job scales, **a larger cluster costs about the same and finishes sooner**. Beyond that range, you pay for machines that wait.

A start of 20 executors with 5 cores and 8 GB each is reasonable. With **dynamic allocation**, or an autoscaling cluster, you give a minimum and a maximum, and the platform adds executors while tasks are waiting.

### Step 6: the driver, and the broadcast

The 4 GB users table is 16 GB in memory. That is too large to [broadcast](/lesson/query-engines): the default limit is 10 MB, and a broadcast table must fit in the driver and in each executor. If the job needs only three columns of users, the table may be 300 MB in memory, and a broadcast becomes reasonable with a raised limit. Select the columns first, then decide.

The driver needs little memory unless you collect results to it. 4 to 8 GB is usual.

## Then run it, and correct the estimate

The arithmetic used three assumptions: the compression factor, the part of the data that reaches the shuffle, and the time for each task. After the first run, the [Spark UI](/lesson/spark-job-anatomy) gives the real values.

| What you see | What it means | Correction |
|---|---|---|
| Shuffle partitions of 5 MB each | Far too many partitions | Fewer partitions, or let adaptive execution join them |
| Spill to disk, long GC time | Partitions too large for the memory | More partitions first. Then more memory |
| One task much larger than the others | [Skew](/lesson/spark-tuning) | Correct the skew. Size does not solve it |
| Executors mostly idle | Too many executors, or one long stage that does not run in parallel | Fewer executors. Look at that stage |
| CPU low, tasks waiting on input | The storage or the network is the limit | More cores do not help |

Change **the number of partitions before the memory**. More partitions cost nothing. More memory costs money, and the same data will be larger next quarter.

## Sizes for other engines

The same reasoning, with other names:

- **Warehouse sizes** (Snowflake and others): each size up has about twice the compute at twice the price for each second. If a query takes half the time on the next size, the cost is the same. Test it. A query that does not get faster is limited by something that more compute does not help, often one skewed step.
- **Serverless engines** (BigQuery, Athena): you do not size anything. You control the bytes scanned.
- **Streaming jobs**: size for the **peak** rate of events, not the average, and for the size of the state. Parallelism cannot be more than the number of [partitions of the topic](/lesson/message-brokers).

## Is a cluster needed at all?

Before any of this, compare the data with one machine. 240 GB of Parquet needs a cluster. 8 GB does not: [DuckDB or Polars](/lesson/choosing-engine) on a machine with 32 GB of memory will finish before a cluster has started.

> **Pitfall.** A configuration copied from another job. The correct values depend on the size and the shape of this job’s data. Copy the method, not the numbers.

> **Pitfall.** Sizing for the largest day of the year, every day. Use autoscaling, or a separate configuration for the peak.

## Remember

- One task, one partition, one core. The partition must fit in the task’s share of memory.
- Aim for about 100 to 200 MB of data in memory for each shuffle partition.
- Executors of four to eight cores are a good default.
- Within the range where a job scales, a larger cluster costs about the same and is faster.
- Estimate, run, read the UI, correct. Change partitions before memory.

::quiz
? A shuffle moves 400 GB (in memory) into the default 200 partitions. What is the size of each partition, and the probable result?
+ 2 GB each. Tasks spill to disk or fail with out-of-memory errors
- 200 MB each. The job runs well
- 2 MB each. The job has too many small tasks
! 400 GB ÷ 200 is 2 GB for each task. Raise the number of shuffle partitions to about 2,000.
::end
