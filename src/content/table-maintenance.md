---
title: Table maintenance
summary: "Tables in a lakehouse need regular care: compact small files, remove old snapshots, delete files that nothing refers to, and keep statistics current."
track: storage
level: deeper
minutes: 8
at: [0, 6]
prereqs: [table-formats]
tech: [tableformats, orchestrators, batch]
refs:
  - lakehouse: Section 3, metadata layers
  - wiki: "Concepts: Open table formats"
---
A managed warehouse maintains its own storage. A lakehouse built on an [open table format](/lesson/table-formats) often does not: the files are yours, and so is the housekeeping. Without it, a table gets slower and more expensive each week, with no change to any query.

There are four jobs. Managed lakehouse platforms run some of them for you, so check what yours does before you schedule your own.

## Why tables decay

Each write to an Iceberg or Delta table adds new files and a new **snapshot**, which is a list of the files that make up the table at that moment. Nothing is changed in place.

- A streaming job that commits each minute makes 1,440 commits a day, each with some small files.
- An update or delete writes new files, or small “delete files”, and leaves the old ones for older snapshots to use.
- Each snapshot adds metadata.

After a month the table has hundreds of thousands of small files and a long history. Planning a query means reading all that metadata. Running it means opening all those files.

## 1. Compaction

**Compaction** reads many small files and writes fewer large ones, with the same rows. It can also sort the rows, which restores [clustering](/lesson/clustering).

| Format | Command |
|---|---|
| Delta Lake | `OPTIMIZE table` (with `ZORDER BY` or liquid clustering) |
| Iceberg | `rewrite_data_files` procedure |
| Hudi | Compaction and clustering services |

A common target is 128 MB to 1 GB for each file. Compact only the partitions that received data recently. To compact the whole table each night is waste.

## 2. Snapshot expiry

Old snapshots make [time travel](/lesson/table-formats) possible, and they keep every old file alive. **Expiring** snapshots removes the ones that are older than a retention period.

| Format | Command |
|---|---|
| Delta Lake | Log retention settings, then `VACUUM` |
| Iceberg | `expire_snapshots` procedure |

The retention period is a decision, not a default to accept. A longer period gives more history for recovery and for audit, and costs more storage. Seven to thirty days is common. A table under a legal audit rule can need years, and then the storage cost is part of the requirement.

## 3. Removal of unreferenced files

After snapshots expire, the data files that only they used can be deleted. Failed writes also leave files that no snapshot refers to.

| Format | Command |
|---|---|
| Delta Lake | `VACUUM table RETAIN 168 HOURS` |
| Iceberg | `remove_orphan_files` procedure |

This is the only job of the four that deletes data, so it has the only real danger. If you remove files that a running query or a slow writer still needs, that query fails or the table is damaged. Never set the retention to less than the longest job that can read or write the table. The default safety period, often seven days, exists for this reason.

## 4. Statistics and metadata

The optimiser needs current [statistics](/lesson/query-engines) to choose join methods. Some engines collect them on write, and some need `ANALYZE TABLE`. Iceberg also has `rewrite_manifests`, which compacts the metadata files themselves when planning becomes slow.

## Deletes and updates: two strategies

Table formats offer two ways to change rows.

| | Copy-on-write | Merge-on-read |
|---|---|---|
| A delete or update | Writes the whole file again without the row | Writes a small delete file. The data file stays |
| Write cost | High | Low |
| Read cost | Low | Higher: each read must apply the delete files |
| Good for | Tables that are read often and changed rarely | Tables with frequent changes, such as [CDC](/lesson/cdc) targets |
| Maintenance | Less | Regular compaction is necessary to apply the deletes |

A table that gets CDC merges each few minutes usually uses merge-on-read with frequent compaction.

## A schedule

| Job | Typical frequency | Scope |
|---|---|---|
| Compaction | Daily, or hourly for streaming tables | Partitions changed since the last run |
| Snapshot expiry | Daily | Whole table |
| Remove unreferenced files | Weekly | Whole table |
| Statistics | After large loads | Changed tables |

Run these from the [orchestrator](/lesson/orchestration), as tasks like any other, with alerts. Give them their own compute, so that they do not slow the pipelines.

## How to see that a table needs care

Measure these, and alert on them:

- **Number of files** and **average file size** for each partition. An average of 2 MB is a problem.
- **Number of snapshots.**
- **Planning time** of queries, separate from execution time.
- **Storage size** compared with the size of the current data. If the table holds 100 GB of live rows and uses 900 GB, old files are not being removed.

## Privacy and deletes

A `DELETE` removes a row from the current snapshot. The row is still in the old files until the snapshots expire and the files are removed. For a [request to delete personal data](/lesson/privacy-in-practice), the deletion is complete only after these maintenance jobs have run. Plan the retention with that in mind.

> **Pitfall.** `VACUUM` with zero retention “to save space”. It can delete files that a running job is reading, and it removes all ability to go back to an earlier version.

> **Pitfall.** No maintenance on a streaming table. It works well in the first week. In the third month a simple query takes minutes to plan.

## Remember

- Each write adds files and a snapshot. Without maintenance, a table gets slower and larger.
- Compact small files. Expire old snapshots. Remove unreferenced files. Keep statistics current.
- Retention is a decision between recovery and cost. Never set it shorter than your longest job.
- A deleted row is physically gone only after expiry and file removal.

::quiz
? A table has 100 GB of current data and uses 1 TB of storage. What is the most probable cause?
+ Old snapshots are not expired, so the files of old versions are all kept
- The data is not compressed
- The table has too few partitions
! Each update and delete leaves the old files for old snapshots. Until those snapshots expire, the files cannot be removed.
::end
