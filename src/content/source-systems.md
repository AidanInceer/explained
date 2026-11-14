Data engineers do not create data. Other systems do: an application records an order, a sensor records a temperature, a person fills in a spreadsheet. These are **source systems**. The first stage of the [lifecycle](/lesson/lifecycle) is to understand them, because their limits become your limits.

## The common kinds of source

| Source | Example | How you read it | What to be careful of |
|---|---|---|---|
| **Application database** | The Postgres or MySQL database behind a web shop | SQL queries, or its change log | Your queries compete with customers. Rows are updated and deleted |
| **SaaS tool** | Salesforce, Stripe, HubSpot, Zendesk | The vendor’s API | Rate limits. The vendor changes the API. You see only what the API shows |
| **Files** | A CSV from a partner, an Excel sheet from finance | Copy from SFTP or a bucket | Formats change with no warning. A file can arrive late, twice, or half written |
| **Event stream** | Clicks on a website, messages between services | Subscribe to a topic | High volume. Events can be late, duplicated or out of order |
| **Logs and devices** | Server logs, IoT sensors | A collector agent | Very high volume, low value for each record |
| **Other teams’ data** | A table in the company warehouse | SQL | It can change when its owner changes it |

## Three shapes of data

- **Structured** data has a fixed set of typed columns: a database table. It is the easiest to use.
- **Semi-structured** data describes itself, usually as JSON. Each record can have different fields, and fields can be nested. Most APIs and events have this shape.
- **Unstructured** data has no fields: text documents, images, audio. To analyse it you must first extract structure from it.

```json
{ "order_id": 1004, "customer": { "id": 7, "city": "Porto" },
  "lines": [ { "sku": "PEN-1", "qty": 3 }, { "sku": "INK-9", "qty": 1 } ] }
```

This one JSON record becomes three tables in a relational model: orders, customers and order lines. A large part of transformation work is this change of shape.

## State and events

There are two ways for a source to describe the world.

A **state** source tells you what is true now. The `customers` table has one row for each customer, with their current city. When the customer moves, the row is overwritten and the old city is gone.

An **event** source tells you what happened. A “customer moved” event is added to a list, and nothing is overwritten.

You can compute the state from the events: replay them in order. You cannot compute the events from the state. This is why engineers prefer events when they can get them, and why [change data capture](/lesson/cdc) exists: it turns a state source into an event source.

## Questions to ask about each source

These are the questions that prevent the most problems:

1. **Who owns it**, and how do I contact them? Will they tell me before the schema changes?
2. **How much data** is there, and how fast does it grow?
3. **How does it change?** Are rows only inserted, or also updated and deleted? Is there a reliable `updated_at` column?
4. **How long is history kept?** Some systems delete data after 30 days. If you do not copy it in time, it is lost.
5. **Will my reads hurt it?** Is there a read replica? What is the rate limit?
6. **What does each column mean?** `status = 3` means something to the application team and nothing to you.
7. **Are there duplicates, late records or missing values**, and how often?

> **Pitfall.** Trusting the source schema as documentation. A column named `created_at` can hold the time the row was imported from an older system. Look at the data, and ask the owner.

> **In practice.** Read from a **replica** of an application database, not from the primary. A heavy analytic query on the primary can make the website slow, and the application team will, with good reason, remove your access.

## Remember

- You do not control source systems. Find out who does.
- State tells you what is true now. Events tell you what happened, and keep history.
- Semi-structured data is flexible to write and must be given structure before it is analysed.
- Ask how a source changes and how long it keeps history before you design the pipeline.

::quiz
? A table has one row for each product with its current price. Last month’s prices are needed for a report. What is the problem?
+ The table holds state. Old prices were overwritten and cannot be recovered from it
- The table is too large
- Prices are semi-structured
! A state source keeps only the present. To have history you must capture each change as it occurs, or take regular snapshots.
::end
