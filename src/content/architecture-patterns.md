A data platform is many components. An architecture pattern is a known way to arrange them. This lesson covers three that you will hear in almost every design discussion.

## Medallion: layers of refinement

The medallion architecture arranges the data in a lake or lakehouse into three layers, named after medals.

::fig medallion | Data moves from left to right. Each layer has one task and one rule.

- **Bronze** is the raw layer. Data is stored as it arrived from the source, with the load time and the source added. Nothing is corrected. The rule is that bronze is append-only and never edited, so that every later layer can be rebuilt from it.
- **Silver** is the cleaned layer. Types are corrected, duplicates removed, bad records rejected or quarantined, and names made consistent. Data from different sources about the same entity is combined. Silver tables are organised by business entity, not by source system.
- **Gold** is the layer that users query. It holds dimensional models, aggregates and tables built for specific reports or models. Gold tables are organised by use.

The names are from Databricks. The idea is older: it is the raw, staging and marts layers of [ELT](/lesson/etl-vs-elt) in a warehouse.

The value of the layers is separation of concerns. When a number is wrong, you can find the layer where it became wrong. When a business rule changes, you rebuild gold from silver, and you do not extract again from the source.

> **Pitfall.** The three layers are a guide, not a law. Some data needs two silver steps, and some tables need no gold layer. The common failure is the opposite: business logic in the bronze-to-silver step, so that silver is no longer a neutral, reusable layer.

## Lambda: a batch path and a speed path

Batch processing is complete and accurate, and it is hours late. Stream processing is seconds late, and in the early systems it could be approximate. The Lambda architecture, proposed by Nathan Marz, uses both.

::fig lambda-kappa | Lambda runs two pipelines for the same result. Kappa runs one.

- The **batch layer** recomputes the full, correct result from all the data at intervals.
- The **speed layer** processes new events as they arrive, to cover the period since the last batch run.
- The **serving layer** combines the two when a query is made.

It gives results that are both recent and, after some time, correct. The cost is large: **the same logic is implemented twice**, in two systems with two sets of code. The two implementations must give the same answers, and in practice they slowly diverge. Each change is made twice, and each defect is investigated twice.

## Kappa: streams only

Jay Kreps proposed the Kappa architecture as a simplification. If the stream processor is good enough, the batch layer is not necessary.

- All data is an event in a log that keeps its history.
- One streaming job computes the result.
- To **reprocess**, for example after a change to the logic, start a second copy of the job with the new code, replay the log from the beginning into a new output table, and change over to the new table when it has reached the present.

There is one set of code. The requirements are a log with long retention, and a stream processor that can process history at high speed with correct [event-time handling](/lesson/windows-and-time). Kappa is a good fit for data that is events by nature. It is a poor fit for large historical joins and for ad hoc analysis, where batch engines are simpler and cheaper.

## What teams do today

Engines have reduced the difference. Spark Structured Streaming and Flink let one set of logic run in batch mode or in streaming mode. [Table formats](/lesson/table-formats) let a streaming job and a batch job write to the same table safely. A common current design:

1. Streaming ingestion into bronze tables.
2. Transformations to silver and gold that run incrementally, every few minutes or every hour, with the same code that can also do a full rebuild.
3. A true streaming path only for the few uses that need results in seconds.

This gives most of the benefit of Lambda and has one set of code for most of the logic.

## Principles that apply to every pattern

*Fundamentals of Data Engineering* gives principles of good architecture. Four are the most useful in a review:

- **Plan for failure.** Each component will fail. Know what occurs when it does and how you recover.
- **Prefer decisions that can be reversed.** Open formats and loosely connected components make it possible to replace one part later.
- **Use common components.** A shared, well-understood tool is usually better than a specialised one for each team.
- **Choose the simplest design that satisfies the requirement.** Each added component is a new source of failures. Ask what latency the business needs, not what is possible.

## Remember

- Medallion: bronze is raw, silver is clean, gold is ready for use. Keep bronze unchanged so that everything can be rebuilt.
- Lambda: batch and stream paths in parallel. Correct and recent, with the logic written twice.
- Kappa: one streaming path. Reprocessing is a replay of the log.

::quiz
? A business rule for “active customer” changes. In a medallion design, what must be rebuilt?
- Bronze, silver and gold
+ Gold only, from silver
- Nothing. The rule applies to new data only
! Business rules are in the gold layer. Silver holds clean, neutral data, so gold can be recomputed from it with no new extract.
? What is the main operational cost of the Lambda architecture?
- It cannot give recent results
+ The same logic is kept in two systems, and the two must agree
- It needs no storage
! The batch and speed layers are separate implementations of one calculation. To keep them in agreement is continuous work.
? How does a Kappa architecture reprocess history after a change to the logic?
+ It replays the log through a new version of the streaming job
- It runs a separate batch job
- It cannot reprocess
! The log keeps the events. A second job with the new code reads from the beginning and writes a new output, which then replaces the old one.
::end
