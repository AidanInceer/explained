---
title: Sorting, clustering and indexes
summary: Inside a partition, sorted data lets the engine skip files by their minimum and maximum values. This is the analytic replacement for an index.
track: storage
level: deeper
minutes: 8
at: [1, 3]
prereqs: [partitioning]
tech: [warehouses, tableformats, rtolap]
refs:
  - ddia: Ch. 3, “Sort Order in Column Storage”
  - dbinternals: Part I, B-Trees and LSM trees
---
[Partitioning](/lesson/partitioning) lets a query skip whole folders. But you can partition by only one or two columns of low cardinality, such as date. What about a filter on `customer_id`, which has millions of values? The answer is the **order of the rows** inside the files.

## How an OLTP database finds a row: the index

An application database keeps a **B-tree index** on important columns. The index is a sorted tree of values with pointers to the rows. To find `customer_id = 42` among 100 million rows, the database reads about four pages of the tree, not the table.

The index has a cost. Each insert must also update each index, and the index uses storage. This is acceptable when you read a few rows at a time.

Analytic tables mostly do not have B-tree indexes. A query that reads 20% of a table does not gain from a tree of pointers, and to maintain an index during the load of a billion rows is slow. Column stores use a different, cheaper method.

## How a column store skips data: minimum and maximum

A Parquet file, and each block inside it, records the **smallest and largest value** of each column. These are **zone maps** or column statistics. Before it reads a file, the engine compares the filter with the statistics. If `customer_id = 42` and the file holds values from 5,000 to 9,000, the file is skipped without being opened.

This works only if the data is sorted or grouped by that column.

::fig zonemap | The same eight files and the same query. Move the slider, then change how the table is ordered.

With rows in arrival order, each file holds customers from the full range, and the statistics exclude nothing. With the table sorted by `customer_id`, the ranges do not overlap and the engine reads one file.

**Clustering** is the name for keeping a table ordered by one or more columns, so that this skipping works.

## What each platform calls it

| Platform | Feature | Notes |
|---|---|---|
| BigQuery | Clustered tables | Up to four columns. Reclustering is automatic |
| Snowflake | Clustering keys | Data is in micro-partitions with statistics. Automatic clustering costs credits |
| Redshift | Sort keys | Also distribution keys, which decide which node holds a row |
| Databricks, Delta Lake | Z-order, liquid clustering | `OPTIMIZE` rewrites the files |
| Iceberg | Sort order | Applied by writes and by compaction |
| ClickHouse | `ORDER BY` of the table | The primary index is sparse and follows the sort order |

## One sort order, several filter columns

A table can be sorted in only one order. If you sort by `(country, customer_id)`, a filter on `country` is fast, a filter on `country` and `customer_id` is fast, and a filter on `customer_id` alone is not: the customers are spread through each country.

Two methods help when queries filter on several columns independently:

- **Z-order** and other space-filling curves mix the bits of several columns into one sort key. Each column then gives some skipping, less than a pure sort but more than none.
- **Bloom filters** are small structures in each file that answer “this value is definitely not here” for high-cardinality columns such as an ID.

## Partition or cluster?

| | Partition | Cluster |
|---|---|---|
| Works by | Separate folders | Order of rows in files |
| Good for | Low cardinality: date, region | High cardinality: customer, product, user |
| Number of columns | One, sometimes two | A few |
| Skips | Whole folders, with certainty | Files and blocks, by statistics |
| Also gives | Easy delete and overwrite of one partition | Better compression, because similar values are together |
| Risk | Too many partitions give many small files | Must be maintained as new data arrives |

The common design uses the two: **partition by date, cluster by the column that queries filter or join on most**.

## How to choose the columns

1. Look at the queries, not at the table. Which columns are in `WHERE` and `JOIN` most often?
2. Put the column with the fewest distinct values first in the sort order, if queries filter on it.
3. Do not cluster small tables. Less than a few gigabytes, the engine reads everything fast.
4. Measure. Each platform shows the bytes scanned by a query. Compare before and after.

> **Pitfall.** A function on the filter column. `WHERE DATE(created_at) = '2025-06-03'` or `WHERE CAST(customer_id AS STRING) = '42'` hides the column from the statistics on many engines, and the whole table is read. Filter on the stored column: `WHERE created_at >= '2025-06-03' AND created_at < '2025-06-04'`.

> **Pitfall.** Clustering that decays. New data arrives in arrival order. Without automatic reclustering or a regular `OPTIMIZE`, the newest part of the table, which is the part that is queried most, is not sorted.

## Remember

- OLTP databases find rows with B-tree indexes. Column stores skip files with minimum and maximum statistics.
- Statistics exclude files only when the data is sorted by the filter column.
- Partition by a low-cardinality column such as date. Cluster by a high-cardinality column such as customer.
- One sort order serves the leading columns. Z-order and bloom filters help with the others.

::quiz
? A table is sorted by `(country, customer_id)`. Which filter gets the least benefit?
- `WHERE country = 'PT'`
- `WHERE country = 'PT' AND customer_id = 42`
+ `WHERE customer_id = 42`
! Without the leading column, customer 42 can be in any country section, so many file ranges include the value.
::end
