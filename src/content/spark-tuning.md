---
title: Skew, shuffles and small files
summary: "Most slow distributed jobs have one of four causes: a skewed key, too much shuffle, too little memory for a partition, or too many small files."
track: processing
level: deeper
minutes: 9
at: [0, 4]
prereqs: [worked-slow-query]
tech: [batch, tableformats]
refs:
  - spark: Part IV, performance tuning
  - ddia: Ch. 10, “Handling skew”
---
A distributed job that is slow or that fails usually has one of four causes. This lesson uses Apache Spark for the names, because it is the most common engine for large batch work, but the same four causes appear in every distributed engine.

Start with the Spark UI, or the query profile of your platform. Do not change settings before you have seen where the time goes.

## 1. Skew: one key has most of the rows

A [shuffle](/lesson/distributed-processing) sends all rows with the same key to the same partition. If one key has far more rows than the others, one partition is far larger than the others.

::fig skew | Rows in each of eight tasks after a group by customer. Then the same job with a salted key.

The signs: a stage where nearly all tasks finish fast and one or two run for a very long time, or fail with an out-of-memory error. In the task list, the maximum duration and input size are many times the median.

Usual causes: a `NULL` or default value in the join key (all the nulls go to one partition), one very large customer, or a join on a column with few distinct values.

| Correction | How |
|---|---|
| Remove the bad key | Filter out nulls before the join and handle them separately |
| Broadcast the small side | No shuffle of the large table, so no skew |
| Let the engine split it | Spark’s adaptive execution splits skewed partitions in joins automatically |
| **Salt** the key | Add a random number from 0 to N−1 to the frequent key on one side, and copy the matching rows N times on the other side. The big key becomes N medium keys |
| Aggregate in two steps | Group by key and salt first, then group by key |

## 2. Shuffle: too much data moves

The shuffle is the most expensive operation: data is serialised, sent across the network and often written to disk. Each `JOIN`, `GROUP BY`, `DISTINCT`, window function and `ORDER BY` can cause one.

- **Filter and select early.** Remove rows and columns before the join, not after it.
- **Broadcast small tables** so that the large one does not move.
- **Aggregate before a join**, if it reduces the rows.
- **Avoid repeated shuffles on the same key.** Tables that are stored bucketed by the join key can be joined with no shuffle.
- **Do not sort what you do not need sorted.**

## 3. Partition size: too large or too small

Each task processes one partition in memory.

- **Partitions too large**: the task uses more memory than the executor has. It spills to disk, which is slow, or it fails.
- **Partitions too small**: thousands of tasks that each do almost nothing. The time goes into scheduling.

A target of 100 to 200 MB for each partition is a common guide. The number of partitions after a shuffle is a setting (`spark.sql.shuffle.partitions`, 200 by default). Adaptive execution can combine small partitions automatically, which is one reason to keep it on.

`repartition(n)` makes exactly `n` partitions with a full shuffle. `coalesce(n)` reduces the number with no shuffle, by joining neighbours.

## 4. Small files: the output is in too many pieces

Each task writes at least one file for each output partition. A job with 2,000 tasks that writes to 365 date folders can make 730,000 files. Each later reader must list and open all of them. See [object storage](/lesson/object-storage).

Corrections: repartition by the partition column before the write, so that each folder gets a few files. Run compaction (`OPTIMIZE` in Delta, `rewrite_data_files` in Iceberg) on a schedule. Do not partition a table by a column with many values.

## Memory errors

| Message | Where | Usual cause | Correction |
|---|---|---|---|
| Executor out of memory | A worker | A partition is too large, often from skew | Correct the skew. More partitions |
| Driver out of memory | The coordinator | `collect()` of a large result, or a broadcast of a table that is not small | Do not bring large data to the driver. Write it to storage |
| Container killed, exceeded memory limits | A worker, by the cluster manager | Memory outside the JVM, often Python UDFs | More overhead memory. Replace the UDF |

More memory is sometimes the answer. It is not the first answer, because the same data grows and the error returns.

## Things that are slow by nature

- **Python UDFs that process one row at a time.** Each row is moved between the JVM and a Python process. Use built-in functions, which the optimiser can understand, or vectorised (pandas) UDFs.
- **A cache of everything.** `cache()` helps only when the same result is used several times. It uses memory that the job may need.
- **Many small actions.** Each `count()` to print a number in a log runs the whole plan again.
- **Cluster start time.** For a job of two minutes on a cluster that takes five to start, a smaller tool is faster. See [choosing an engine](/lesson/choosing-engine).

## A method

1. Find the slowest **stage**.
2. In that stage, compare the **median and maximum** task time and size. A large difference is skew.
3. Look at the **shuffle read and write** sizes. Can less data go into the shuffle?
4. Look for **spill** to disk.
5. Look at the **number and size of the tasks**.
6. Look at the **input**: how many files, how large, were partitions pruned?
7. Change one thing. Measure again.

> **Pitfall.** Tuning by copying settings from the internet. A list of 30 configuration values hides the one real cause. Find the cause in the UI first.

::scenario
? A join of `events` (3 billion rows) to `users` (2 million rows) takes two hours. The plan shows a sort-merge join. One task runs 100 times longer than the median. 30% of events have a null `user_id`.
+ Filter the null keys out of the join and add them back after, and broadcast `users` | The nulls all go to one partition and match nothing. Without them the skew is gone, and 2 million rows are small enough to broadcast, so the large table is not shuffled.
~ Double the memory of the executors | The task with the nulls may now finish. It is still one task doing 30% of the work, and next month there are more events.
- Increase the number of shuffle partitions to 2,000 | The nulls have one key, so they still go to one partition. The other partitions become too small.
::end

## Remember

- Four causes: skew, shuffle, partition size, small files.
- Skew shows as one task far slower than the median. Null keys are the usual cause.
- Reduce what goes into a shuffle before you change any setting.
- Aim for partitions and files of about 100 MB to 1 GB.
- Look at the UI, change one thing, measure.

::quiz
? In one stage, 199 tasks take 20 seconds and one takes 40 minutes. What is the most probable cause?
+ Skew: one key has most of the rows
- The cluster has too few machines
- The file format is CSV
! Equal tasks take equal time. One very slow task has a much larger partition, which comes from a frequent key.
::end
