The data engineering lifecycle, from *Fundamentals of Data Engineering*, is the most useful single picture of the field. It describes the stages that data goes through, not the tools. When you meet a new tool, ask which stage it serves.

::fig lifecycle | The lifecycle from Reis and Housley. Storage is not a step in the sequence. It is under every step.

## The stages

**Generation.** A source system creates the data: an application database, a mobile app that sends events, a sensor, a third-party API. The data engineer does not own these systems but must understand them. How often does the data change? Can a row be updated after it is written? Who do you call when the schema changes?

**Storage.** Data is stored at every stage: in the source, in a landing area, in the warehouse. The choice of storage decides what the later stages can do and what they cost. The [Storage line](/lesson/row-vs-column) covers this.

**Ingestion.** Moving data out of the source. This is where most pipeline failures occur, because it is where your system meets a system you do not control. The main decisions are batch or streaming, and push or pull. See the [Pipelines line](/lesson/etl-vs-elt).

**Transformation.** Raw data becomes useful data. Types are corrected, duplicates removed, tables joined, business rules applied. Data modeling is part of this stage. See the [Modeling line](/lesson/normalization).

**Serving.** The data reaches a use. There are three main uses:

- **Analytics**: dashboards, reports, ad hoc SQL.
- **Machine learning**: training data and features.
- **Reverse ETL**: modeled data is sent back into operational tools. For example, a customer score computed in the warehouse is loaded into the sales team's CRM.

## The undercurrents

Six subjects apply to every stage. The book calls them undercurrents.

| Undercurrent | The question it asks |
|---|---|
| Security | Who can read this, and should they? |
| Data management | Can people find, understand and trust it? |
| DataOps | How do we deploy changes safely and detect problems? |
| Data architecture | Do the parts fit, and can we change one part later? |
| Orchestration | What runs, in what order, and what if a step fails? |
| Software engineering | Is the pipeline code tested, versioned and readable? |

> **For experienced readers.** The lifecycle is a good tool for design reviews. For each stage, ask what the latency is, what the failure mode is, and who owns it. The stage with no clear owner is usually where the next incident comes from.

## Use the lifecycle to place a tool

| Tool | Stage or undercurrent |
|---|---|
| PostgreSQL in an application | Generation |
| Fivetran, Airbyte, Debezium | Ingestion |
| Kafka | Ingestion and storage |
| S3, Snowflake, BigQuery | Storage (the warehouses also transform and serve) |
| dbt, Spark | Transformation |
| Airflow, Dagster | Orchestration |
| Looker, Tableau | Serving |

## Remember

- Generation, ingestion, transformation, serving. Storage is under all of them.
- Serving has three forms: analytics, machine learning and reverse ETL.
- The undercurrents are not optional extras. They are what makes a pipeline safe to depend on.

::quiz
? A team loads customer scores from the warehouse into their email marketing tool every night. Which part of the lifecycle is this?
- Ingestion
- Generation
+ Serving, as reverse ETL
! The data is already modeled and is going to a use. That it moves into an operational tool makes it reverse ETL.
? Why is storage drawn under the other stages and not as one step between them?
+ Data is stored several times on its way through, and each stage depends on storage
- Storage is less important than the other stages
- Storage happens only at the end
! The source stores data, ingestion lands it somewhere, transformation writes new tables. Each of these is a storage decision.
::end
