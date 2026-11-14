---
title: Row and column storage
summary: A row store keeps each record together. A column store keeps each column together, so analytic queries read less and compress better.
track: storage
level: core
minutes: 8
at: [0, 0]
prereqs: [oltp-olap]
tech: [oltp, warehouses, formats]
refs:
  - ddia: Ch. 3, “Column-Oriented Storage”
  - dremel: Sections 4 and 5
---
A table is a grid in your head. On disk it is a sequence of bytes, and something must decide the order. There are two choices, and the choice decides which queries are fast.

## Two ways to write a table to disk

A **row store** writes each record complete, one after another: all of order 1001, then all of order 1002. PostgreSQL and MySQL do this.

A **column store** writes each column complete: all the order ids, then all the customers, then all the amounts. Snowflake, BigQuery, ClickHouse, DuckDB and the Parquet file format do this.

Try both queries below and see what each layout must read.

::fig row-col | A block is the unit the disk reads. The engine cannot read half a block, so it loads everything in each block it opens.

The example has 6 rows and 4 columns. A real table has a billion rows and 100 columns. For `SUM(amount)` the column store reads 1% of the data and the row store reads all of it. This one fact is why analytic databases are column stores.

## The second benefit: compression

Values in one column are alike. A `country` column holds the same few strings many times. A column store uses this in two common ways:

- **Dictionary encoding.** Store each distinct value once, and replace the column with small integers. `PT, ES, PT, PT` becomes `0, 1, 0, 0` plus the dictionary `{0: PT, 1: ES}`.
- **Run-length encoding.** If the column is sorted, store each value with a count. One million rows of `PT` become `(PT, 1000000)`.

A row store cannot do this well, because adjacent bytes belong to different columns with different types. In practice columnar data is often 5 to 10 times smaller than the same data in rows. Smaller data means less disk to read, so compression is also a speed gain.

## The third benefit: vectorized execution

The engine can process a column as an array, with a tight loop over values of one type. Modern CPUs run such loops very fast. A row store must interpret each row's layout before it can read a value.

## What column stores do badly

- **Single-row lookups.** One row is spread across many places.
- **Single-row writes.** One insert must touch every column. Column stores collect writes in batches and write whole files.
- **Updates in place.** Compressed column blocks are usually rewritten, not edited.

This is the [OLTP and OLAP](/lesson/oltp-olap) division seen at the storage level. The application needs complete rows one at a time, so it uses a row store. Analysis needs some columns of all rows, so it uses a column store.

> **Pitfall.** `SELECT *` on a column store removes the main benefit. The engine must read every column. In a warehouse that charges for bytes scanned, selecting only the columns you need is the simplest cost control there is.

## Remember

- Row store: fast for complete rows and for writes. Column store: fast for scans of some columns.
- Columns compress well because their values are alike.
- Select only the columns you need.

::quiz
? A table has 50 columns. A query reads 2 of them across all rows. About how much of the data does a column store read?
- All of it
- Half of it
+ About 4%, the two columns
! The engine opens only the blocks for the two columns named in the query. The real figure depends on column widths, but the order of magnitude is correct.
? Why does a sorted column compress better?
+ Equal values are adjacent, so run-length encoding can store each run once
- Sorting removes rows
- Sorted data uses a smaller data type
! Run-length encoding stores a value and a count. Long runs of the same value become a single pair.
? An application must fetch one user's profile by id, thousands of times each second. Which layout?
+ Row store
- Column store
! Each request needs one complete row. A row store with an index on the id gets it in one read.
::end
