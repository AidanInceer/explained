---
title: Partitioning and pruning
summary: Split a table into folders by a column such as date. A query with a filter on that column skips every other folder.
track: storage
level: core
minutes: 8
at: [0, 2]
prereqs: [file-formats]
tech: [tableformats, warehouses, object]
refs:
  - fode: Ch. 6, Storage
  - ddia: Ch. 6, Partitioning
---
The fastest way to read data is to not read it. Partitioning arranges a table so that the engine can skip most of it.

## The idea

Choose a column, usually a date. Store the rows for each value of that column in a separate folder:

```
events/
  event_date=2026-03-01/part-000.parquet
  event_date=2026-03-02/part-000.parquet
  event_date=2026-03-03/part-000.parquet
```

When a query has `WHERE event_date = '2026-03-02'`, the engine looks at the folder names, opens one folder and ignores the others. This is **partition pruning**. Warehouses do the same internally, without visible folders.

::fig partitions | Select each WHERE clause. Only a filter on the partition column lets the engine skip folders.

## Choosing the partition column

A good partition column has two properties:

1. **Most queries filter on it.** If analysts always ask about a date range, partition by date. A partition that queries do not filter on gives no benefit.
2. **It has low cardinality.** Cardinality is the number of distinct values. A date column has 365 values in a year. A `user_id` column has millions.

The second point is the common mistake. Partitioning by `user_id` creates millions of folders, each with a tiny file. The engine then spends its time listing folders and opening files, not reading data. This is the **small files problem**.

> **Rule of thumb.** Each partition should hold at least hundreds of megabytes. If a day of data is 50 MB, partition by month. Files of about 100 MB to 1 GB are a good target for Parquet.

## Sorting and clustering inside a partition

Partitioning is coarse. For a high-cardinality column that queries filter on, such as `customer_id`, use sorting.

If the rows inside each file are sorted by `customer_id`, the minimum and maximum statistics in the Parquet footer become narrow. A query for one customer can skip most row groups. See [File formats](/lesson/file-formats). Warehouses name this clustering (BigQuery, Snowflake), sort keys (Redshift) or Z-ordering (Delta Lake).

So the usual design is two levels: **partition** by a low-cardinality column that queries filter on, such as date, and **sort or cluster** by a high-cardinality column that queries filter on, such as customer.

## Partitioning also makes writes safe

A daily job can replace exactly one partition: delete the folder for 5 March and write it again. Nothing else is touched. This is the basis of [idempotent pipelines](/lesson/idempotency).

## Two meanings of the word

"Partitioning" is also used for splitting data across machines in a distributed database or in Kafka, which is sometimes called sharding. The idea is related: divide by a key so that work can be limited to one part. This lesson is about partitions of a table in storage. [Streams and logs](/lesson/streaming-basics) covers partitions in Kafka.

## Remember

- Partition by a column that queries filter on and that has few distinct values. Date is the usual choice.
- Too many partitions cause many small files, which is slower than no partitioning.
- Use sorting or clustering for high-cardinality filter columns.

::quiz
? A table is partitioned by <code>event_date</code>. Which query can use partition pruning?
- <code>WHERE user_id = 42</code>
+ <code>WHERE event_date BETWEEN '2026-03-01' AND '2026-03-07'</code>
- <code>WHERE amount > 100</code>
! Only a filter on the partition column lets the engine exclude folders from the names alone.
? A team partitions a 200 GB table by <code>customer_id</code>, which has 4 million values. What occurs?
- Queries for one customer become very fast, with no disadvantage
+ Millions of tiny files, and most queries become slower
- The table becomes smaller
! Each partition holds about 50 KB. The cost of listing and opening millions of files is larger than the cost of reading the data. Partition by date and cluster by customer.
::end
