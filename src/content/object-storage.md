---
title: Object storage
summary: S3, GCS and Azure Blob store files under keys, at low cost and without a size limit. They are not file systems, and the differences matter.
track: storage
level: core
minutes: 7
at: [0, 3]
prereqs: [partitioning]
tech: [object, clouds, tableformats]
refs:
  - fode: Ch. 6, “Object storage”
---
Almost every modern data platform keeps its data in **object storage**: Amazon S3, Google Cloud Storage or Azure Blob Storage. Data lakes are object storage. Lakehouse tables are files in object storage. Cloud warehouses such as Snowflake and BigQuery use it internally.

## What an object store is

An object store keeps **objects** in **buckets**. An object is a sequence of bytes with a **key** (its name) and some metadata.

```
s3://acme-lake/raw/orders/order_date=2025-06-03/part-0001.parquet
     └ bucket ┘ └────────────────────── key ──────────────────────┘
```

It looks like a path with folders. It is not. The key is one string, and the “folders” are only a shared prefix. This difference has practical effects.

| | File system on a disk | Object store |
|---|---|---|
| Change part of a file | Yes | No. You replace the whole object |
| Append to a file | Yes | No, in general |
| Rename a folder | One fast operation | Copy each object, then delete the old ones |
| List a folder | Fast | A request for each 1,000 keys. Slow for millions |
| Capacity | The size of the disk | No practical limit |
| Access | The operating system | HTTP requests |

Objects are **immutable** in practice: you write one, read it many times, and replace or delete it. This fits analytic data well, because [Parquet files](/lesson/file-formats) are also written once.

## Why platforms are built on it

1. **Cost.** Storage costs a few cents for each gigabyte each month, much less than disks attached to a database server.
2. **Durability.** The providers design for eleven nines of durability: each object is copied to several data centres. You do not manage replication.
3. **No capacity planning.** You do not buy disks in advance.
4. **Storage is separate from compute.** This is the important one. Any number of engines can read the same files, and you can stop all the machines without losing the data. You pay for compute only while a query runs.

Before the cloud, a cluster such as Hadoop kept data on the disks of the machines that processed it. To store more, you bought more machines, also when you did not need more processing. The separation of storage and compute removed this link, and it is the reason for the design of every current platform.

## What costs money

- **Storage**, for each gigabyte each month.
- **Requests.** Each read, write and list operation has a small price. Millions of small files mean millions of requests.
- **Data transfer out** of the region or the cloud (**egress**). This is often the largest surprise on a bill. Run the compute in the same region as the bucket.
- **Storage classes.** Data that is read less often can be put in a lower-cost class (for example S3 Standard-IA or Glacier). The storage is cheaper and each read costs more. **Lifecycle rules** move objects between classes or delete them by age.

## The small files problem

An engine must make at least one request for each file it reads, and it must list all of them first. A table of 100 GB in 400 files of 250 MB is fast. The same table in 4 million files of 25 KB is very slow, and it costs more.

Small files come from streaming jobs that write each few seconds, and from too many partitions. The correction is **compaction**: a regular job that reads many small files and writes few large ones. A file size of 128 MB to 1 GB is a common target. [Table formats](/lesson/table-formats) have compaction commands.

> **Pitfall.** A public bucket. Many large data leaks were object storage buckets that could be read by anyone. Block public access at the level of the account, and give each job its own role with access to the prefixes it needs only.

> **In practice.** Design the key layout before you load data: `layer/source/table/partition=value/file`. To change it later means a copy of everything.

## Remember

- An object store keeps immutable objects under keys. Folders are only prefixes.
- No in-place change, no fast rename, slow listing of many keys.
- Low cost, very high durability and no capacity limit make it the base of data platforms.
- Storage is separate from compute: many engines read the same data, and compute can stop.
- Avoid many small files. Compact them.

::quiz
? A job “renames” a folder that contains 2 million objects. Why is it slow?
+ There are no folders. Each object must be copied to a new key and the old one deleted
- The objects must be compressed again
- Object stores permit only one request each second
! A rename is 2 million copy operations and 2 million deletes. Table formats avoid this by changing metadata and not keys.
::end
