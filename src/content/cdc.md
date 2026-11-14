---
title: Change data capture
summary: Read the database’s own transaction log and emit every insert, update and delete as an event.
track: pipelines
level: deeper
minutes: 8
at: [1, 3]
prereqs: [incremental-loading]
tech: [cdc, brokers, oltp]
refs:
  - ddia: Ch. 11, “Change Data Capture”
  - log: Part two, data integration
---
Change data capture, or CDC, is a method of extraction that gets every change to a database as a sequence of events. It solves the problems that [high-water mark loads](/lesson/incremental-loading) cannot solve.

## The database already keeps a list of changes

Every transactional database writes each change to an append-only log *before* it changes the tables. PostgreSQL names it the write-ahead log (WAL). MySQL names it the binary log. The database needs the log for crash recovery and to send changes to replicas.

That log is an exact, ordered record of every insert, update and delete. Log-based CDC connects to the database in the same way as a replica, reads the log, and converts each entry into an event.

::fig cdc | Log-based CDC. The connector reads the log. It does not query the tables.

## What a change event contains

Each event describes one row change:

- **The operation**: create, update or delete.
- **The row before** the change, and **the row after** it.
- **The position in the log**, which gives a strict order.
- **The time** of the transaction.

A delete is an event with a "before" and no "after". This is the capability that a timestamp query does not have.

## Three methods, and why the log is best

| Method | How it works | Limits |
|---|---|---|
| Query-based | Poll with `WHERE updated_at > mark` | No deletes, no intermediate changes, load on the source |
| Trigger-based | A database trigger writes each change to an audit table | Adds work to every transaction on the source |
| Log-based | Read the transaction log | Needs setup and permissions. Tied to the database type |

Log-based CDC adds almost no load, because the database writes the log in any case. It finds deletes. It finds every change, including a value that changes three times in one minute. And it can deliver changes within seconds.

## A CDC pipeline

1. **Initial snapshot.** The connector reads the full table once, and records the log position at which it started.
2. **Streaming.** From that position, it emits one event for each change. Debezium is the best-known open-source connector. Cloud providers and ingestion products have managed versions.
3. **Transport.** Events usually go to a log system such as Kafka, with one topic for each table. See [Streams and logs](/lesson/streaming-basics).
4. **Apply.** A consumer applies the events to the target.

There are two ways to apply the events, and they give different tables:

- **Mirror the source.** Apply each event as an upsert or a delete. The target is a current copy of the source table.
- **Keep the change log.** Append every event. The target is a full history, from which you can build a [Type 2 dimension](/lesson/scd) with every intermediate version, or compute the state at any past time.

Many teams keep the change log as the raw layer and derive the mirror from it.

## What to be careful with

- **Order.** Events for one row must be applied in log order. If the update is applied before the insert, the result is wrong. Use the row's primary key as the message key, so that all events for one row go to the same partition.
- **Duplicates.** After a restart, a connector can send some events again. Make the apply step [idempotent](/lesson/idempotency): merge on the primary key, and ignore an event whose log position is not newer than the one already applied.
- **Schema changes.** A new column in the source appears in the events with no warning. Decide what the pipeline does: add the column, or stop.
- **Log retention.** In PostgreSQL, a replication slot makes the database keep the log until the connector has read it. If the connector is stopped for days, the log fills the source's disk. Monitor replication lag.

> **For experienced readers.** Kleppmann's chapter on stream processing treats CDC as a way to make the database log a public interface. Other systems subscribe to the source of truth, and the application does not need to write to two systems, which is the *dual-write* problem. The *outbox pattern* applies the same idea to events that the application defines itself.

## Remember

- Log-based CDC reads the database's transaction log and emits one event for each row change.
- It finds deletes and intermediate changes, with little load on the source.
- Apply events in order and idempotently, and monitor the connector's lag.

::quiz
? Which change can log-based CDC find that a query on <code>updated_at</code> cannot?
- A new row
- An updated row
+ A hard delete
! A deleted row is absent from every later query. In the log, the delete is an event.
? Why must all change events for one row go to the same Kafka partition?
+ Order is guaranteed only inside a partition, and the events must be applied in order
- To reduce storage
- Kafka does not permit keys in several partitions
! If an insert and a later update are in different partitions, a consumer can read the update first.
::end
