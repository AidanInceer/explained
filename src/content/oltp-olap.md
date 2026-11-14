Almost every design decision in data engineering follows from one fact: there are two different kinds of database work, and a system built for one is poor at the other.

## Two workloads

**OLTP**, online transaction processing, is what an application does. A customer places an order. The application reads that customer's row, writes one order row, and updates one stock row. Thousands of these small operations occur each second, and each must finish in milliseconds.

**OLAP**, online analytical processing, is what an analyst does. "What was the revenue by country for each month of last year?" This query reads millions of order rows, but only three columns of each, and returns a few dozen lines.

| | OLTP | OLAP |
|---|---|---|
| Typical user | An application, for a customer | An analyst or a dashboard |
| One operation touches | A few rows, all columns | Millions of rows, a few columns |
| Reads and writes | Many small writes | Bulk loads, then mostly reads |
| Data held | The current state | History |
| Speed that matters | Milliseconds for each request | Seconds to minutes for each query |
| Design | Normalized, row storage, indexes | Denormalized, column storage, partitions |
| Examples | PostgreSQL, MySQL, DynamoDB | Snowflake, BigQuery, ClickHouse, DuckDB |

## Why not use one database for both

You can, when the data is small. Many companies start by running reports on a copy of the application database. It stops working for three reasons.

1. **Analytic queries slow the application.** A report that scans the full orders table competes with customers for memory and disk.
2. **The layout is wrong.** An OLTP database stores each row together, which is ideal when you need one complete order. An analytic query needs one column from every order. [Row and column storage](/lesson/row-vs-column) shows the size of this difference.
3. **The application keeps only the present.** When a customer changes address, the old address is overwritten. Analysis often needs to know what was true last year.

So the standard design is two systems. The OLTP database serves the application. A pipeline copies its data into an OLAP system, which is laid out for analysis and keeps history. That copy step is the reason data engineering exists.

## What ACID means and why OLTP needs it

An OLTP database must not lose or half-apply a change. The guarantees are named ACID:

- **Atomicity.** A transaction applies completely or not at all. A transfer never removes money from one account without adding it to the other.
- **Consistency.** Rules such as "stock cannot be negative" hold after every transaction.
- **Isolation.** Transactions that run at the same time do not see each other's partial work.
- **Durability.** After the database confirms a write, the write survives a crash.

Analytic systems relax some of these to gain scan speed. That is acceptable, because an analytic table is rebuilt from sources and is not the system of record.

> **For experienced readers.** The boundary is less sharp than it was. HTAP databases serve both workloads, and embedded engines such as DuckDB move OLAP onto a laptop. The workloads themselves are unchanged, so the layout trade-off is still there inside those products.

## Remember

- OLTP: many small reads and writes of complete rows. OLAP: few large scans of some columns.
- One layout cannot be best for both. This is why data is copied from one system to another.
- The source keeps the present. The analytic system keeps history.

After this lesson the map divides into six lines. You can take them in any order.

::quiz
? A query computes the average order value across 200 million orders. Which workload is it?
- OLTP
+ OLAP
! It scans many rows, reads one column and returns one number. That is the analytic pattern.
? Why does an application database usually not hold history?
- Disks are too small
+ It is designed to hold the current state, and an update overwrites the old value
- ACID does not permit it
! The application needs to know the customer's address now. Keeping every past value is the task of the analytic system.
::end
