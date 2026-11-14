When data is too large for one machine to process in an acceptable time, you divide the work between many machines. Spark, Trino, BigQuery and Snowflake all do this, and they all do it in the same basic way.

## Divide, process, combine

Two ideas are enough to start.

1. **Partition the data.** Split the dataset into parts, each small enough for one machine. A 1 TB table can be 8,000 parts of about 128 MB.
2. **Send the code to the data.** Each machine runs the same operation on its own parts, at the same time as the others.

Some operations need nothing more. To filter rows or compute a new column, each machine looks at its own rows and does not need the others. These are named **narrow** operations. They scale almost perfectly: twice the machines, half the time.

## The shuffle

Other operations need rows from different machines to meet. To count orders *by country*, all the rows for Portugal must be in one place. They start spread across every machine.

So the engine moves them. Each machine computes a hash of the key for each row, and sends the row to the machine that owns that hash value. After the move, every row with the same key is on the same machine, and the count can be done locally. This move is the **shuffle**.

::fig shuffle | A group-by on country. Before the shuffle, each machine holds a mix of keys. After it, each key is on one machine.

`GROUP BY`, `JOIN`, `DISTINCT` and `ORDER BY` all need a shuffle. These are **wide** operations.

The shuffle is the expensive part of distributed processing. Rows are serialised, sent across the network, and often written to disk. Most performance work on a distributed job is one of two things: do fewer shuffles, or send less data through each one.

## Where this came from

Google's **MapReduce** paper of 2004 described the pattern: a *map* step that runs on each part, a shuffle by key, and a *reduce* step that combines the values for each key. Hadoop was the open-source implementation. It was reliable and slow, because it wrote every intermediate result to disk.

**Spark** kept the model and made it faster. It holds intermediate data in memory, and it plans the whole job as a graph of steps before it runs. It is also **lazy**: transformations such as `filter` and `join` only build a plan. Nothing runs until an action such as `write` or `count` asks for a result. That lets the optimiser reorder the work, for example to filter before a join.

Warehouse engines such as BigQuery and Snowflake use the same principles inside a managed service. You write SQL and the engine decides the partitions and the shuffles.

## Four things that make jobs slow

**1. Data skew.** The hash sends each key to one machine. If one key has far more rows than the others, for example 40% of orders have `country = 'US'` or millions of rows have a null key, one machine gets most of the work. The job waits for that one task while the other machines are idle. Signs: one task runs much longer than the median, or fails with an out-of-memory error. Solutions: filter or handle null keys separately, use the engine's adaptive skew handling, or add a random suffix to the hot key (*salting*) and aggregate in two steps.

**2. A shuffle that can be avoided.** To join a large fact table to a small dimension, the engine does not need to shuffle the large table. It can send a copy of the small table to every machine. This is a **broadcast join**. Engines do it automatically when they know the table is small.

**3. Reading too much.** Filter early, and select only the columns you need, so that [partition pruning](/lesson/partitioning) and column pruning can work. Data that is not read does not need to be shuffled.

**4. Too many or too few partitions.** Thousands of tiny partitions cost more in scheduling than they save. A few very large partitions do not fit in memory. A target of about 100 to 200 MB for each partition is common.

> **Pitfall.** Do not start with a cluster. One machine with DuckDB or Polars can process tens of gigabytes, often faster than a small Spark cluster, because there is no shuffle and no network. Use distributed processing when the data needs it.

## Why this is fault tolerant

With a thousand machines, some machine fails every day. The engine handles this because each task is a pure function of its input partition. If a machine fails, the engine runs its tasks again on another machine. This is the same principle as [idempotent pipelines](/lesson/idempotency), applied inside the engine.

## Remember

- Narrow operations run on each partition independently. Wide operations need a shuffle.
- The shuffle is the main cost. Do fewer, and send less through each one.
- Data skew puts most of the work on one machine. Look for one task that is much slower than the others.

::quiz
? Which of these operations needs a shuffle?
- <code>WHERE amount > 100</code>
- <code>SELECT amount * 1.2</code>
+ <code>GROUP BY customer_id</code>
! A filter and a computed column use only the row itself. A group-by needs all rows with the same key on one machine.
? A Spark job has 200 tasks. 199 finish in 30 seconds and one takes 40 minutes. What is the most likely cause?
+ Data skew: one key has most of the rows
- The cluster is too small
- The file format is wrong
! One slow task among many fast ones is the usual sign of skew. More machines do not help, because the hot key still goes to one of them.
? What does a broadcast join avoid?
+ A shuffle of the large table
- Reading the small table
- The join condition
! The small table is copied to every machine, so each machine can join its own part of the large table locally.
::end
