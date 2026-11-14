---
title: Conceptual, logical, physical
summary: "Model in three steps: the business things and how they relate, then tables and keys, then types, partitions and engine details."
track: modeling
level: core
minutes: 8
at: [1, 0]
prereqs: [stakeholders-requirements]
tech: [catalog, transformation]
refs:
  - fode: Ch. 8, “Conceptual, logical, and physical data models”
  - beam: Part 1, modelling business events
---
A data model is a description of what the data means and how its parts relate. Good models are not designed in one step. They go through three levels, from the language of the business to the details of the engine.

::fig model-levels | One subject at three levels. Each level adds detail and is checked by a different person.

## 1. Conceptual: what exists in the business

The conceptual model names the **things** the business cares about and the **relationships** between them. It has no tables, no columns and no technology.

> A **customer** places **orders**. An order contains one or more **products**. An order is sent in one or more **shipments**. A shipment is carried by one **courier**.

You make it with business people, on a whiteboard, in their words. Its purpose is agreement. In this small example there are already questions that only the business can answer: Can an order have no customer (a guest checkout)? Can one shipment contain items of two orders? Each answer changes the tables.

Useful questions at this level:

- What are the main **entities**? (Nouns: customer, order, product.)
- What are the **events**? (Verbs: places, pays, ships, returns.)
- For each relationship: one-to-one, one-to-many, or many-to-many?
- What does each word **mean**? Is a “customer” a person, an account or a company?

The last question is the most important. A shared written definition for each term is called a **business glossary**, and many later disagreements about numbers are disagreements about a word.

## 2. Logical: tables, keys and grain

The logical model turns the concepts into structures, but still names no engine.

- Each entity becomes a table with **attributes**.
- Each table gets a **primary key**: the columns that identify one row.
- Relationships become **foreign keys**. A many-to-many relationship gets a table of its own.
- For an analytic model you choose the **grain** of each fact table: what one row represents.

At this level you choose the *style* of model. A source application uses a [normalized](/lesson/normalization) model, so that each fact is stored once. An analytic model usually uses a [dimensional](/lesson/dimensional-modeling) one, so that queries are simple. The conceptual model is the same for the two.

```
fact_order_line     grain: one product on one order
  order_id, line_number        (identify the row)
  customer_key, product_key, order_date_key   (to dimensions)
  quantity, net_amount         (measures)
```

A data analyst or another engineer can check a logical model: does each question from the [requirements](/lesson/stakeholders-requirements) have an answer in these tables?

## 3. Physical: how it is stored

The physical model is the real definition in a specific engine.

- **Data types**: `NUMERIC(12,2)` for money, not a float. `TIMESTAMP` with a time zone.
- **[Partitioning](/lesson/partitioning) and [clustering](/lesson/clustering)**: by date, by customer.
- **File format and table format**: Parquet in Iceberg.
- **Materialisation**: a table, a view, or an incremental table.
- **Names**, by the conventions of the team.

These choices do not change what the data means. They decide how fast and how expensive each query is. Because of this, you can change the physical model later without a change to the logical one, and you often will.

## Why not go directly to tables?

| If you skip | What goes wrong |
|---|---|
| The conceptual level | You model the source system’s tables, not the business. The words in your tables do not match the words people use |
| The logical level | The grain is not decided. Two tables are joined at different levels and totals are counted twice |
| The physical level | A correct model that is slow and expensive |

For a small change, the three levels can be three minutes of thought. For a new subject area, they are three separate conversations. In the two cases the order is the same: meaning first, structure second, storage last.

## A short method for a new subject

1. List the **business events** in the process: order placed, payment received, shipment sent.
2. For each event, write who, what, when, where, why and how. These become dimensions.
3. Write what is measured: quantity, amount, duration. These become facts.
4. Draw the entities and relationships. Show the drawing to the business.
5. Choose the grain of each fact table and write it in one sentence.
6. Only now, open the SQL editor.

> **Pitfall.** Copying the source schema. The tables of an application are designed for the application: `tbl_ord_hdr`, `status_cd = 3`. If you copy that structure into the analytic model, each analyst must learn the internals of each source system.

## Remember

- Conceptual: things and relationships, in business words. Checked by the business.
- Logical: tables, keys and grain. No engine.
- Physical: types, partitions, formats. Decides speed and cost, not meaning.
- Agree on the meaning of each word before you create a table.

::quiz
? At which level do you decide that a table is partitioned by date?
- Conceptual
- Logical
+ Physical
! Partitioning changes how the data is stored and how fast it is read. It does not change what the data means.
? Sales and finance use the word “customer” for different things. At which level must this be solved?
+ Conceptual
- Logical
- Physical
! It is a question of meaning. If it is not solved here, the tables will hold two definitions under one name.
::end
