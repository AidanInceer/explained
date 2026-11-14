A broker moves events. A **stream processing engine** computes on them while they move: it filters, joins, and aggregates over [windows](/lesson/windows-and-time), continuously and with [delivery guarantees](/lesson/delivery-semantics).

## What every engine must solve

**State.** A count for each user in the last ten minutes must be remembered between events. The engine keeps this state for each key, usually in memory with a local disk store such as RocksDB. A filter needs no state. A window, a join and a removal of duplicates all do.

**Checkpoints.** A machine will fail. The engine regularly saves a consistent copy of all state, with the position in each input partition, to durable storage. After a failure it loads the last checkpoint and reads the input again from the saved positions. State and position are saved together, and this is what gives exactly-once results inside the engine.

**Time.** The engine follows event time with watermarks, and decides when a window is complete.

**Backpressure.** When a step cannot keep up, the steps before it must slow down. If not, memory fills and the job fails.

**Scale.** The work is divided by key across parallel tasks, as in a [shuffle](/lesson/distributed-processing).

## The engines

| Engine | Model | Latency | Runs as | Good for | Consider |
|---|---|---|---|---|---|
| **Apache Flink** | True streaming: one event at a time | Milliseconds | A cluster | Large state, complex event-time logic, low latency | The most to learn and to operate |
| **Spark Structured Streaming** | Micro-batch by default | Seconds | A Spark cluster | Teams that already use Spark. Batch and stream code are nearly the same | Latency is higher. State handling is less flexible |
| **Kafka Streams** | True streaming | Milliseconds | A library inside your Java application | Services that transform Kafka topics. No separate cluster | Kafka only. Java or Scala |
| **Apache Beam** | One API, several runners | Depends on the runner | Google Dataflow, Flink, Spark | Portability, and Google Cloud | An extra layer between you and the engine |
| **Streaming databases**: Materialize, RisingWave, ksqlDB | SQL views that are kept up to date | Milliseconds to seconds | A database | Teams that want streaming with only SQL | Newer. Less control of state |
| **Managed services**: Amazon Managed Service for Apache Flink, Confluent Cloud for Flink, Google Dataflow | As the engine | As the engine | The provider | Teams without people to operate clusters | Cost. Limits of the service |

## True streaming and micro-batch

A true streaming engine processes each event when it arrives. A micro-batch engine collects events for a short interval and runs a small batch job on them.

Micro-batch is simpler to reason about and reuses the batch engine. Its latency cannot be less than the interval, usually from 100 milliseconds to some seconds. For most analytic uses that is enough. For a fraud check that must answer in less than 100 milliseconds, it is not.

## Streaming SQL and materialized views

A normal view runs its query when you read it. A **materialized view** stores the result. A streaming database keeps the stored result up to date **incrementally**: for each new event it changes only the rows of the result that are affected.

```sql
CREATE MATERIALIZED VIEW revenue_by_country AS
SELECT country, SUM(amount) AS revenue
FROM orders
GROUP BY country;
```

To the user this is a table that is always current. Inside, it is a stream job with state. This model brings stream processing to people who know SQL and not Flink. Warehouses also move in this direction: dynamic tables in Snowflake and materialized views with continuous refresh in other platforms give freshness of about a minute with no separate engine.

## Joins in streams

- **Stream to table** (enrichment): each order event gets the current data of its customer. The table side is kept as state, often filled from a [CDC](/lesson/cdc) topic.
- **Stream to stream**: match a click with a purchase inside one hour. The engine must keep the events of the two sides for the length of the window, so state grows with the window.
- **Temporal join**: join each event to the version of the table that was valid at the event’s time. It is the stream form of a [Type 2 dimension](/lesson/scd).

## What it costs to operate

A stream job runs without end. That changes the operations work:

- **Releases.** You cannot simply stop and start. A new version must take over the state of the old one from a savepoint, and a change in the shape of the state needs a migration.
- **State growth.** State for keys that never return must expire (a time to live). If not, it grows without limit.
- **Reprocessing.** To correct history you replay the log through the new code, often into a new output table.
- **Monitoring.** The important numbers are consumer lag, checkpoint duration and size, and backpressure.
- **Tests.** You must test with events that are late, repeated and out of order.

This is the practical reason for the advice in [batch and streaming](/lesson/batch-vs-streaming): use a stream processor when a requirement needs it.

## A ladder of options

Go up one step only when the step below cannot meet the requirement.

1. **Batch**, hourly or daily.
2. **Micro-batch in the warehouse**: continuous ingestion, incremental models each few minutes, or dynamic tables.
3. **A simple consumer**: a small service reads a topic and writes to a store. No windows, no state.
4. **Streaming SQL**: a streaming database or managed Flink SQL.
5. **A full stream processor with code**: Flink or Kafka Streams, with custom state.

> **Pitfall.** State with no expiry. A job that keeps a record for each session that ever existed will use more memory each day, until a checkpoint takes longer than the checkpoint interval.

> **Pitfall.** A stream job that writes straight to a dashboard table, with no copy of the raw events. When the logic has a defect, there is nothing to replay. Write the raw stream to the lake as well.

::scenario
? A team that knows SQL well wants a table of orders by region that is at most one minute old. The orders are already ingested continuously into the warehouse.
+ An incremental or dynamic table in the warehouse, refreshed each minute | The requirement is one minute, and the warehouse can do it with SQL the team already knows. No new system.
~ A streaming database with a materialized view | It gives lower latency and stays in SQL. It is a new product to operate for a requirement the warehouse meets.
- A Flink job in Java | It works. The team must learn a new language and operate a cluster to gain seconds that nobody asked for.
? A service must detect five failed logins followed by a success from a new country, for each user, inside ten minutes, and react in less than a second.
+ Flink, or Kafka Streams inside the service | This is pattern detection with state for each key, event time and low latency. It is what these engines are built for.
- A warehouse query each minute | The latency is too high, and patterns across events are difficult to write as a batch query.
~ Spark Structured Streaming | It can keep the state and find the pattern. Micro-batches add latency of seconds, which is at the limit of the requirement.
::end

## Remember

- A stream engine adds state, checkpoints, event time and backpressure to a flow of events.
- Flink for low latency and complex state. Spark for teams on Spark. Kafka Streams inside a service. Streaming SQL for SQL teams.
- Checkpoints save state and input position together.
- Stream jobs run without end, so releases, state growth and replay need a plan.
- Go up the ladder one step at a time.

::quiz
? What does a checkpoint contain?
+ The state of the job and its position in each input, saved together
- Only the last output row
- A copy of the whole input topic
! After a failure the engine loads the state and reads again from the saved positions, so that each event affects the state exactly once.
::end
