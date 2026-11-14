This is the first worked design. It uses the [seven-step method](/lesson/design-method) on a common situation: a small company, transactional data, and a data team of two people. The company and its numbers are invented for the example.

The correct design here is intentionally plain. A large part of good engineering is to see when the plain design is enough.

## The situation

A company sells office supplies online. It has 80 employees and about 6,000 orders a day. Two people do all the data work. There is no data platform: the finance manager exports CSV files from the payment provider, and marketing looks at the charts of the shop software.

::fig wb-shop | The design in ten steps, in the order of the method. Use “Next step”, or “Expand” for a larger view.

## Step 1: users and requirements

| User | Decision | Freshness | Correctness |
|---|---|---|---|
| Finance | Monthly close. Daily revenue check | Daily, by 08:00 | Must agree with the payment provider, to the cent |
| Marketing | Which campaigns bring customers who buy again | Daily | A few percent is acceptable |
| Operations | Which orders are late. Which products are low in stock | Hourly | Each order must be present |

The freshest requirement is hourly. Nobody needs seconds. This one fact removes streaming from the design.

Out of scope for the first version: recommendations on the website, and stock forecasts.

## Step 2: the model

The business process is order fulfilment: an order is placed, paid, shipped and delivered, and sometimes returned.

| Table | Grain | Kind |
|---|---|---|
| `fct_order_line` | One product on one order | [Transaction](/lesson/fact-table-types) |
| `fct_payment` | One charge or refund | Transaction. Refunds are negative amounts |
| `fct_order_fulfilment` | One order, with a date for each step | Accumulating snapshot, for operations |
| `dim_customer` | One customer | Type 1, with the date of the first order |
| `dim_product` | One version of a product | [Type 2](/lesson/scd) on cost price, so that the margin of an old order uses the old cost |
| `dim_date` | One day | |

Two details to decide with finance, not alone: revenue is counted on the day of the payment, and tax is kept in a separate column.

## Step 3: the sources

| Source | Type | Volume | Changes | Owner |
|---|---|---|---|---|
| Shop database | PostgreSQL | 6,000 orders and about 15,000 lines a day. 25 GB in total | Orders are updated when the status changes. Has `updated_at` | The web developer |
| Payment provider | SaaS API | About 6,500 charges and refunds a day | Charges can change status for days: disputes, refunds | External |
| Courier | SaaS API | About 6,000 shipments a day | Status updates for a week | External |
| Cost prices | A spreadsheet | 4,000 products | Edited by hand by the purchasing manager | Purchasing |

Size estimate: less than 100 MB of new data a day. This is very small data, and it will be small for years.

## Step 4: ingestion

A [managed connector service](/lesson/ingestion-patterns) for all four sources, on an hourly sync.

The reason is the team. A payment API and a courier API each have pagination, rate limits and changes of version. Two people must not maintain that code. The connector for Postgres reads incrementally by `updated_at`.

A known weakness: an incremental query by `updated_at` does not see rows that are deleted. The developer confirms that orders are cancelled with a status and are never deleted, so this is acceptable. Write this assumption down. If it changes, the design must change.

## Step 5: storage

One [cloud warehouse](/lesson/choosing-engine). At this size the choice between products matters little: take the one in the cloud that the company already uses. The `raw` schema holds what the connector writes. Large tables are partitioned by date, though at this volume it has little effect.

No data lake, no Spark and no object storage layout to design.

## Step 6: transformation

[dbt](/lesson/transformation-dbt), in the three usual layers.

- **Staging**: one model for each raw table. Rename columns, set types, convert amounts from cents.
- **Intermediate**: join orders to payments. Give each order line its share of the order discount.
- **Marts**: the tables of step 2.

All models are full rebuilds at first. 25 GB builds in a few minutes, and a full rebuild cannot be wrong in the ways that an incremental model can. The product dimension uses a dbt snapshot of the spreadsheet for its Type 2 history.

## Step 7: operations

- **Schedule**: the connector syncs each hour. A scheduled job runs `dbt build` after it. No separate orchestrator yet: there is one chain of work.
- **Tests that stop the build**: primary keys are unique and not null. Each order line has a product. And the most important one: **for each day, the sum of paid orders equals the sum of charges from the payment provider**. This reconciliation is what finance did by hand, and it is the test that proves the pipeline.
- **Freshness**: an alert if a source has no new rows for three hours in working hours.
- **Access**: analysts read marts. Customer email and address are masked for everyone outside customer service.
- **Code**: one Git repository, pull requests, and [CI](/lesson/testing-ci-cd) that builds the changed models.
- **Cost**: the connector subscription is the largest item. The warehouse costs little at this volume.

## The failure questions

| Question | Answer in this design |
|---|---|
| The job runs twice | Full rebuilds replace the tables. The connector merges by primary key |
| The payment API does not answer for two hours | The connector tries again and continues from its cursor. The freshness alert goes off. The marts keep the last good data |
| A refund arrives ten days after the order | It is a new row in `fct_payment` on its own date. Revenue for the old day does not change, as agreed with finance |
| Someone enters a cost price of 0 in the spreadsheet | A test on the staging model for the spreadsheet fails. The build stops before the margin is wrong |
| The developer renames a column in the shop database | The staging model fails to compile in the next run. One model to correct. Ask the developer for notice before the next change |

## Alternatives, and why they were not chosen

| Alternative | Why not here |
|---|---|
| CDC from Postgres into Kafka | Gives seconds of freshness and deletes. Nobody needs seconds, there are no deletes, and it needs people to operate |
| Python scripts in place of the connector | Lower subscription cost. It would use a large part of the time of two people |
| A lake with Spark | 25 GB fits in the memory of one machine |
| Dashboards directly on a Postgres replica, with no warehouse | Works for shop data alone. It cannot join the payment provider and the courier, and that join is the whole value |

## When the company grows

Each change has a signal.

| Signal | Change |
|---|---|
| The hourly sync loads the shop database, or operations needs minutes | [CDC](/lesson/cdc) for the shop database only |
| The full rebuild takes more than about 15 minutes | Make the large fact models incremental |
| Marketing wants segments in the email tool | Add [reverse ETL](/lesson/serving-reverse-etl) |
| There are jobs outside dbt: forecasts, exports | Add an [orchestrator](/lesson/orchestration) |
| Two dashboards show different revenue | Move metric definitions into a [semantic layer](/lesson/semantic-layer) |
| The website needs recommendations in real time | A separate project. See the [fraud design](/lesson/case-fraud-stream) for that kind of system |

The marts keep their names through all of these changes, so the dashboards do not have to change.

## What to take from this design

- The requirement was hourly, so the design is batch. That decision came from step 1 and not from a preference for a tool.
- The team size decided build or buy.
- One reconciliation test, chosen with finance, gives more trust than fifty generic ones.
- Each simplification has a written assumption and a signal for when to revisit it.

::scenario
? Six months later, operations says the hourly data is too slow to catch stock problems during sales events. Everything else works.
+ Add CDC for the shop database tables that operations needs, and keep the rest as it is | The limit is in one path for one user. Change that path. Finance and marketing are served well by the existing design.
- Rebuild the whole platform on Kafka and Flink | It solves the problem and replaces a stable system that two people can operate with one that they cannot.
~ Set the connector to its shortest sync interval | It may give 5 to 15 minutes at once, with no new parts. It loads the shop database more during the events when it is busiest. Good as a first step, with CDC as the next.
::end
