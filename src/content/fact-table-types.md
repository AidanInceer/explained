A fact table records measurements. Kimball describes three kinds, and each answers a different type of question. Most real models need all three, built from the same source events.

::fig fact-types | The same stock room and the same orders, as three kinds of fact table.

## Transaction fact tables

One row for each event, at the moment it occurs: a sale, a click, a payment, a stock movement. Rows are inserted and not changed.

This is the most detailed and the most flexible kind. You can sum it by any dimension and for any period. When you are not sure which kind you need, start here.

Its limit: it tells you what happened, not what the state was. To know the stock on 4 June from a table of movements, you must add all movements from the start of time to that date.

## Periodic snapshot fact tables

One row for each thing for each period: the stock of each product at the end of each day, the balance of each account at the end of each month.

A row exists also when nothing happened. A product with no movement on 4 June still has a row for that day. This makes the table **dense** and predictable in size: products × days.

Use it for levels: stock, balance, number of open tickets, number of active subscriptions. The questions are “how much was there on this date?” and “how did it change in time?”

## Accumulating snapshot fact tables

One row for each instance of a process that has a start, some steps and an end: an order, an insurance claim, a job application, a flight booking. The row has a date column for each step. The row is inserted at the first step and **updated** when each later step occurs.

Use it to measure the time between steps and to find where items are waiting. “How many orders were paid but not shipped after two days?” is one filter on this table. From a transaction table the same question needs the events of each order to be put side by side first.

It is the only one of the three that is updated. That makes the load more complex: each run must find the rows that changed and [merge](/lesson/idempotency) them.

## Compared

| | Transaction | Periodic snapshot | Accumulating snapshot |
|---|---|---|---|
| One row is | One event | One thing in one period | One item through a process |
| Rows are | Inserted only | Inserted only | Inserted, then updated |
| Dates | One | One (end of period) | One for each step |
| Size grows with | Activity | Things × periods | Number of items |
| Typical question | How much was sold? | What was the level? | How long did each step take? |
| Example | Order lines | Daily stock | Order fulfilment |

## Additive, semi-additive, non-additive

A measure is **additive** if you can sum it across every dimension. Quantity sold is additive: sum by product, by shop, by day.

A measure is **semi-additive** if you can sum it across some dimensions but not across time. Stock on hand is the usual example. You can add the stock of all products on one day. You cannot add the stock of Monday to the stock of Tuesday: 60 pens on each of two days is not 120 pens. Across time you take the last value or the average. All measures of level in periodic snapshots are semi-additive.

A measure is **non-additive** if a sum has no meaning in any dimension: a ratio, a percentage, a unit price. Store the parts (the numerator and the denominator), which are additive, and compute the ratio after the sum.

> **Pitfall.** `SUM(balance)` over a month of daily snapshots. The result is about 30 times too high, and it looks plausible in a chart. Semi-additive measures need a rule in the [semantic layer](/lesson/semantic-layer), or a clear name such as `end_of_day_balance`.

## Factless fact tables

Some events have no number to measure. A student attended a class. A product was on promotion in a shop on a day. The fact table then contains only keys, and the measure is the count of rows.

A factless table of “what was possible” is the way to answer questions about things that did **not** occur: which promoted products had no sales? Compare the promotion table with the sales table.

## How they are built together

One stream of source events can give all three:

1. Load the events as a **transaction** fact table. This is the base.
2. Aggregate it by day into a **periodic snapshot** for the questions about levels and trends.
3. Pivot the events of each item into an **accumulating snapshot** for the questions about duration.

Keep the transaction table. The other two can be built again from it at any time.

::scenario
? A subscription company wants a chart of the number of active subscriptions at the end of each month, for three years.
+ A periodic snapshot: one row for each subscription for each month with its status | The question is about a level at regular times. The chart is one count for each month, and history does not change when a subscription is later cancelled.
~ A transaction table of start and cancel events, with a running total | It is correct and uses less storage. Each query must add all events from the first day, and the SQL is harder to get right.
- An accumulating snapshot with one row for each subscription | It shows the state of each subscription now. To get the count for a past month you must reason about start and end dates in each query.
? Operations wants to know how long support tickets wait between “opened”, “assigned” and “solved”.
+ An accumulating snapshot: one row for each ticket, a timestamp for each step | The durations are subtractions between columns in one row, and “assigned but not solved” is a simple filter.
- A periodic snapshot of open tickets each day | It shows how many are open, not how long each one waits.
~ The transaction table of status changes | All the information is there. Each analyst must pivot the events for each question.
::end

## Remember

- Transaction: one row for each event. The most detailed. Start here.
- Periodic snapshot: one row for each thing for each period. For levels.
- Accumulating snapshot: one row for each item in a process, updated at each step. For durations.
- Levels are semi-additive: do not sum them across time.

::quiz
? A table has the balance of each bank account at the end of each day. Which total is wrong?
- The sum of all accounts on 3 June
+ The sum of one account across all days of June
- The average of one account across June
! A balance is semi-additive. It can be added across accounts on one date, but not across dates.
::end
