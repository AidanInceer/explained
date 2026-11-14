This lesson follows one slow query through four corrections. The numbers are from an invented case, but each step is one that occurs in real work. The method is the point: **read the plan, change one thing, measure, repeat**.

## The query

A dashboard shows revenue by product category for the last 30 days. It takes 14 minutes and scans 2.1 TB.

```sql
select p.category, sum(o.amount) as revenue
from orders o
join order_items i on i.order_id = o.order_id
join products p    on p.product_id = i.product_id
where date(o.created_at) >= current_date - 30
  and o.status = 'paid'
group by p.category
```

The tables:

| Table | Rows | Size | Layout |
|---|---|---|---|
| `orders` | 900 million | 600 GB | Partitioned by `created_date` |
| `order_items` | 2.6 billion | 1.5 TB | Not partitioned |
| `products` | 40,000 | 6 MB | |

## Step 0: look before you change anything

From the [query profile](/lesson/query-engines):

```
Aggregate [category]                                   1 min
└─ Join  i.product_id = p.product_id   (shuffle)       3 min
   ├─ Join  i.order_id = o.order_id    (shuffle)       7 min   rows out: 74 M
   │  ├─ Scan orders        partitions 1,460 of 1,460  2 min   rows out: 26 M
   │  └─ Scan order_items   2.6 billion rows, 1.5 TB   (in the join time)
   └─ Scan products         40,000 rows
```

Four things are visible:

1. `orders` reads **all 1,460 partitions**, though the filter is on 30 days.
2. `order_items` is read **in full**: 2.6 billion rows to match 26 million orders.
3. The join to `products`, a table of 6 MB, is a **shuffle** join.
4. Something else, which is not a performance problem: look at `sum(o.amount)`.

## Step 1: let the partition filter work

The filter is `date(o.created_at) >= ...`. The table is partitioned by `created_date`, a different column, and the filter also puts a function around its column. The engine cannot match either against the partition values, so it reads everything and filters after.

```sql
where o.created_date >= current_date - 30
```

**Result:** partitions 30 of 1,460. The scan of `orders` falls from 600 GB to 13 GB. Total time: 14 minutes → 11 minutes.

The gain is small, because `orders` was not the largest cost. This is the reason to read the plan first: the obvious defect is not always the expensive one.

## Step 2: stop reading all of order_items

`order_items` has no partition, so every query reads 1.5 TB. There are two corrections, and the second is the durable one.

**For the query:** nothing in the SQL can limit the scan, because `order_items` has no date column.

**For the table:** add `order_date` to `order_items` when it is built, and partition by it. An item belongs to exactly one order, so the date is known at load time. Then the query can filter the two tables:

```sql
join order_items i
  on i.order_id = o.order_id
 and i.order_date = o.created_date          -- lets the engine prune i
where o.created_date >= current_date - 30
  and i.order_date  >= current_date - 30
```

**Result:** `order_items` scan from 1.5 TB to 31 GB. Total time: 11 minutes → 2 minutes 40 seconds. Bytes scanned: 2.1 TB → 44 GB.

This is the largest single gain, and it came from a change to the **table**, not to the query. Many performance problems are layout problems. See [partitioning](/lesson/partitioning) and [clustering](/lesson/clustering).

## Step 3: broadcast the small table

`products` has 40,000 rows. A shuffle join sends 74 million item rows across the network to meet them. The engine chose this because the table had no statistics, so it did not know that the table was small.

Collect statistics (`analyze table products compute statistics`), or give a hint:

```sql
select /*+ broadcast(p) */ ...
```

**Result:** the second join no longer shuffles. Total time: 2 minutes 40 seconds → 1 minute 30 seconds.

## Step 4: aggregate before the join

After the first join there are 74 million rows, one for each item. The final result has 40 rows. Reduce the rows before the second join: sum by product first, then join to get the category.

And now the fourth observation from step 0. The original query sums `o.amount`, the amount of the **order**, once for each **item** of the order. An order with three items is counted three times. This is a [fan-out](/lesson/sql-and-queries). The report has been wrong since it was written. The correct measure is the amount of the item.

```sql
with items as (
  select i.product_id, sum(i.line_amount) as revenue
  from orders o
  join order_items i
    on i.order_id = o.order_id and i.order_date = o.created_date
  where o.created_date >= current_date - 30
    and i.order_date  >= current_date - 30
    and o.status = 'paid'
  group by i.product_id                      -- 40,000 rows leave this step
)
select p.category, sum(items.revenue) as revenue
from items
join products p on p.product_id = items.product_id
group by p.category
```

**Result:** the join to `products` now handles 40,000 rows, not 74 million. Total time: 1 minute 30 seconds → 20 seconds. And the revenue falls by 38%, because it is now correct.

## The record

| Step | Change | Time | Scanned |
|---|---|---|---|
| 0 | Start | 14 min | 2.1 TB |
| 1 | Filter on the partition column | 11 min | 1.5 TB |
| 2 | Partition `order_items` by date, and filter it | 2 min 40 s | 44 GB |
| 3 | Broadcast `products` | 1 min 30 s | 44 GB |
| 4 | Aggregate before the join, with the correct measure | 20 s | 44 GB |

On a platform that charges for bytes scanned, the cost of each run fell by a factor of about 48.

## One more step, outside the query

The dashboard runs this query each time someone opens it. The data changes once a day. Build a small table, `revenue_by_category_daily`, in the nightly run, and let the dashboard read that. The dashboard then answers in less than a second, and the 20-second query runs once a day. See [cost and performance](/lesson/cost-performance).

The order of thought is always the same: **read less, move less, compute once.**

## What to take from this

- The plan showed four problems. The most visible one (step 1) gave the smallest gain.
- The largest gain was a change of table layout.
- A missing statistic made a 6 MB table expensive.
- The performance work found a correctness defect. This is common: a query that produces far more rows than expected is often wrong and slow for the same reason.
- Each step was measured. Without the measurements, you cannot know which change helped.

> **Pitfall.** To start with a larger cluster. More machines would have made the original query take perhaps 5 minutes, at three times the cost, and it would still report the wrong revenue.

::scenario
? A query scans a table of 800 GB that is partitioned by `event_date`. The filter is `where event_ts >= '2025-06-01'`. It reads all partitions.
+ Add a filter on `event_date` for the same range | The engine prunes on the partition column only. The filter on the timestamp can stay, for exactness.
~ Cluster the table by `event_ts` | It helps the engine skip blocks inside files. It is a table rebuild for a problem that one line of SQL solves.
- Increase the size of the warehouse | It reads the same 800 GB faster, and each run costs more.
::end

## Remember

- Read the plan before you change anything. Look at partitions, columns, join methods and row counts.
- Filter on the partition column itself, with no function.
- The layout of the table often matters more than the text of the query.
- Small tables must be broadcast. That needs statistics.
- Aggregate before you join, when it reduces the rows.
- Too many rows after a join can be a wrong result, not only a slow one.

::quiz
? In this example, which change gave the largest improvement?
- The broadcast hint
+ Partitioning `order_items` by date, so that 30 days are read and not all history
- The filter on `created_date`
! The scan of 1.5 TB was most of the cost. A date partition on that table removed nearly all of it.
::end
