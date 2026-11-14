A [lakehouse](/lesson/warehouse-lake-lakehouse) depends on one component: the table format. This lesson explains what it does and how.

## The problem

A table in a lake is a folder of Parquet files. A reader finds the table's data by listing the folder. This simple design fails in several ways:

- A job writes ten files and stops after six. Readers now see a partial result.
- A job replaces files while a query is reading them. The query fails, or returns a mix of old and new data.
- Listing a folder of a million files in object storage is slow.
- To delete one customer's rows, you must find and rewrite files yourself, and readers see the intermediate states.

## The solution: record the file list as data

A table format stops using "whatever files are in the folder" as the definition of the table. It keeps an explicit, versioned list of the files that make up the table.

In Apache Iceberg, the structure is:

1. **Data files.** Ordinary Parquet files. They are never changed after they are written.
2. **Manifest files.** Lists of data files, with statistics for each: row count, and minimum and maximum of each column.
3. **A snapshot.** A complete list of manifests. One snapshot is one version of the table.
4. **A pointer in a catalog.** One small record that says which snapshot is current.

Delta Lake reaches the same result with an ordered transaction log, a folder of JSON files named `_delta_log`, in which each commit records the files added and removed.

## What you get

**Atomic commits.** A writer adds new data files, which are not visible yet, then changes the pointer to a new snapshot in one atomic step. Readers see the complete old version or the complete new version. A failed job leaves files that no snapshot refers to, and readers never see them.

**Concurrent writers.** Two writers each prepare a snapshot. The first changes the pointer. The second finds that the pointer has moved, checks for a conflict, and tries again. This is optimistic concurrency control.

**Time travel.** Old snapshots remain until you expire them. You can query the table as it was yesterday, or roll back a bad load.

```sql
SELECT * FROM orders FOR TIMESTAMP AS OF '2026-03-04 00:00:00';
```

**Row-level changes.** An `UPDATE`, `DELETE` or `MERGE` writes new files and a new snapshot. There are two methods. *Copy-on-write* rewrites each affected data file: slower writes, fast reads. *Merge-on-read* writes a small file of deletes that readers apply: fast writes, slower reads until compaction.

**Schema evolution.** Columns are tracked by id, not by name or position. Adding, renaming or dropping a column changes the metadata only. No data file is rewritten.

**Faster planning.** The engine reads manifests, not folder listings, and uses the statistics to skip files before it opens them. Iceberg also has *hidden partitioning*: the table knows that it is partitioned by day of `event_ts`, so a filter on `event_ts` prunes partitions without a separate date column in the query.

## Maintenance is your task

A table format creates work that a warehouse hides:

- **Compaction.** Frequent small writes create many small files. Rewrite them into larger files on a schedule.
- **Snapshot expiry.** Old snapshots keep old files alive. Expire them, or storage cost grows without limit.
- **Orphan file cleanup.** Remove the files that failed jobs left.

## The three formats

| | Came from | Known for |
|---|---|---|
| Apache Iceberg | Netflix | Widest engine support, hidden partitioning, partition evolution |
| Delta Lake | Databricks | Close integration with Spark and Databricks |
| Apache Hudi | Uber | Frequent upserts and incremental reads |

The functions are now similar. Choose the one that your engines support best.

## Remember

- A table format is a versioned list of immutable data files, with one atomic pointer to the current version.
- That gives transactions, time travel, safe concurrent writes and metadata-only schema changes.
- You must schedule compaction and snapshot expiry.

::quiz
? A write job fails after it has written half of its Parquet files to an Iceberg table. What do readers see?
+ The previous snapshot, unchanged
- Half of the new data
- An error until the job is run again
! The new files are not in any snapshot, because the pointer was never changed. They are orphans for cleanup, and no reader sees them.
? Why does storage cost grow if snapshots are never expired?
- Snapshots are copies of the full table
+ Old snapshots refer to old data files, so those files cannot be deleted
- Manifests are very large
! A snapshot is only metadata, but while it exists, every data file it lists must be kept for time travel.
::end
