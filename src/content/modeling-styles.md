[Dimensional modeling](/lesson/dimensional-modeling) is the usual default, and it is not the only method. This lesson gives the three main alternatives and when each is a reasonable choice.

## Inmon: a normalized warehouse first

Bill Inmon, who is often called the father of the data warehouse, proposed a different order of work from Kimball.

- **Inmon.** First integrate all source data into one enterprise warehouse in third normal form, organised by subject: customer, product, order. Then build **data marts** from it for each department. The marts are often dimensional.
- **Kimball.** Build dimensional models directly for each business process, and connect them through conformed dimensions.

| | Inmon | Kimball |
|---|---|---|
| Central layer | Normalized, 3NF | Star schemas |
| First delivery | Slow. The integrated model comes first | Fast. One process at a time |
| Consistency | From the central model | From conformed dimensions |
| Risk | Long projects before any value | Marts that do not agree, if dimensions are not conformed |

Most modern platforms are a mix. A cleaned, integrated layer that looks like Inmon feeds dimensional marts that look like Kimball. The silver and gold layers in [Medallion](/lesson/architecture-patterns) follow this pattern.

## Data Vault: built for change and audit

Dan Linstedt designed Data Vault for large organisations with many source systems that change often. It divides every entity into three kinds of table:

- **Hubs** hold business keys only. `hub_customer` has one row for each customer id that has ever been seen.
- **Links** hold relationships between hubs. `link_order_customer` connects an order to a customer.
- **Satellites** hold the descriptive attributes and their history, with a load timestamp and the name of the source.

The properties that follow:

- **Insert only.** Nothing is updated, so every past state can be reproduced. Auditors like this.
- **Easy to extend.** A new source system is a new satellite on an existing hub. No existing table changes.
- **Loads in parallel.** Hubs, links and satellites have no load-order dependency on each other when hash keys are used.

The cost is a large number of tables and many joins. Nobody queries a Data Vault directly. You build dimensional marts on top of it. It is a method for the integration layer, and it is worth the cost when you have many sources, strict audit rules and a team that can automate the pattern. For a small team with five sources it is too much.

## One big table

A **wide table**, or one big table (OBT), is the fact table already joined to all its dimensions: one row for each event, with hundreds of columns.

```sql
SELECT category, month, SUM(amount)
FROM sales_wide
WHERE store_region = 'North'
GROUP BY category, month;
```

There are no joins. On a column store this is cheap, because unused columns are not read and repeated strings compress well. See [Row and column storage](/lesson/row-vs-column). Queries are simple, and business intelligence tools work well with it.

The disadvantages:

- **Changes are expensive.** A change to one product name means rewriting every row that contains it.
- **One grain only.** Each wide table answers questions at its own grain. Several wide tables can duplicate logic and then disagree.
- **No shared definitions** unless the wide tables are generated from a governed model.

A sound pattern is to keep the star schema as the source of truth, and to generate wide tables from it for specific dashboards.

## How to choose

| Your situation | Start with |
|---|---|
| General analytics, small or medium team | Kimball star schemas |
| One dashboard needs maximum speed and simplicity | A wide table generated from the star |
| Dozens of sources, regulation, audit requirements | Data Vault for integration, stars for serving |
| Strong central data team, enterprise-wide definitions first | Inmon-style normalized core, then marts |

> **From the community.** The question "is Kimball still relevant?" appears on r/dataengineering often. The usual conclusion is that cheap storage and column stores removed some of the performance reasons, but the reasons about meaning are unchanged: a declared grain, shared dimensions and tracked history are what keep numbers consistent.

## Remember

- Inmon: normalize and integrate first, then build marts. Kimball: build dimensional marts directly.
- Data Vault: hubs, links and satellites. Insert only, auditable, many tables.
- Wide tables are fast and simple to query. Generate them from a model. Do not use them as the model.

::quiz
? In a Data Vault, where is a customer's address stored?
- In the hub
- In a link
+ In a satellite
! Hubs hold business keys, links hold relationships, and satellites hold descriptive attributes with their history.
? What is the main risk of using several hand-built wide tables as the only model?
+ The same metric is calculated in several places and the results disagree
- Column stores cannot query wide tables
- Wide tables cannot hold dates
! Without a shared model, each table has its own copy of the business logic. Generate wide tables from one governed source.
::end
