---
title: Metrics and the semantic layer
summary: Two dashboards show two revenue numbers. A semantic layer defines each metric once, and every tool reads that definition.
track: modeling
level: deeper
minutes: 8
at: [1, 3]
prereqs: [fact-table-types]
tech: [semantic, bi]
refs:
  - fode: Ch. 9, “Semantic and metrics layers”
  - reddit: Recurring threads on metrics layers
---
The marketing dashboard shows revenue of 4.2 million for May. The finance dashboard shows 3.9 million. The two are “correct”: one includes tax and the other does not, one counts by order date and the other by payment date. The meeting that should have been about the business is now about which number is true.

This is the most common failure of trust in data, and tables alone do not prevent it. A fact table stores amounts. It does not store the definition of “revenue”.

## What a metric is

A **metric** is a named calculation with an exact definition:

| Part | Example for “net revenue” |
|---|---|
| Measure and aggregation | `SUM(net_amount)` |
| Source | `fact_order_line` |
| Filters | Order status is paid. Test orders excluded |
| Time column | Order date, in the time zone of the shop |
| Permitted dimensions | Date, country, product category, channel |
| Owner | Finance |

If any one of these parts differs between two dashboards, the numbers differ.

## Where the definition can live

| Place | Effect |
|---|---|
| In each dashboard or analyst query | Each author writes the calculation again. Definitions drift apart |
| In the BI tool’s model (LookML in Looker, a Power BI semantic model, Tableau data sources) | One definition for that tool. Other tools and notebooks do not see it |
| In aggregated mart tables | One definition in SQL. But a new combination of dimensions needs a new table |
| In a **semantic layer** | One definition, read by every tool through an API or SQL interface |

## What a semantic layer does

A semantic layer is between the tables and the tools. It holds the definitions of metrics, dimensions and joins, as code in version control. A tool asks for “net revenue by country by week”. The layer writes the SQL, with the correct joins, filters and aggregation, and sends it to the warehouse.

```yaml
metrics:
  - name: net_revenue
    description: Paid order lines, tax excluded, by order date
    type: sum
    measure: net_amount
    filter: "order_status = 'paid' and not is_test"
dimensions: [order_date, country, product_category, channel]
```

Products in this area include the dbt Semantic Layer (MetricFlow), Cube, AtScale, and the semantic models inside Looker and Power BI. Several warehouses now also let you define metrics as database objects.

The layer solves three specific problems:

1. **One definition.** A change to “net revenue” is one reviewed change, and each dashboard gets it.
2. **Correct aggregation.** The layer knows that a balance is [semi-additive](/lesson/fact-table-types) and that a ratio must be computed after the sum, so users cannot add things that must not be added.
3. **Correct joins.** It knows the grain of each table, so it does not cause [fan-out](/lesson/sql-and-queries).

It is also the place where language-model assistants get reliable answers. A model that writes SQL against raw tables must guess the business rules. A model that asks the semantic layer for a named metric cannot get the definition wrong.

## Marts and one big table

Not every team needs a semantic layer product. Two simpler designs give much of the value.

- **Marts** are fact and dimension tables prepared for one business area. If the measures in the mart are already filtered and cleaned (`net_amount` exists only for valid lines), there is less to define later.
- **One big table** joins a fact to all its dimensions in advance. Analysts query one wide table with no joins. Column stores handle wide tables well. The cost is that each new attribute means a rebuild.

A reasonable progression: start with clean marts and written definitions. When the same metric is implemented in three places, move the definitions into a layer.

## Governance of metrics

The tool is the smaller part. The larger part is agreement.

- Each metric has **one owner** who decides its definition.
- Each metric has a **written description** that a new employee can understand.
- Metrics that sound the same and are not get **different names**: `revenue_gross`, `revenue_net`, `revenue_recognised`.
- A change to a definition is announced, with the date from which it applies and its effect on history.

> **Pitfall.** A semantic layer with 900 metrics that nobody owns. The problem of many definitions has moved into one file and not been solved. Start with the ten numbers that the leadership looks at each week.

> **Pitfall.** Logic in the dashboard. A calculated field in a BI tool is invisible to version control, to tests and to every other tool. Move it down into the model.

## Remember

- A table stores amounts. A metric is an exact definition: aggregation, filters, time column, dimensions.
- Two dashboards disagree when the definition is written in two places.
- A semantic layer keeps each definition once, as code, and writes the SQL for every tool.
- Clean marts and clear names give much of the value. Ownership gives the rest.

::quiz
? Two dashboards show different revenue for the same month from the same fact table. What is the most probable cause?
+ Each dashboard has its own calculation, with different filters or a different date column
- The warehouse returned wrong results
- One dashboard has a slower refresh
! The table is the same, so the difference is in the definition. That is the problem a semantic layer removes.
::end
