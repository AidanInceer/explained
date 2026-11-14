---
minutes: 9
tech: []
refs:
  - ddia: Ch. 2, “Data Models and Query Languages”, and Ch. 3, “Storage and Retrieval”
  - seag: Ch. 22, “Large-Scale Changes”
---
An application's most valuable part is often its data: customers, orders, messages. Code can be rewritten in a month. Lost or corrupted data may never come back. The database is where that data lives, and how you design and change it matters more than almost any other choice.

## Relational databases

Most applications use a **relational database**, such as PostgreSQL, MySQL or SQL Server. Data lives in **tables** with fixed **columns**. Each row has a **primary key** that identifies it. Rows in one table refer to rows in another with a **foreign key**:

```sql
CREATE TABLE customers (
  id    bigint PRIMARY KEY,
  email text NOT NULL UNIQUE
);
CREATE TABLE orders (
  id          bigint PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES customers(id),
  total_pence integer NOT NULL CHECK (total_pence >= 0)
);
```

The database enforces these rules for you: an order cannot point to a customer who does not exist, an email cannot appear twice, a total cannot be negative. Rules in the database hold even when a bug or a script bypasses your application code.

You ask questions in **SQL**, which says *what* you want, and the database decides *how* to get it.

## Indexes

Without help, finding all orders of one customer means reading every order: O(*n*). An **index** on `customer_id` is a sorted structure, usually a B-tree, as [Trees and graphs](/lesson/trees-graphs) described, that finds them in a few steps.

- Add indexes for the columns you search, join and sort on.
- Each index slows down writes a little and uses space, so do not index everything.
- Use the database's `EXPLAIN` command to see whether a query uses an index.

> **Pitfall.** The classic slow page is the **N+1 query**: one query for 50 orders, then one query per order for its customer. That is 51 round trips to the database. Load the customers in one query with a join or an `IN` list.

## Other kinds of database

- **Document** databases, such as MongoDB, store JSON-like documents. Good when each record is self-contained and its shape varies.
- **Key-value** stores, such as Redis or DynamoDB, look up a value by key, very fast. Good for sessions, caches and simple high-volume lookups.

A relational database is the safe default. Choose another for a specific, measured reason.

## Migrations

The structure of the database, its **schema**, changes as the app grows. A **migration** is a script that changes it, kept in version control and run in order, so every environment has the same schema.

The hard part is changing a live database **without downtime**, while old and new versions of the app run side by side during a deploy. The safe pattern is **expand, then contract**:

1. **Expand**: add the new column or table. Old code ignores it.
2. Deploy code that writes to both old and new, then copy old data across.
3. Deploy code that reads only the new.
4. **Contract**: remove the old column, once nothing uses it.

Never rename or drop a column in the same release as the code change.

## Backups

A backup that has never been restored is a hope, not a backup. Back up automatically, keep copies in another place, and test a full restore regularly.

## Remember

- Relational databases keep data in tables, with keys and constraints that the database enforces.
- Index the columns you search on. Watch for N+1 queries.
- Change the schema with migrations, expand then contract, never in one step.
- Test restoring your backups.

::quiz
? A page lists 100 orders, and for each one runs a query to fetch its customer. What is the fix?
+ Fetch all the needed customers in one query, with a join or an IN list
- Add a faster CPU to the database
- Cache the page for a year
! This is the N+1 query problem: 101 round trips. One query for the customers removes 99 of them.
? You must rename a column in a live database used by the running app. What is the safe way?
- Rename it and deploy the new code at the same moment
+ Add the new column, write to both, move reads, then remove the old column later
- Stop the app for the night
! Old and new code run side by side during a deploy. Expand-then-contract keeps both working at every step.
::end
