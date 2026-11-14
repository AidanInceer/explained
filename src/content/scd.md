Dimensions change. A customer moves to a different city. A product moves to a different category. A salesperson changes region. The changes are infrequent, which is why Kimball named these *slowly changing dimensions*, or SCD.

The question is what happens to history. Ana lived in Lisbon and placed an order. She then moved to Porto. In a report of sales by city, does that first order count for Lisbon or for Porto?

There is no single correct answer. It depends on the question. The SCD types are the standard set of answers.

::fig scd | Make Ana move, then change between Type 1 and Type 2. The fact rows are the same. Only the dimension design changes the report.

## Type 1: overwrite

Update the row. The old value is gone.

Use it when the old value was an error, such as a spelling correction, or when history has no use. It is simple, and every report shows the current view. The disadvantage is that reports for past periods change after the fact. Last year's "sales by city" gives a different number today than it did when it was first run.

## Type 2: add a new row

Keep the old row, mark it as expired, and insert a new row for the new version. This needs three additions to the dimension:

- A **surrogate key**, because there are now several rows for one customer. The source's `customer_id` is kept as a normal column, named the natural key or business key.
- **`valid_from` and `valid_to`** dates, which give the period in which the row was true.
- Usually an **`is_current`** flag, to make "the current version" easy to select.

When a fact row is loaded, it gets the surrogate key of the version that was valid on the event date. From then on, each fact points to the customer *as they were at that time*. No query needs date logic. A plain join gives historically correct results.

To get the current view from a Type 2 dimension, for example all of Ana's sales under her current city, join on the natural key to the row where `is_current` is true.

## Type 3: add a column

Keep a `previous_city` column next to `city`. This holds one earlier value only. It is used for planned, one-time changes such as a reorganisation of sales regions, where people want to see the numbers both ways for a time. It is uncommon.

## The other types, briefly

| Type | Method | Typical use |
|---|---|---|
| 0 | Never change the value | Original credit score, date of birth |
| 1 | Overwrite | Corrections |
| 2 | New row with validity dates | Most history tracking |
| 3 | Previous-value column | Planned one-time reclassification |
| 4 | Move fast-changing attributes to a separate mini-dimension | Age band, income band on a very large customer dimension |
| 6 | Types 1, 2 and 3 together | Both “as it was” and “as it is now” in one row |

One dimension can use different types for different columns: Type 1 for `email`, Type 2 for `city`.

## How Type 2 is built in practice

The pipeline compares each incoming source row with the current dimension row for the same natural key.

1. No current row exists: insert one.
2. A tracked column differs: set `valid_to` and `is_current = false` on the old row, and insert a new row.
3. Nothing differs: do nothing.

Tools have this built in. dbt names it a *snapshot*. Warehouses do it with `MERGE`.

> **Pitfall.** Type 2 can only record the changes that the pipeline sees. If you extract once each day and a value changes twice in a day, one version is lost. If you need every change, use [change data capture](/lesson/cdc).

> **Pitfall.** Make the validity periods join cleanly. The usual convention is that `valid_from` is inclusive and `valid_to` is exclusive, with a far-future date such as `9999-12-31` on the current row. Then `event_date >= valid_from AND event_date < valid_to` matches exactly one row.

## Remember

- Type 1 overwrites and loses history. Type 2 adds a row and keeps it.
- Type 2 needs a surrogate key and validity dates. Facts store the surrogate key of the version that was valid at the event time.
- Choose the type for each column from what the business must be able to ask.

::quiz
? A product was in the wrong category because of a typing error. Which type corrects it?
+ Type 1
- Type 2
- Type 3
! The old value was never true, so there is no history to keep. Overwrite it.
? Why does a Type 2 dimension need a surrogate key?
- Surrogate keys are faster than natural keys
+ One customer now has several rows, so the source id no longer identifies one row
- The source system requires it
! The natural key repeats for each version. The surrogate key identifies one version, and the fact table stores that key.
? A dimension is extracted each night. A customer's status changes at 10:00 and again at 15:00. What does a Type 2 dimension built from the nightly extract record?
- Both changes
+ Only the 15:00 value. The 10:00 value was never seen
- Neither
! A snapshot comparison sees only the state at extract time. Intermediate values need a change log from the source.
::end
