---
title: Serving data and reverse ETL
summary: Data has value only when it is used. Dashboards, extracts, APIs, machine learning and writes back into business tools each need a different delivery.
track: pipelines
level: core
minutes: 8
at: [1, 2]
prereqs: [transformation-dbt]
tech: [bi, reverse, rtolap]
refs:
  - fode: Ch. 9, Serving Data for Analytics, Machine Learning, and Reverse ETL
---
Serving is the last stage of the [lifecycle](/lesson/lifecycle), and the only one that the business sees. A perfect pipeline that nobody reads has no value. Reis and Housley describe three main uses: analytics, machine learning and reverse ETL.

Each consumer needs a different form of delivery. The table is the same. The way it is reached is not.

## The ways to serve data

| Consumer | Delivery | Latency of a read | Notes |
|---|---|---|---|
| Managers, most employees | **Dashboards** in a BI tool | Seconds | Fixed questions. The tool queries the marts |
| Analysts | **SQL access** to the marts | Seconds to minutes | Open questions. Needs good documentation |
| Data scientists | **Tables or files**, notebooks | Minutes | Often want detailed data and history |
| Another team or company | **A shared dataset** or scheduled export | Hours | Treat the schema as a contract |
| An application | **An API**, or a serving database | Milliseconds | The warehouse is too slow. Copy the result to a fast store |
| A business tool: CRM, email, ads | **Reverse ETL** | Minutes to hours | Writes data into the tool that people already use |
| A machine learning model | **Feature tables** or a feature store | Batch or milliseconds | See [data for machine learning](/lesson/data-for-ml) |

## Analytics: three kinds

- **Business analytics** is dashboards and reports for decisions by people. Freshness of a day or an hour is usual.
- **Operational analytics** is a live view of something that is occurring now: stock in a warehouse, the health of a service. It needs minutes or seconds, and often [streaming](/lesson/batch-vs-streaming).
- **Embedded analytics** is charts inside a product for the customers of the company. It needs response in less than a second for many users, so it uses a [real-time OLAP store](/lesson/choosing-engine), and each customer must see only their own rows.

The same metric can be needed in all three. Define it once, in a [semantic layer](/lesson/semantic-layer) or a mart, and serve it in three ways.

## Reverse ETL

ETL moves data from operational systems into the warehouse. **Reverse ETL** moves modelled data from the warehouse back into operational systems.

An example: the warehouse is the only place where orders, support tickets and product usage are joined. From that join you compute, for each customer, a risk of cancellation. A score in a warehouse table helps nobody. Reverse ETL writes it into a field of the customer record in the CRM, where the account manager sees it each morning.

Common uses: customer segments to email and advertising tools, lead scores to the CRM, usage data to the support tool, and aggregated numbers to finance systems.

Tools include Hightouch, Census and the reverse connectors of ingestion products. A script that calls the tool’s API does the same thing.

Reverse ETL has risks that normal analytics does not have, because it **acts**:

- A defect is not a wrong chart. It is 40,000 customers who get the wrong email.
- The target API has rate limits and partial failures. The sync must be [idempotent](/lesson/idempotency): send only the changes, by key, and be safe to run again.
- A loop is possible. The CRM field you write can come back through ingestion as source data.
- Personal data leaves the governed warehouse. Check that the purpose is permitted.

Add a test that stops the sync when the number of changed records is far from normal.

## Serve data as a product

A dataset that other people depend on must have the properties of a product:

1. **Findable**: it is in a catalogue, with a description.
2. **Understandable**: each column is documented, and the grain is stated.
3. **Trustworthy**: it has tests, an owner and a stated freshness. Its current status is visible.
4. **Stable**: breaking changes are announced and versioned. See [schema evolution](/lesson/schema-evolution).
5. **Secure**: access is given by role, and sensitive columns are masked.

The largest part of trust is not accuracy. It is that when the data is late or wrong, the consumers hear it from you before they find it themselves.

## Self-service, with limits

Self-service means that people can answer their own questions without a request to the data team. It works when the marts are clean, named in business words, and documented. It fails when people are given raw tables: each person then writes their own cleaning logic, and the definitions drift apart.

Give wide access to marts and narrow access to raw data.

> **Pitfall.** Excel exports as the real product. If the main use of a dashboard is the download button, the users need something that the dashboard does not give. Ask what they do with the file.

> **Pitfall.** Dashboards that nobody opens. Each one costs compute at each refresh and attention at each change. Measure usage and remove the unused ones.

::scenario
? The sales team wants to see a health score for each account. The score is computed each night in the warehouse. The team works in the CRM all day.
+ Reverse ETL: write the score to a field on the account in the CRM | The information appears where the decision is made. Nobody must open a second tool.
~ A dashboard with the score for each account | The data is correct and available. In practice few people leave the CRM to look at it.
- An email with a spreadsheet each Monday | The file is out of date the next day and cannot be filtered with the other account data.
::end

## Remember

- Serving is where data gets its value. Choose the delivery for each consumer.
- Analysts read marts. Applications need a fast store. Business tools need reverse ETL.
- Reverse ETL acts on the business. Make it idempotent and put a limit test in front of it.
- A served dataset is a product: findable, documented, tested, stable and secure.

::quiz
? Why is a defect in a reverse ETL sync more serious than a defect in a dashboard?
+ It changes operational systems and can cause actions, such as emails to customers
- It is harder to find in the code
- Reverse ETL uses more storage
! A dashboard shows a wrong number. A sync writes the wrong number into tools that act on it automatically.
::end
