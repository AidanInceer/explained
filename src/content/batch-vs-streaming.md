---
title: Batch and streaming
summary: Batch processes a bounded set of data on a schedule. Streaming processes each event as it arrives. The choice is about how fresh the answer must be.
track: foundations
level: core
minutes: 8
at: [3, 3]
prereqs: [source-systems]
tech: [brokers, stream, orchestrators]
refs:
  - fode: Ch. 7, “Batch versus streaming”
  - streaming: Ch. 1, Streaming 101
  - ddia: Ch. 10 and Ch. 11
---
There are two ways to process data. You can collect it and process a set of it at intervals, or you can process each record when it arrives. The first is **batch**. The second is **streaming**.

::fig batch-stream | The same events go through the two designs. Change how often the batch job runs, and look at the age of the newest row in each target.

## Bounded and unbounded data

The more exact terms are about the data, not the tool.

- **Bounded** data has an end. “All orders from yesterday” is a fixed set. You can read all of it, compute, and stop.
- **Unbounded** data has no end. Orders will continue to arrive for as long as the company exists.

A batch job makes unbounded data bounded: it cuts off a piece (one day, one hour) and processes that piece. A streaming job accepts that the data is unbounded and never stops.

## What changes between them

| | Batch | Streaming |
|---|---|---|
| Runs | On a schedule, then stops | All the time |
| Age of data when read | Minutes to a day | Milliseconds to seconds |
| A failed run | Run it again | The job must restart from a saved position without loss or duplicates |
| Complete data | Easy: wait until the period is closed | Hard: late events can arrive after you have given a result |
| Reprocessing old data | Run the job for the old dates | Replay the log, if you kept it |
| Tests | Fixed input, fixed output | Must also test order, lateness and restarts |
| Cost | Pay when it runs | Pay all the time |
| Usual tools | SQL in a warehouse, dbt, Spark, Airflow | Kafka, Flink, Spark Structured Streaming |

Streaming is not a better batch. It is a different set of compromises: you get low latency, and you pay with complexity.

## Micro-batch: the middle

Many “real-time” systems are batch jobs that run very often. A **micro-batch** job collects records for a short interval, from a second to a few minutes, and processes each small set. Spark Structured Streaming works this way by default, and warehouse features such as Snowpipe and incremental models every five minutes do also.

Micro-batch keeps most of the simplicity of batch. For a dashboard that a person reads, it is nearly always enough.

## How to choose

Start from the requirement, not from the tool. Ask two questions: what uses the result, and how old can the data be when it is used?

::fig choose-latency | Choose who uses the result and how old the data can be.

A useful rule: **the latency you need is the time in which someone or something will act**. If a person reads a report each morning, data that is seconds old has no more value than data from last night. If a program must block a fraudulent card payment, last night’s data has no value at all.

## The table and the stream are two views of one thing

A table shows the state at one moment. A stream shows each change. If you apply all the changes in a stream, you get the table. If you record each change to a table, you get a stream. This is often called the **stream-table duality**.

This is why modern designs often collect data as a stream of events, which is the more complete form, and then decide for each use if it is read in batches or continuously. You will see this in [streams and logs](/lesson/streaming-basics) and in the [Lambda and Kappa architectures](/lesson/architecture-patterns).

> **Pitfall.** Building streaming because it is modern. A streaming pipeline needs people who can operate it at night. If no decision is made in less than an hour, a batch job is the correct engineering, not a compromise.

> **Pitfall.** A batch job that runs each minute and takes 70 seconds. The runs overlap, and each one waits for the last. If you need less than a few minutes, change the design, not the schedule.

## Remember

- Batch processes a bounded set on a schedule. Streaming processes unbounded data continuously.
- The data is the same. The difference is its age when it is read, and the complexity you accept.
- Micro-batch gives minutes of latency with batch tools.
- Choose from the time in which someone will act on the result.

::quiz
? A finance team closes the books once a month and needs every transaction included. Which design fits?
+ Batch, after the period is closed
- Streaming, for the lowest latency
- Micro-batch each second
! Completeness matters here, and speed does not. A batch job after the period ends has all the data and is simple to rerun.
? What does a micro-batch system do?
- It processes each event alone, when it arrives
+ It processes small sets of events at short intervals
- It runs once a day on a small machine
! It is batch processing with a very short interval, which gives latency of seconds to minutes.
::end
