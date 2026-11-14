Normalization is the method for designing the tables of an application database. You need it for two reasons: most of your sources are normalized, and analytic modeling is defined by how it departs from normalization.

## The problem: the same fact in many places

Here is an orders table that is not normalized:

| order_id | customer | customer_email | product | unit_price | qty |
|---|---|---|---|---|---|
| 1001 | Ana | ana@old.example | Boots | 80 | 1 |
| 1002 | Ana | ana@old.example | Laces | 4 | 2 |
| 1003 | Ben | ben@site.example | Boots | 80 | 1 |

Ana's email is stored twice, and the price of boots is stored twice. This causes three kinds of error, named **anomalies**:

- **Update anomaly.** Ana changes her email. If the application updates one row and not the other, the database holds two different answers.
- **Insert anomaly.** You cannot record a new product until someone orders it, because there is no row to put it in.
- **Delete anomaly.** Delete order 1003 and you also lose the only record that Ben exists.

## The fix: one table for each kind of thing

Divide the table so that each fact is stored once, and connect the tables with keys.

```
customers(customer_id PK, name, email)
products (product_id  PK, name, unit_price)
orders   (order_id    PK, customer_id FK, ordered_at)
order_items(order_id FK, product_id FK, qty)
```

A **primary key** (PK) identifies one row. A **foreign key** (FK) holds the primary key of a row in another table. Ana's email is now in one place. To change it is one write to one row.

## The normal forms, briefly

The normal forms are rules, each stricter than the one before.

- **First normal form (1NF).** Each cell holds one value. No lists in a cell, no repeated column groups such as `product1`, `product2`.
- **Second normal form (2NF).** 1NF, and every non-key column depends on the whole key. In `order_items`, the product's price depends only on `product_id`, not on the pair (`order_id`, `product_id`), so it belongs in `products`.
- **Third normal form (3NF).** 2NF, and non-key columns do not depend on other non-key columns. If `orders` held `customer_id` and `customer_email`, the email depends on the customer, not on the order.

The usual summary of 3NF: every non-key column must give a fact about the key, the whole key, and nothing but the key. Most application databases aim for 3NF.

## The cost: joins

To show the original report you now join four tables. For the application this is cheap, because it fetches one order at a time through indexes. For analysis across a hundred million orders, a four-table join in every query is expensive, and the queries are hard to write.

This is the trade-off:

| | Normalized | Denormalized |
|---|---|---|
| Each fact stored | Once | Many times |
| Writes | Simple and safe | Must keep copies in agreement |
| Reads | Need joins | Need few or no joins |
| Good for | OLTP | OLAP |

Analytic models are deliberately less normalized. That is safe in a warehouse because the tables are rebuilt by a pipeline from the source. No application updates them row by row, so update anomalies cannot occur in the same way. The next lesson, [Dimensional modeling](/lesson/dimensional-modeling), shows the usual design.

> **Pitfall.** A price in `products` is the current price. An order must record the price *at the time of sale*, so `order_items` often has its own `unit_price` column. That is not a normalization error. It is a different fact.

## Remember

- Normalization stores each fact once, to prevent update, insert and delete anomalies.
- 3NF: every non-key column depends on the key, the whole key, and nothing but the key.
- Normalized designs are good for writes. Analytics uses fewer, wider tables.

::quiz
? A <code>shipments</code> table has the columns <code>shipment_id</code>, <code>warehouse_id</code> and <code>warehouse_city</code>. Which rule does it break?
- First normal form
+ Third normal form
- None
! <code>warehouse_city</code> depends on <code>warehouse_id</code>, which is not the key. The city belongs in a <code>warehouses</code> table.
? Why is denormalized data acceptable in a warehouse but a risk in an application database?
+ A pipeline rebuilds warehouse tables from the source, so copies cannot disagree
- Warehouses do not have primary keys
- Analysts do not need correct data
! The risk of duplication is that one copy is updated and another is not. If all copies are derived from one source in one job, they agree.
::end
