SQL is the language that almost every data system understands. Warehouses, lakehouse engines, stream processors and transformation tools all use it. If you learn one thing well before anything else, learn SQL.

SQL is **declarative**. You describe the result you want, and the engine decides how to compute it. You do not write loops. This is why the same query can run on a laptop and on a cluster of 500 machines.

## The order in which a query runs

You write `SELECT` first, but the engine does not run it first. Many errors come from this difference.

::fig sql-order | The logical order of execution. An engine can change the physical order to be faster, but the result is as if it ran in this order.

Two consequences:

- You cannot use a column alias from `SELECT` in `WHERE`, because `WHERE` runs earlier.
- `WHERE` filters rows before grouping. `HAVING` filters groups after it.

## Joins

A join matches rows of two tables on a condition.

| Join | Returns |
|---|---|
| `INNER JOIN` | Only the rows with a match in the two tables |
| `LEFT JOIN` | All rows of the left table. Columns of the right table are `NULL` where there is no match |
| `FULL OUTER JOIN` | All rows of the two tables |
| `CROSS JOIN` | Each row of the left table with each row of the right table |

The most common defect in analytic SQL is the **fan-out**. If one order has three payments, a join of orders to payments returns three rows for that order. A `SUM(order_amount)` after the join counts the order three times. Before each join, ask: is it one-to-one, one-to-many, or many-to-many? Check with a count before and after.

## Grouping and window functions

`GROUP BY` reduces many rows to one row for each group:

```sql
SELECT country, SUM(amount) AS revenue
FROM orders
GROUP BY country;
```

A **window function** computes across a set of rows and keeps each row. Use it for running totals, ranks and comparisons with the previous row.

```sql
SELECT
  customer_id,
  order_date,
  amount,
  SUM(amount)  OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total,
  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS recency
FROM orders;
```

`ROW_NUMBER()` with a filter on `recency = 1` gives the latest row for each key. Data engineers use this pattern constantly to **remove duplicates**.

## CTEs: queries you can read

A common table expression gives a name to a step. A long query becomes a list of short ones, each with one purpose.

```sql
WITH paid_orders AS (
  SELECT * FROM orders WHERE status = 'paid'
),
revenue_by_customer AS (
  SELECT customer_id, SUM(amount) AS revenue
  FROM paid_orders
  GROUP BY customer_id
)
SELECT * FROM revenue_by_customer WHERE revenue > 1000;
```

This is also the structure of a [dbt model](/lesson/transformation-dbt).

## NULL

`NULL` means “unknown”. It is not zero and it is not an empty string. Three rules prevent most surprises:

- `NULL = NULL` is not true. Use `IS NULL`.
- `WHERE status <> 'paid'` does not return rows where `status` is `NULL`.
- `COUNT(*)` counts rows. `COUNT(column)` counts the rows where the column is not `NULL`. `SUM` and `AVG` ignore `NULL`.

## Statements that change data

| Statement | Purpose |
|---|---|
| `INSERT` | Add rows |
| `UPDATE`, `DELETE` | Change or remove rows that match a condition |
| `MERGE` | Insert new rows and update existing ones in one statement, by a key. Often called an **upsert** |
| `CREATE TABLE AS SELECT` | Make a table from a query result |

`MERGE` and “delete then insert a partition” are the base of [idempotent pipelines](/lesson/idempotency).

> **Pitfall.** `SELECT *` in a pipeline. When the source adds a column, your table changes shape with no warning. In a column store it also reads every column, and you pay for it. Name the columns.

## Remember

- SQL describes the result. The engine chooses the method.
- The engine runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, in that order.
- Check each join for fan-out before you aggregate.
- Window functions compute across rows and keep each row. `ROW_NUMBER()` removes duplicates.
- `NULL` is unknown, and comparisons with it are not true.

::quiz
? Orders are joined to payments, and one order can have several payments. `SUM(orders.amount)` is too high. Why?
+ The join repeats each order once for each of its payments
- SUM ignores NULL values
- The WHERE clause runs after the SELECT
! This is fan-out. Aggregate the payments to one row for each order first, then join.
? Which clause can filter on `SUM(amount) > 1000`?
- WHERE
+ HAVING
- ORDER BY
! WHERE runs before the groups exist. HAVING runs after GROUP BY.
::end
