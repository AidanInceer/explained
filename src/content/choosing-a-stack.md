A data stack is the set of tools that covers the [lifecycle](/lesson/lifecycle): ingestion, storage, transformation, orchestration, serving and monitoring. There are hundreds of products. The correct stack is not the most modern one. It is the one that your team can operate and that meets your requirements.

Chapter 4 of *Fundamentals of Data Engineering* is about this choice, and its main point is that architecture comes first and tools second. Decide what you need. Then find tools that do it.

## Start from these facts

1. **How many people will operate it?** Each tool you run yourself takes a part of a person, for all time.
2. **How fresh must the data be?** Daily, minutes or seconds. Ask for evidence.
3. **How much data,** and how fast does it grow?
4. **What kinds of work?** SQL and dashboards, or also machine learning and unstructured data?
5. **What do the people already know?**
6. **Which cloud** is the company on?
7. **What rules apply?** Data location, personal data, audit.

::fig choose-stack | Choose the size of the team and the freshness that the business needs.

## The parts, and the usual options

| Part | Buy (managed) | Run yourself (open source) |
|---|---|---|
| Ingestion | Fivetran, Airbyte Cloud, cloud services | Airbyte, Meltano, dlt, Debezium |
| Storage and query | BigQuery, Snowflake, Redshift, Databricks | Iceberg or Delta with Trino or Spark. DuckDB. Postgres. ClickHouse |
| Transformation | dbt Cloud, Dataform | dbt Core, SQLMesh, Spark |
| Orchestration | Managed Airflow (MWAA, Cloud Composer, Astronomer), Dagster Cloud, Prefect Cloud | Airflow, Dagster, Prefect |
| Streaming | Confluent Cloud, Kinesis, Pub/Sub, managed Flink | Kafka, Redpanda, Flink |
| BI | Looker, Power BI, Tableau | Metabase, Superset, Lightdash |
| Quality and observability | Monte Carlo, Soda Cloud, Elementary Cloud | dbt tests, Great Expectations, Soda Core, Elementary |
| Catalogue and governance | Atlan, Collibra, Unity Catalog, the catalogue of your cloud | DataHub, OpenMetadata |
| Reverse ETL | Hightouch, Census | Your own scripts |

## Build or buy

| | Buy | Build or run open source |
|---|---|---|
| Time to first result | Days | Weeks to months |
| Cost at small size | Low | High: people cost more than licences |
| Cost at large size | Can become very high | Lower for each unit, with a fixed cost in people |
| Control | Limited to what the product offers | Full |
| Operations | The vendor | You, also at night |
| Risk | Price changes, lock-in, the vendor closes | Key people leave |

A useful rule from the same book: put your own engineering into what gives your company an advantage, and buy the rest. The connector to your CRM is not an advantage. The model that prices your product can be.

Count the **total cost of ownership**, not the licence. A free tool that needs half an engineer costs more than most subscriptions.

## Three reference stacks

**Small: one to three people, batch.** Managed connectors into one cloud warehouse. dbt for transformations, run by dbt Cloud or a scheduled CI job. One BI tool. Tests in dbt. No cluster and no servers. This stack can serve a company of several hundred people.

**Medium: a team of five to fifteen.** The same base, with an orchestrator for the jobs that are not SQL, CI with a staging environment, CDC for the main databases, a catalogue, and data observability. Add a lakehouse if machine learning needs files and Spark. Add managed streaming for the one or two uses that truly need seconds.

**Large: several teams.** A platform team offers storage, compute, orchestration, CI templates and access control as a service. Domain teams build their own pipelines on it. Open table formats let several engines read one copy. A shared streaming platform with a schema registry. Cost is assigned to each team. See [data mesh](/lesson/data-mesh).

## Principles for the choice

- **Choose the simplest stack that meets the requirements of the next 12 to 18 months.** Not of the next five years. You do not know them.
- **Prefer reversible decisions.** Open formats (Parquet, Iceberg), standard SQL and logic in version control make the next migration possible. Reis and Housley call this planning for change.
- **Fewer tools.** Each tool has its own access model, its own failures and its own bill. Two tools that overlap are worse than one that is slightly less good.
- **Managed, until you can name the reason to run it yourself.** Valid reasons exist: cost at scale, a legal need to keep data on your own machines, a feature that no service offers.
- **Favour tools that many people know.** You will hire for them, and questions have answers online.
- **Test with your own data.** Run a proof of concept with the hardest real case, not the vendor’s demonstration.

## When to change

Change a part of the stack when you can name a limit you have reached: the nightly run does not finish before the morning, the warehouse bill doubles each quarter, the team waits days for a platform change. Do not change because a new tool is popular.

A migration costs more than the estimate, and for its duration you operate two systems. Move one part at a time, behind stable interfaces: if the marts keep their names and columns, their users do not know that the engine below has changed.

> **Pitfall.** Architecture for the CV. Kubernetes, Kafka and Spark for 20 GB of data. The team spends its time on the platform and none on the business.

> **Pitfall.** One tool for each small need. After two years there are 25 tools and no person who understands the whole path of the data.

::scenario
? A start-up of 60 people hires its first data engineer. The data is in Postgres, Stripe and HubSpot, about 15 GB in total. The founders want weekly metrics.
+ Managed connectors, a cloud warehouse or DuckDB, dbt, and one BI tool | One person can build and operate this in weeks. Each part can be replaced later with no change to the others.
- Kafka, Spark on Kubernetes and a data lake, “to be ready for scale” | One engineer cannot operate this and also deliver metrics. The scale it prepares for may never come.
~ Python scripts on a schedule that write to Postgres | Very low cost, and fine for a start. The scripts become a private framework that only their author understands.
::end

## Remember

- Requirements and team size decide the stack. Tools come second.
- Buy what is the same for every company. Build what makes yours different.
- Count people in the cost.
- Choose simple, managed and reversible. Go up in complexity only at a named limit.

::quiz
? Why is “free and open source” not the same as “low cost”?
+ Someone must install, upgrade, secure and repair it, and that time is usually the largest cost
- Open-source tools are slower
- Open-source licences are expensive
! The total cost of ownership includes the people who operate the tool. For a small team that part is larger than a subscription.
::end
