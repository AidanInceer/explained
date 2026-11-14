---
title: Ways to ingest data
summary: Query the database, read its log, call an API, collect files, or receive events. Each source type has one method that fits it best.
track: pipelines
level: core
minutes: 10
at: [0, 1]
prereqs: [etl-vs-elt]
tech: [ingestion, cdc, brokers]
refs:
  - fode: Ch. 7, Ingestion
  - wiki: "Concepts: Data ingestion"
---
Ingestion is the movement of data from a [source system](/lesson/source-systems) into your platform. Many pipeline failures start here, because it is the stage that depends on systems you do not control.

There are a small number of methods. The skill is to match the method to the source.

## Two questions first

**Push or pull?** In a pull design your job asks the source for data on a schedule. In a push design the source sends data to you when something occurs. Pull is simpler to control and to rerun. Push gives lower latency, and you must be ready to receive at any time.

**Batch or stream?** See [batch and streaming](/lesson/batch-vs-streaming). The freshness requirement decides.

## The methods

### 1. Query the database

Connect with SQL and select the rows. Take a **full snapshot** (the whole table) or an **incremental** slice with a filter on a timestamp or an increasing ID.

It is the simplest method and needs no new infrastructure. Its limits: the query loads the source, it does not see deleted rows, and it sees only the last state of a row that changed several times between two runs. The lesson on [full and incremental loads](/lesson/incremental-loading) covers the details.

### 2. Read the database log

[Change data capture](/lesson/cdc) reads the transaction log of the database. You get each insert, update and delete, in order, within seconds, with almost no load on the source. The cost is more components: a connector, usually a message broker, and logic to apply the changes.

### 3. Call an API

SaaS tools give their data through HTTP APIs. An API client must handle:

- **Authentication**, and tokens that expire.
- **Pagination**: the data comes in pages, and you follow a cursor to the end.
- **Rate limits**: wait and try again when the API answers “too many requests”.
- **Incremental filters**: a parameter such as `updated_since`.
- **Changes**: the vendor will change fields and versions.

This is repetitive work with many edge cases. It is the reason that **managed connectors** exist.

### 4. Collect files

A partner or an internal team puts files in a bucket or on an SFTP server. Your job finds new files, checks them and loads them. Check the schema and the row count before the load. Record which files are loaded, so that a file is not loaded twice. Keep the original files.

### 5. Receive events

Applications publish events to a stream (Kafka, Kinesis, Pub/Sub), or a SaaS tool calls your **webhook** when something changes. Data arrives continuously. A consumer writes it to storage in small batches or processes it immediately.

### 6. Share, do not copy

Some platforms can give access to a dataset with no copy: Snowflake secure shares, BigQuery Analytics Hub, Delta Sharing. If the provider offers this, there is no pipeline to build.

## Which method for which source

::fig choose-ingestion | Choose the kind of source and the freshness that is required.

## Build or buy

| Option | Examples | You get | You pay with |
|---|---|---|---|
| **Managed connector service** | Fivetran, Airbyte Cloud, Stitch, Hevo | Hundreds of sources with no code. Schema changes are handled | A price by volume that grows fast. Little control |
| **Open-source connector framework** | Airbyte (self-hosted), Meltano with Singer taps | The same connectors, on your own machines | You operate it, and connector quality varies |
| **Code library** | dlt, or your own Python | Full control. Low cost. Fits a custom source | You write and maintain each source |
| **Cloud-native service** | AWS DMS and AppFlow, Google Datastream, Azure Data Factory | Integration with your cloud. CDC for common databases | Tied to one cloud. Fewer SaaS sources |
| **Streaming connector** | Kafka Connect, Debezium | Continuous delivery, many sources and sinks | A Kafka platform to operate |

The usual advice in *Fundamentals of Data Engineering*, and in the community, is to buy ingestion for standard sources. A connector for Salesforce is the same for every company, and to write one gives you no advantage. Use engineering time for the sources that are specific to your business.

## Properties of a good ingestion job

Whatever the method, a production ingestion job must have these:

1. **It can run again safely.** A second run for the same period gives the same result, not duplicates. See [idempotency](/lesson/idempotency).
2. **It keeps the raw data.** Land what the source sent, with no changes, before any transformation.
3. **It adds metadata.** Each row gets the load time and the source file or batch. You will need this for every investigation.
4. **It remembers its position.** The last timestamp, cursor or offset is stored outside the job, and is updated only after a successful write.
5. **It handles late and duplicate records**, because every source sends them.
6. **It tells someone** when it fails, and when it succeeds with zero rows.

> **Pitfall.** Success with no data. An API that returns an empty page and status 200 gives a green pipeline and an empty table. Test the row count against what is normal for that source.

> **Pitfall.** Extraction from the primary database at peak time. Use a replica, or CDC, or run when traffic is low.

::scenario
? You need data from a common CRM tool, refreshed each few hours. The team has two engineers.
+ A managed connector | The connector exists, handles the API’s limits and changes, and takes an afternoon to configure. The engineers stay free for work that is specific to the company.
~ A Python script with dlt against the CRM API | Low cost and under your control. You now own the pagination, the rate limits and each future API change.
- CDC on the CRM’s database | You have no access to the database of a SaaS vendor. The API is the only door.
? An internal Postgres table of 400 million rows has frequent updates and deletes. Analysts need it within five minutes.
+ Log-based CDC | Only the log gives deletes and each change within minutes, with no heavy queries on the source.
- A full snapshot each five minutes | 400 million rows cannot be copied in five minutes, and each attempt loads the source.
~ An incremental query on `updated_at` each five minutes | It gives the updates if the column is reliable. It does not see the deletes, so the copy slowly fills with rows that no longer exist.
::end

## Remember

- Six methods: query, log, API, files, events, shares. Match the method to the source.
- Pull is simple to control. Push is faster and must always be ready.
- Buy connectors for standard sources. Build for the sources that only you have.
- Land raw data, add load metadata, store the position, and make each run safe to repeat.

::quiz
? Why is “the job succeeded” not enough to know that ingestion worked?
+ A source can return no data with no error, and the job then succeeds with zero rows
- Jobs always fail when data is missing
- Success is reported only once a day
! Monitor the volume and freshness of the data, not only the status of the job.
::end
