In an [ELT](/lesson/etl-vs-elt) design the raw data is already in the warehouse, and the transformations are SQL that runs there. The open question is how to manage hundreds of SQL statements that depend on each other. The most common answer is **dbt** (data build tool). SQLMesh, Dataform and Coalesce work on the same idea, so the concepts here apply to them too.

## The idea: a model is a SELECT

A dbt **model** is one file that contains one `SELECT` statement. The name of the file is the name of the table. You do not write `CREATE TABLE` or `INSERT`. dbt adds those.

```sql
-- models/staging/stg_orders.sql
select
    id                          as order_id,
    customer_id,
    cast(total as numeric(12,2)) as amount,
    lower(status)               as status,
    created_at                  as ordered_at
from {{ source('shop', 'orders') }}
```

To use one model in another, you refer to it with `ref()`:

```sql
-- models/marts/fct_orders.sql
select o.order_id, o.ordered_at, c.country, o.amount
from {{ ref('stg_orders') }} o
join {{ ref('stg_customers') }} c using (customer_id)
where o.status = 'paid'
```

From the `ref()` calls dbt builds the dependency graph. It runs the models in the correct order, and in parallel where it can. You never write the order yourself.

::fig dbt-layers | Select a model. dbt builds it and everything it depends on, in order.

## The layers

The dbt project guide recommends three layers. They are the same idea as bronze, silver and gold in the [medallion architecture](/lesson/architecture-patterns).

| Layer | Prefix | Rule | Stored as |
|---|---|---|---|
| **Staging** | `stg_` | One model for each source table. Rename, cast types, basic cleaning. No joins. The only layer that reads raw data | Views |
| **Intermediate** | `int_` | Joins and business logic in reusable steps. Not shown to users | Views or ephemeral |
| **Marts** | `fct_`, `dim_` | [Fact and dimension](/lesson/dimensional-modeling) tables for users. Documented and tested | Tables |

The staging rule matters most. If the source renames a column, you change one staging model, and nothing after it changes.

## Materialisations: how a model is stored

| Materialisation | What dbt does | Use when |
|---|---|---|
| **View** | Creates a view. The query runs each time someone reads it | The model is light, or always needs the newest data |
| **Table** | Builds the whole table again at each run | The model is read often and a full rebuild is fast enough |
| **Incremental** | Processes only new or changed rows and merges them in | The table is large and a full rebuild is slow or costly |
| **Ephemeral** | Puts the SQL inside the models that use it. Nothing is created | A small step that needs no table |
| **Snapshot** | Records each change to a source row as [Type 2 history](/lesson/scd) | The source keeps only the current state |

Start with views and tables. Change a model to incremental when the build time or the cost tells you to, not before: incremental models have more ways to be wrong.

```sql
{{ config(materialized='incremental', unique_key='order_id') }}

select * from {{ ref('stg_orders') }}
{% if is_incremental() %}
  where updated_at > (select max(updated_at) from {{ this }})
{% endif %}
```

## Tests and documentation, next to the code

A YAML file next to the models declares tests and descriptions.

```yaml
models:
  - name: fct_orders
    description: One row for each paid order.
    columns:
      - name: order_id
        description: Primary key.
        tests: [unique, not_null]
      - name: country
        tests:
          - relationships: { to: ref('dim_countries'), field: country_code }
```

`dbt build` runs each model and then its tests. If a test fails, the models after it are not built, so bad data does not reach the marts. The same files produce a documentation website with a lineage graph. The lesson on [data quality](/lesson/data-quality) covers which tests to write.

## What dbt is not

- It does not **extract or load** data. Something else must bring the raw tables.
- It is not an **orchestrator** for work outside the warehouse. For a few scheduled runs, dbt Cloud or a CI job is enough. With many other kinds of job, an [orchestrator](/lesson/orchestration) runs dbt as one of its tasks.
- It has no **compute**. The warehouse runs the SQL, and the warehouse sends the bill.

## SQL or code?

| | SQL in the warehouse (dbt, SQLMesh) | DataFrame code (Spark, Polars, pandas) |
|---|---|---|
| Good for | Joins, filters, aggregations: most business logic | Complex logic, machine learning, unstructured data, calls to other services |
| Who can maintain it | Analysts and engineers | Engineers |
| Tests | Data tests are simple. Unit tests are newer | Normal unit tests |
| Scale | The warehouse scales it | You size the cluster |

Use SQL as the default and code for the parts where SQL becomes unreadable.

> **Pitfall.** One model of 800 lines. It cannot be tested in parts and nobody dares to change it. Split it into intermediate models that each do one thing.

> **Pitfall.** Marts that read raw tables directly. The cleaning logic is then repeated in each mart, and a source change breaks all of them.

> **Pitfall.** Everything incremental. An incremental model that misses late rows is wrong in a quiet way. Plan a regular full refresh, or a window that reprocesses the last few days.

## Remember

- A model is one SELECT in one file. `ref()` gives the dependencies, and the tool finds the order.
- Staging cleans one source table. Intermediate joins. Marts serve users.
- Choose view, table or incremental by build time and cost.
- Tests and descriptions are in the same repository and run with each build.

::quiz
? How does dbt know the order in which to build the models?
+ It reads the `ref()` calls in the SQL and builds a dependency graph
- You number the files
- It builds them in alphabetical order
! Each `ref()` is an edge in the graph. A model is built after the models it refers to.
? Why does the staging layer contain no joins?
- Joins are slow in views
+ So that each source table is cleaned in exactly one place, and a source change is corrected in one model
- dbt does not permit joins in staging
! One model for each source table isolates the source. All later models read the clean version.
::end
