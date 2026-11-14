---
title: "Worked example: model a subscription business"
summary: "From five source tables to facts, dimensions and three metrics: monthly recurring revenue, churn and retention. Each decision is shown with its reason."
track: modeling
level: core
minutes: 11
at: [1, 4]
prereqs: [semantic-layer]
tech: [transformation, semantic, bi]
refs:
  - kimball: Ch. 2, Kimball Dimensional Modeling Techniques Overview
  - kimball: Ch. 18, Dimensional Modeling Process and Tasks
---
This lesson applies the modeling line to one case, from start to finish. The company is invented: it sells a software product by monthly or yearly subscription. The leadership wants three numbers: **monthly recurring revenue** (MRR), **churn** and **retention**.

Subscription businesses are a good exercise, because the important numbers are levels and changes of level, and a plain table of transactions does not give them directly.

## Step 1: the business process, in words

Start at the [conceptual level](/lesson/data-model-levels), with the people from finance.

> A **customer** (a company) has one or more **subscriptions**. A subscription is for one **plan**, with a price and a billing period. A subscription **starts**, can **change plan**, can be **paused**, and **ends**. Each period, an **invoice** is sent, and it is **paid** or not.

Questions that only the business can answer, and that change the model:

- Is MRR counted from the start of the subscription, or from the first payment? *From the start date, for active subscriptions.*
- How is a yearly plan counted? *The yearly price divided by 12.*
- Does a discount reduce MRR? *Yes.*
- Is a paused subscription churned? *No. It has MRR of zero and is not counted as churn until it ends.*
- Is a free trial a subscription? *It is, with MRR of zero.*

Write these down. Each one is a line in the metric definition later.

## Step 2: the sources

| Source table | One row is | Changes |
|---|---|---|
| `customers` | A customer account | Updated in place |
| `plans` | A plan and its list price | Prices change a few times a year |
| `subscriptions` | A subscription, with its **current** plan and status | Updated in place. History is lost |
| `subscription_events` | A change: started, upgraded, downgraded, paused, resumed, cancelled | Insert only |
| `invoices` | An invoice and its payment status | Updated when paid |

The key observation: `subscriptions` is a [state table](/lesson/source-systems). It cannot tell you what a customer paid last March. `subscription_events` can. The model is built on the events.

## Step 3: choose the grain

The questions are about levels at points in time: “What was MRR at the end of each month?” That is a [periodic snapshot](/lesson/fact-table-types).

| Table | Grain | Kind |
|---|---|---|
| `fct_subscription_event` | One change to one subscription | Transaction |
| `fct_subscription_daily` | One subscription on one day | Periodic snapshot |
| `fct_mrr_movement` | One customer in one month, with the change of MRR and its type | Derived from the snapshot |
| `fct_invoice` | One invoice | Transaction, for cash questions |

Why daily and not monthly for the snapshot? A monthly snapshot answers the main questions and is thirty times smaller. A daily one also answers “what was MRR on the day of the price change?” With 50,000 subscriptions, a daily snapshot is 18 million rows a year, which is small. Choose the finer grain when the cost is low, because you cannot get detail back from an aggregate.

## Step 4: the dimensions

| Dimension | Type | Reason |
|---|---|---|
| `dim_customer` | [Type 2](/lesson/scd) on country and segment | “MRR by segment” for last year must use the segment the customer had then |
| `dim_plan` | Type 2 on price and name | A plan that was renamed must still group correctly in history |
| `dim_date` | | With month, quarter and fiscal period |

The snapshot fact carries the MRR amount itself, computed at that day’s price and discount. It does not join to the plan price at query time. A fact must record what was true at the time.

## Step 5: build the snapshot from the events

The logic, in three steps of SQL:

```sql
-- 1. For each subscription, the period in which each state was valid
with states as (
  select
    subscription_id, customer_id, plan_id, status, monthly_amount,
    event_at                                              as valid_from,
    lead(event_at) over (partition by subscription_id
                         order by event_at)               as valid_to
  from stg_subscription_events
),
-- 2. One row for each subscription for each day that it existed
days as (
  select d.date_day, s.*
  from dim_date d
  join states s
    on d.date_day >= cast(s.valid_from as date)
   and d.date_day <  coalesce(cast(s.valid_to as date), current_date + 1)
)
-- 3. The fact: MRR is the amount when active, and zero when paused
select
  date_day, subscription_id, customer_id, plan_id,
  case when status = 'active' then monthly_amount else 0 end as mrr
from days
where status <> 'cancelled'
```

`lead()` is a [window function](/lesson/sql-and-queries). It turns a list of events into periods with a start and an end. This pattern, from events to validity periods to a daily snapshot, is one of the most reused in analytics engineering.

## Step 6: the metrics

**MRR** at the end of a month is the sum of `mrr` on the last day of the month. It is [semi-additive](/lesson/fact-table-types): you can sum it across customers on one day, and you must never sum it across days.

**MRR movement** explains the change from one month to the next. For each customer, compare MRR at the end of this month with the end of last month:

| Last month | This month | Movement type |
|---|---|---|
| 0, and never a customer | More than 0 | New |
| 0, and was a customer before | More than 0 | Reactivation |
| More than 0 | Higher | Expansion |
| More than 0 | Lower, and not 0 | Contraction |
| More than 0 | 0 | Churn |

The five types add up exactly to the change in total MRR. That identity is a strong [data test](/lesson/data-quality): `mrr_end = mrr_start + new + reactivation + expansion - contraction - churn`, for each month.

**Churn rate** has two common forms, and they give different numbers:

- **Customer churn**: customers lost in the month ÷ customers at the start of the month.
- **Revenue churn**: MRR lost to churn and contraction ÷ MRR at the start of the month.

**Net revenue retention**: (MRR at the start + expansion − contraction − churn) ÷ MRR at the start, for the customers that existed at the start. It can be more than 100%.

Each of these goes into the [semantic layer](/lesson/semantic-layer) with its name, its formula and its owner. “Churn” with no qualifier must not exist as a metric.

## Step 7: what was decided, and why

| Decision | Alternative | Reason |
|---|---|---|
| Build on events, not on the state table | Snapshot the `subscriptions` table each night | Events give full history from the first day, and can be replayed after a correction |
| Daily snapshot | Monthly snapshot | The cost is low, and questions inside a month can be answered |
| MRR stored in the fact | Join to the plan price | Prices and discounts change. The fact must hold the value of the day |
| Type 2 customer dimension | Type 1 | Segment and country are used to group history |
| Movement table at customer grain | At subscription grain | A customer who replaces one subscription with another has not churned |

The last row is a real trap. At the grain of the subscription, a customer who changes from a monthly to a yearly plan appears as one churn and one new sale. At the grain of the customer, it is an expansion or no change. The grain of a metric is part of its definition.

## Check the result

Before anyone uses it:

1. MRR for last month end agrees with the finance report.
2. The movement identity holds for each month.
3. Each subscription has no gaps and no overlaps in its validity periods.
4. The count of active subscriptions agrees with the source system for today.

> **Pitfall.** Churn measured on a state table. If a cancelled row is later deleted or reactivated in place, last year’s churn changes each time you compute it. Numbers that were reported must not move.

## Remember

- Ask the business for each rule before you write SQL. Each answer is a line of the metric definition.
- Levels in time need a periodic snapshot. Build it from events with validity periods.
- Store the value of the day in the fact.
- Decide the grain of each metric: customer or subscription.
- Use an accounting identity as a test.

::quiz
? Why is `fct_mrr_movement` at the grain of the customer, not the subscription?
+ A customer who replaces one subscription with another must not be counted as churn plus a new sale
- Customer tables are smaller
- Subscriptions have no dates
! The business question is about customers kept and lost. At subscription grain a plan change looks like a loss and a gain.
::end
