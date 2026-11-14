The other lines of the map each explain one part. This line puts the parts together. It gives a method to design a complete pipeline, and then uses it on six systems with six different shapes:

| Design | Shape |
|---|---|
| [An online shop](/lesson/case-online-shop) | Small team, plain batch ELT |
| [A regulatory report at a bank](/lesson/case-bank-reporting) | Batch, built around audit and proof |
| [Product analytics from clicks](/lesson/case-clickstream) | An event stream with a batch path and a fast path |
| [A flight booking system](/lesson/case-flight-booking) | Change data capture into a lakehouse |
| [Sensor data from machines](/lesson/case-iot-telemetry) | High-volume streaming with late data |
| [Payment fraud checks](/lesson/case-fraud-stream) | Streaming, with a decision in milliseconds |

After them, the last line of the map shows how to [build a small pipeline of your own](/lesson/first-project).

The method is useful for real projects and for system design interviews. In the two cases the common error is the same: to start with the tools. “We will use Kafka and Spark” is not a design. It is a list of products with no reason.

## Design from right to left

Data flows from the sources on the left to the users on the right. **Design in the opposite direction.** The users decide what tables are needed. The tables decide what must be extracted. The freshness decides how.

::fig wb-method | A design drawn in nine steps. Use “Next step” to draw it in the order that you must think.

## The seven steps

### 1. Users and requirements

Write each consumer, the decision or action, and three numbers for each one: **freshness**, **grain** and **correctness**. Use the questions from [stakeholders and requirements](/lesson/stakeholders-requirements). Write also what is out of scope.

The freshest requirement among the users sets the fastest path that you must build. Often one user needs minutes and all others need a day. Then design a fast path for that one use, and keep the rest in batch.

### 2. The serving model

Name the tables that the users will read: the [facts, with their grain](/lesson/dimensional-modeling), and the dimensions. Decide where history is needed ([Type 2](/lesson/scd)), and [which kind of fact table](/lesson/fact-table-types) fits each question. Decide [how each consumer gets the data](/lesson/serving-reverse-etl): BI tool, API, reverse ETL.

### 3. The sources

For each source write the owner, the type, the volume, how it changes (inserts only, or updates and deletes), how long it keeps history, and its limits. Use the list from [source systems](/lesson/source-systems). This step often changes step 1: a source that is delivered once a day cannot support hourly freshness.

### 4. Ingestion

[One method for each source](/lesson/ingestion-patterns): query, CDC, connector, files or events. Choose [full or incremental](/lesson/incremental-loading). Choose batch or stream from the freshness in step 1, and no faster.

### 5. Storage and layers

Choose [the engine](/lesson/choosing-engine) from volume, kinds of work and team. Plan the layers: raw copies that are never edited, cleaned data, and marts. Choose [partitions](/lesson/partitioning) from the main filter of the queries, which is nearly always a date.

### 6. Transformation

[SQL in layers](/lesson/transformation-dbt), or code where SQL is not enough. Decide which models are incremental. Each step must be [idempotent](/lesson/idempotency).

### 7. Operations

[Orchestration](/lesson/orchestration): what starts each step, and in which order. [Tests](/lesson/data-quality): which ones can stop the pipeline. [Monitoring and objectives](/lesson/incidents-reliability): who is told when the data is late. [Governance](/lesson/governance-security): which data is personal, and who can see it. [Cost](/lesson/cost-performance): an estimate.

## The failure questions

A drawing with boxes and arrows shows the case where everything works. A design is tested by the cases where something does not. Ask these of each arrow:

| Question | What a good design answers |
|---|---|
| What if this step runs twice? | It overwrites or merges by key. No duplicates |
| What if it fails in the middle? | The run is atomic, or it can be run again from the start |
| What if the source is late or sends nothing? | A freshness check alerts. Steps downstream wait and do not publish empty data |
| What if the source sends bad data? | Tests stop it at the first layer. The last good data stays in the marts |
| What if the schema changes? | A [policy for drift](/lesson/schema-evolution). The raw layer keeps the full record |
| What if data arrives days late? | A [reprocessing window](/lesson/backfills) |
| What if we must correct three months of history? | Raw copies exist, and the jobs take a date as a parameter |
| What if the volume is ten times larger? | You know which part reaches its limit first |
| What if a person asks to have their data deleted? | You know each place where it is stored |

If the design has an answer for each row, it is a real design.

## Numbers before tools

Estimate the size before you choose anything. Simple arithmetic is enough.

- **Rows each day** × **bytes for each row** = volume each day. One million orders of 1 KB is 1 GB a day in raw form, and much less in Parquet. That is small.
- **Events each second at the peak**, not the average. A shop can have ten times its average during a sale.
- **Growth** in a year.
- **History** to keep.

These numbers remove most options. At 1 GB a day, a distributed engine is not needed. At 50,000 events each second, a single database insert for each event will not work.

## State the compromises

Each choice gives something up. A good design says what, and why that is acceptable here.

- Fresher data **against** cost and complexity.
- Managed services **against** control and unit cost.
- One platform for everything **against** the best tool for each job.
- Strict tests that stop the pipeline **against** availability of the data.
- Detailed history **against** storage and privacy.

Write the decisions that matter as short records: the context, the decision, the alternatives and the reason. In an interview, say the same things aloud.

## Start small, and say what comes next

The first version must be the simplest design that meets the requirements of today. Then name the specific signals that will make you change it: “when the hourly sync is no longer fast enough, replace the connector with CDC”. A design with a clear next step is better than a design that tries to be final.

## In an interview

The same seven steps give a structure for 45 minutes.

1. **Ask questions first**, for about five minutes: users, freshness, volume, sources. A candidate who starts to draw at once has skipped step 1.
2. **Say the numbers** you assume.
3. **Draw the simple design** from right to left.
4. **Go deeper** where the interviewer shows interest: the model, the ingestion of one difficult source, or the failure cases.
5. **Name the compromises** and what you would change at ten times the scale.

> **Pitfall.** One design for every problem. If your answer always contains the same five products, you are matching a pattern and not designing. The six worked examples that follow reach six very different designs from the same method.

## Remember

- Design from the users back to the sources.
- Seven steps: users, model, sources, ingestion, storage, transformation, operations.
- The freshest real requirement sets the fastest path. Build that path only for the use that needs it.
- Test the design with the failure questions.
- Estimate the size first. State the compromises. Start simple and name the next step.

::quiz
? Why design from the users back to the sources?
+ The requirements of the users decide which data, model and freshness are needed, and so what to build
- The sources are less important
- It makes the drawing easier to read
! If you start from the sources you load everything and hope that it is useful. If you start from the users, each part exists for a reason.
::end
