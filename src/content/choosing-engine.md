---
title: Choosing an analytic engine
summary: Postgres, DuckDB, BigQuery, Snowflake, Redshift, Databricks, ClickHouse. What each one is, and which fits which size of data and team.
track: storage
level: core
minutes: 10
at: [1, 5]
prereqs: [warehouse-lake-lakehouse]
tech: [warehouses, rtolap, batch]
refs:
  - fode: Ch. 4, Choosing Technologies Across the Data Engineering Lifecycle
  - reddit: "Recurring threads: “Snowflake or BigQuery or Databricks?”"
---
“Which warehouse should we use?” is one of the most frequent questions in the r/dataengineering community. This lesson describes the main engines as groups, says what each one is, and gives a method to choose. Products change quickly, so treat the names as examples of each group and check the current documentation and prices before you decide.

## The groups

| Group | Examples | What it is | Best when |
|---|---|---|---|
| **A relational database** | PostgreSQL, MySQL | A row store on one server | Less than about 100 GB of analytic data, a few users |
| **In-process analytic engine** | DuckDB, Polars | A column-store engine that runs inside your program, with no server | One machine is enough: up to hundreds of gigabytes of Parquet |
| **Cloud warehouse** | Snowflake, BigQuery, Redshift, Azure Synapse and Fabric | A managed column-store database. Storage and compute are separate | SQL analytics and BI for a company, with little administration |
| **Lakehouse platform** | Databricks, or open engines on Iceberg or Delta | Engines that query open table files in your object storage | Large data, machine learning, several engines on one copy |
| **Distributed SQL query engine** | Trino, Presto, Athena, Dremio | SQL over files and other databases. It stores nothing | Queries across a lake and several systems |
| **Real-time OLAP store** | ClickHouse, Apache Druid, Apache Pinot, StarRocks | A column store built for very fast aggregations, many users, fresh data | Analytics inside a product, with response in less than a second |

## How the cloud warehouses differ

All three large warehouses store data in columns, separate storage from compute, and speak SQL. They differ mainly in how you buy compute.

| | Compute model | You manage | Typical cost risk |
|---|---|---|---|
| **BigQuery** | Serverless. Pay for bytes scanned, or reserve capacity | Nearly nothing | A query with no partition filter on a large table |
| **Snowflake** | Virtual warehouses of a chosen size. Pay for each second they run | Warehouse sizes and auto-suspend | Warehouses that do not suspend, or are larger than needed |
| **Redshift** | A cluster of nodes, or a serverless mode | More: sort keys, distribution keys, vacuum | A cluster sized for the peak that is idle most of the day |
| **Databricks SQL** | SQL warehouses on a lakehouse. Pay for compute units | Cluster policies, table maintenance | Clusters that are always on |

For most teams the differences between these are smaller than the effect of three other facts: which cloud the company already uses, what the team already knows, and where the source data is. Moving large data between clouds costs money each day.

## A method to choose

::fig choose-engine | Choose the amount of data and the main kind of work.

Then check these points in order:

1. **Size and growth.** Be honest. Most companies have less than a terabyte of data that is actually queried. Jordan Tigani, one of the first engineers on BigQuery, made this argument in his essay “Big Data is Dead”.
2. **Who queries it.** Twenty analysts with heavy queries need a warehouse. Ten thousand customers with light queries need a real-time OLAP store or a normal database.
3. **Kinds of work.** SQL only, or also Python, machine learning and unstructured files? The second points toward a lakehouse.
4. **People.** A managed, serverless product needs no administrator. An engine you operate yourself needs at least a part of a person.
5. **Lock-in.** With an open table format in your own storage, a second engine can read the data. With a closed warehouse, to leave means to export everything.
6. **Price model.** Run your ten most typical queries and your heaviest load job in a trial. Do not trust a price list without a test.

## Small data deserves small tools

A common and expensive error is to copy the architecture of a very large company. If your data fits on one machine, an engine on one machine is faster and simpler than a cluster, because nothing travels over a network. DuckDB on a laptop reads a 50 GB Parquet dataset and returns aggregations in seconds.

You can start with Postgres or DuckDB and move to a warehouse when you reach a limit. If the transformations are SQL in dbt, most of that work moves with small changes.

## Real-time OLAP is a different group

A warehouse is designed for a small number of heavy queries. Queries take from one second to minutes, and there is a limit on how many run at once. That is fine for analysts. It is not acceptable for a customer who looks at a usage chart in your product.

ClickHouse, Druid and Pinot are built for that case: they ingest from a stream, keep data sorted and indexed for aggregation, and answer in tens of milliseconds at high concurrency. They are weak at large joins and at updates of single rows. Use them as a **serving layer** next to the warehouse, not in place of it.

::scenario
? A company of 40 people has 30 GB of data in a Postgres application database. The founder wants dashboards on sales and customer retention.
+ A read replica of Postgres, or a nightly copy into DuckDB, with dbt models and a BI tool | 30 GB is small. One machine answers these queries fast, the cost is near zero, and the dbt models can move to a warehouse later.
~ A cloud warehouse on its smallest setting, loaded by a managed connector | It works well and gives room to grow. It adds two paid services for a volume that does not need them yet.
- A Spark cluster on a data lake | The cluster takes longer to start than the queries take to run on one machine, and someone must operate it.
? A software company wants each of its 20,000 customers to see a live chart of their own API usage, inside the product.
+ A real-time OLAP store such as ClickHouse, fed from the event stream | Many users, simple aggregations by customer and time, fresh data, fast response. This is the purpose of that group.
~ A summary table in the application’s Postgres, updated each few minutes | It works while the volume of events is moderate, and it adds no new system. It reaches a limit when the raw events become billions.
- A direct query on the cloud warehouse for each page view | Each chart costs money and takes seconds, and the warehouse limits concurrent queries.
::end

## Remember

- Know the groups: database, in-process engine, cloud warehouse, lakehouse, query engine, real-time OLAP.
- The large warehouses are more alike than different. Your cloud, your team’s skills and the price model decide.
- Size the tool to the data you have. One machine is enough more often than people think.
- A warehouse serves analysts. A real-time OLAP store serves products.

::quiz
? Why is a cloud warehouse a poor backend for a chart that thousands of customers load in a product?
+ It is built for few heavy queries: each query takes seconds, costs money, and concurrency is limited
- It cannot store time-series data
- It has no SQL
! Warehouses optimise for throughput on large scans. Product analytics needs low latency at high concurrency.
::end
