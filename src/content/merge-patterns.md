---
title: Merge, upsert and deduplicate
summary: "Four SQL patterns do most of the loading work: overwrite a partition, delete and insert, merge by key, and keep the latest row for each key."
track: pipelines
level: core
minutes: 9
at: [1, 4]
prereqs: [idempotency]
tech: [transformation, warehouses, tableformats]
refs:
  - functional: Sections on immutable partitions
  - kimball: Ch. 19, ETL Subsystems and Techniques
---
The lesson on [idempotent pipelines](/lesson/idempotency) gives the principle: a second run must give the same result as the first. This lesson gives the SQL. Four patterns cover nearly all loading work, and it is important to know which one fits which case.

## The problem they solve

A plain `INSERT` adds rows. If the job runs twice, or the source sends a row twice, the table has duplicates. Each pattern below is a way to write so that this cannot occur.

## Pattern 1: overwrite a partition

For data that is naturally divided by a period, replace the whole period.

```sql
-- BigQuery, Spark and Trino have a direct form
insert overwrite table fct_orders partition (order_date = '2025-06-03')
select order_id, customer_id, amount
from stg_orders
where order_date = '2025-06-03';
```

The run for 3 June deletes what was there for 3 June and writes it again. Ten runs give the same table as one.

**Use it for** facts with an event date: orders, clicks, payments. It is the simplest and the most robust pattern, and it makes [backfills](/lesson/backfills) trivial.

**It does not fit** when rows change after their date. An order of 3 June that is refunded on 20 June is not corrected by the run for 20 June.

## Pattern 2: delete, then insert

When there is no partition to overwrite, delete the rows that the run is about to write, then insert, in **one transaction**.

```sql
begin;
delete from fct_orders
where order_date between '2025-06-01' and '2025-06-03';

insert into fct_orders
select order_id, customer_id, order_date, amount
from stg_orders
where order_date between '2025-06-01' and '2025-06-03';
commit;
```

The transaction is necessary. Without it, a failure between the two statements leaves the table with the rows deleted and nothing in their place, and a reader in that moment sees a gap.

**Use it for** a window of reprocessing, such as “the last three days”, to pick up [late data](/lesson/backfills).

## Pattern 3: merge by key

When rows are updated in the source, match on the key. Update the rows that exist and insert the ones that do not. This is the **upsert**.

```sql
merge into dim_customer t
using stg_customers s
   on t.customer_id = s.customer_id
when matched and s.updated_at > t.updated_at then
  update set name = s.name, city = s.city, updated_at = s.updated_at
when not matched then
  insert (customer_id, name, city, updated_at)
  values (s.customer_id, s.name, s.city, s.updated_at);
```

Three details matter:

1. **The key must be unique in the source side.** If `stg_customers` has two rows for one customer, the merge fails on some engines, and on others it gives an unpredictable result. Deduplicate first, with pattern 4.
2. **The condition `s.updated_at > t.updated_at`** makes the merge safe against old data. A late or repeated message with an older timestamp does not overwrite a newer row.
3. **Deletes need their own clause.** A merge does not remove rows that are missing from the source. With [CDC](/lesson/cdc) the delete arrives as an event: `when matched and s.op = 'd' then delete`. Often it is better to set a `deleted_at` value, so that history is kept.

**Use it for** dimensions, for targets of CDC, and for any table where the source row changes.

**Its cost:** the engine must find the matching rows. On a large table, limit the search with a partition filter: `on t.customer_id = s.customer_id and t.order_date >= '2025-05-01'`. Without it, each merge scans the whole target.

## Pattern 4: keep the latest row for each key

Sources send duplicates: the same event twice, or several versions of one row. Keep one.

```sql
select *
from (
  select
    *,
    row_number() over (
      partition by order_id
      order by updated_at desc, _loaded_at desc
    ) as rn
  from raw_orders
)
where rn = 1;
```

`row_number()` gives 1 to the newest version of each `order_id`. The second sort column, the load time, breaks ties when two versions have the same `updated_at`. Without a tie-break the choice is random, and the result can differ between runs. That is a failure of idempotency that is very hard to find.

Several engines have a shorter form: `qualify row_number() over (...) = 1`.

**Use it** in the staging layer, before any merge or join.

## Which pattern

| Situation | Pattern |
|---|---|
| Events with a date, never changed after | 1. Overwrite the partition |
| Events with a date, with late arrivals | 2. Delete and insert a window of days, or 1 for each affected day |
| Rows that are updated in the source | 3. Merge by key |
| Rows that are updated, and you need each version | Insert each version (append-only), and build a [Type 2](/lesson/scd) table from them |
| Any source with possible duplicates | 4 first, then one of the others |
| A small table | Replace the whole table. The simplest of all |

Do not forget the last row. A table of 50,000 rows does not need a merge. `create or replace table` each run is idempotent by construction, and there is no incremental logic to get wrong.

## Append-only with a view

A different approach avoids updates completely. Write each version of each row to an append-only table, and never change it. Define a view, or a table that is rebuilt, with pattern 4 over it.

- The write is simple and fast, and it keeps full history.
- The read does the deduplication.

This is the bronze and silver idea of the [medallion architecture](/lesson/architecture-patterns): bronze has each change, silver has the current state.

## How dbt writes these

A dbt [incremental model](/lesson/transformation-dbt) chooses the pattern with one setting:

| `incremental_strategy` | Pattern |
|---|---|
| `insert_overwrite` | 1 |
| `delete+insert` | 2 |
| `merge` | 3 |
| `append` | Plain insert. Not idempotent alone |

## Test the property

Idempotency is easy to claim and easy to test: run the job twice for the same period, and compare the row count and a checksum of the table. Add this to [CI](/lesson/testing-ci-cd) for each incremental model.

> **Pitfall.** `append` with a filter on “rows newer than the maximum in the target”. If a run fails after it wrote half of its rows, the next run starts after the maximum and never loads the other half.

> **Pitfall.** A merge key that is not really unique. `order_id` is unique in each country’s system and not across them. The merge then updates the wrong rows. Test the key for uniqueness in the source before each merge.

## Remember

- Overwrite a partition for dated, immutable events. It is the most robust pattern.
- Delete and insert in one transaction for a window.
- Merge by key for rows that change, with a condition on the timestamp and a partition filter.
- Deduplicate with `row_number()` and a tie-break before you merge.
- Replace small tables in full.

::quiz
? Two versions of an order have the same `updated_at`. The deduplication sorts by `updated_at desc` only. What is the risk?
+ The engine chooses one of them at random, so two runs can give different results
- The two rows are deleted
- The query fails
! A sort with ties is not deterministic. Add a second column, such as the load time or the log position, to make the choice the same each run.
::end
