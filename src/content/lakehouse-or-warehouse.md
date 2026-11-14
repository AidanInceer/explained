---
title: "Warehouse or lakehouse: the decision"
summary: The same six questions, answered for three companies, give three different platforms. The method matters more than the answer.
track: architecture
level: core
minutes: 10
at: [1, 3]
prereqs: [choosing-a-stack]
tech: [warehouses, tableformats, catalog]
refs:
  - fode: Ch. 3, “Data warehouse”, “Data lake”, “Convergence”
  - lakehouse: Sections 1 and 2
---
The lesson on [warehouse, lake and lakehouse](/lesson/warehouse-lake-lakehouse) explained what each one is. The lesson on [choosing an analytic engine](/lesson/choosing-engine) listed the products. This lesson makes the decision, three times, for three invented companies. The same questions give three different answers, and that is the point.

::fig lakehouse | The three architectures again, as a reference for the decisions below.

## What is really different

In 2015 the two were far apart. Now they have moved toward each other: warehouses read open table formats and run Python, and lakehouses have fast SQL engines and fine-grained access control. The remaining differences are these.

| | Managed warehouse | Lakehouse on open formats |
|---|---|---|
| **Who holds the files** | The vendor, in its own format | You, in your object storage, as Parquet with Iceberg or Delta |
| **Engines** | The vendor’s engine | Several: Spark, Trino, Flink, and warehouse engines too |
| **Administration** | Very little | More: [table maintenance](/lesson/table-maintenance), a catalogue, engine versions |
| **SQL and BI** | Excellent, with no tuning | Good to excellent, depending on the engine and the care taken |
| **Python, ML, unstructured data** | Possible, inside the vendor’s limits | Natural. The files can be read directly |
| **Streaming writes** | Through an ingestion feature | Direct, from Flink or Spark |
| **Cost model** | Simple. Can be high at large scale | Storage is cheap. Compute can be chosen for each job. More to manage |
| **Lock-in** | To leave, you export everything | The data is already in an open format |
| **Skills needed** | SQL | SQL, and platform engineering |

## The six questions

1. **Who are the users, and what do they write?** SQL only, or also Python and Spark?
2. **What kinds of data?** Tables only, or also files, images, logs, documents?
3. **How large, and how fast does it grow?**
4. **How many people can operate the platform?**
5. **Is there a real need for several engines on the same data?**
6. **How strong is the need to be independent of one vendor?**

## Company A: a retailer with 12 analysts

- 300 GB of data, growing 100 GB a year. All of it from business systems.
- Twelve analysts who write SQL. Two data engineers. No data scientists.
- The use is dashboards and reports.

| Question | Answer |
|---|---|
| Users | SQL only |
| Data | Tables only |
| Size | Small |
| Operators | Two people, with pipelines to build |
| Several engines | No |
| Independence | Low priority |

**Decision: a managed warehouse.** Every answer points the same way. A lakehouse would give them flexibility that they have no use for, and a platform to operate with two people.

*What they give up:* the files are in the vendor’s format. If they must leave in five years, it is an export of 800 GB, which is a week of work. That is an acceptable price.

## Company B: a logistics company with a data science team

- 40 TB, growing fast: GPS positions from vehicles, plus business data.
- Fifteen data scientists who use Python and train routing models. Twenty analysts. A platform team of six.
- Position events arrive as a stream.

| Question | Answer |
|---|---|
| Users | SQL and Python, in about equal parts |
| Data | Tables, and very large event data |
| Size | Large |
| Operators | Six people |
| Several engines | Yes: Spark for training, a SQL engine for BI, Flink for the stream |
| Independence | Medium |

**Decision: a lakehouse.** The data scientists need direct access to the files with their own tools. The stream writes straight into tables. One copy serves three engines. The team has the people to run it.

*What they give up:* simplicity. They must run compaction, manage a catalogue, and tune the SQL engine so that the analysts get warehouse-like speed. If the platform team shrinks to two, this choice becomes a burden.

## Company C: a bank

- 8 TB of structured data. Strict regulation. Reports must be reproducible for seven years.
- Sixty analysts on SQL. A risk team that runs models in Python. A platform team of ten.
- The legal department requires that the bank can change vendor.

| Question | Answer |
|---|---|
| Users | Mostly SQL. One Python team |
| Data | Tables |
| Size | Medium |
| Operators | Ten people |
| Several engines | Useful, not essential |
| Independence | **A hard requirement** |

**Decision: a warehouse engine on open tables.** The bank stores its data as Iceberg tables in its own object storage, and uses a managed warehouse as the main SQL engine on those tables. The analysts get the simple experience. The risk team reads the same tables with Spark. If the vendor must change, the data does not move.

*What they give up:* some performance and some features that the warehouse offers only on its own format, and they must manage the catalogue that both engines use.

This third shape is increasingly common. The question is no longer only “warehouse or lakehouse”. It is “which engines, on which format, and who owns the catalogue”.

## The catalogue is the new centre

When several engines read the same tables, something must be the single record of which tables exist, where their current metadata is, and who can read them. That is the **catalogue**: Unity Catalog, AWS Glue, Polaris, Nessie, the Hive metastore and others.

The choice of catalogue now decides more than the choice of engine: which engines can read and write, where access rules are enforced, and how hard it is to change later. Check that each engine you plan to use can **write** through the catalogue, not only read.

## Signals to change

| You have a warehouse, and… | Consider |
|---|---|
| Data scientists export large tables to files each week | Open tables that both can read |
| The bill grows faster than the value, driven by a few heavy jobs | Move those jobs to cheaper compute on open tables |
| You need a streaming writer with low latency | A lakehouse table for that stream |

| You have a lakehouse, and… | Consider |
|---|---|
| The platform team spends most of its time on maintenance | A managed service for the tables, or a warehouse for the BI part |
| Analysts complain about slow dashboards | A warehouse engine, or a [real-time OLAP store](/lesson/choosing-engine), on top |
| Nobody uses Spark any more | You may no longer need a lakehouse |

You do not have to choose one for everything. Many companies have a warehouse for business reporting and a lakehouse for events and machine learning. Two platforms mean two sets of access rules and two bills, so do it for a reason.

## Common wrong reasons

- **“A lakehouse is cheaper.”** Storage is cheaper. People are not. For a small team the total cost is usually higher.
- **“We need to avoid lock-in.”** Ask what the exit would cost. For 300 GB, it is a week. Lock-in is a real cost at petabyte scale and for regulated companies.
- **“Warehouses cannot do machine learning.”** Most can run Python now. The question is how much, and how the team prefers to work.
- **“We will need the scale later.”** Then change later. If the transformations are [SQL in version control](/lesson/transformation-dbt), most of the work moves.

::scenario
? A company of 200 people has 2 TB of business data, eight analysts, three data engineers, and one data scientist who starts next month.
+ A managed warehouse, with the option to write the largest tables in an open format later | The use is SQL reporting, and three engineers must build pipelines, not run a platform. One data scientist can work with the Python support of the warehouse.
~ A lakehouse, to be ready for the data science work | It serves the new colleague well. Three engineers now operate compaction, a catalogue and a SQL engine for eight analysts who needed none of it.
- Both, from the first day | Two platforms and two access models, for needs that one of them covers.
::end

## Remember

- The real differences are who holds the files, how many engines read them, and how much you operate.
- Six questions: users, kinds of data, size, operators, engines, independence.
- SQL users and a small team: a warehouse. Mixed users, large event data and a platform team: a lakehouse.
- A warehouse engine on open tables is a third option, and the catalogue is its centre.
- State what each choice gives up.

::quiz
? Which fact points most strongly toward a lakehouse?
+ Data scientists and a stream processor must read and write the same large tables as the analysts
- The company has fewer than ten analysts
- All data comes from two business systems
! Several engines on one copy of the data is the main thing a lakehouse gives. Without that need, a warehouse is simpler.
::end
