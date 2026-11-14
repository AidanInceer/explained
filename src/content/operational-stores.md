---
title: Key-value, document and other stores
summary: Relational is the default. Key-value, document, wide-column, search, time-series and vector stores each give up something to be fast at one access pattern.
track: storage
level: core
minutes: 9
at: [1, 1]
prereqs: [row-vs-column]
tech: [nosql, oltp]
refs:
  - ddia: Ch. 2, Data Models and Query Languages
  - fode: Ch. 5, “Source system practical details”
  - dbinternals: Part I, Storage Engines
---
The relational database is the default, and for good reasons: it is flexible, it has transactions, and everyone knows SQL. But some access patterns are served poorly by rows in tables. A group of other stores, often called **NoSQL**, each give up something general to be very good at one thing.

A data engineer meets these stores in two places: as **sources** to extract from, and as **serving stores** to load results into.

## The families

| Family | The data looks like | Very good at | Gives up | Examples |
|---|---|---|---|---|
| **Relational** (row store) | Tables with rows, keys and joins | Transactions, flexible queries | Scale beyond one large machine is hard | PostgreSQL, MySQL, SQL Server |
| **Key-value** | A key and an opaque value | Read and write by key in about a millisecond | Any query that is not by key | Redis, DynamoDB, Valkey |
| **Document** | JSON documents, with nested fields | Objects that change shape, read as a whole | Joins between documents | MongoDB, Firestore, Couchbase |
| **Wide-column** | Rows found by a partition key, sorted by a clustering key | Very high write volume, across many machines | Queries that the key design did not plan | Cassandra, ScyllaDB, HBase, Bigtable |
| **Search** | Documents with an inverted index | Full-text search, filters, relevance | It is not a safe system of record | Elasticsearch, OpenSearch |
| **Time-series** | Measurements with a timestamp | Recent ranges of time, downsampling | General queries | InfluxDB, TimescaleDB, Prometheus |
| **Graph** | Nodes and relationships | Many-step relationships: “friends of friends” | Large aggregations | Neo4j, Neptune |
| **Vector** | Lists of numbers (embeddings) | “Find the most similar items” | Exact matches and joins | pgvector, Pinecone, Qdrant, Milvus |
| **Analytic** (column store) | Columns | Aggregations over very many rows | Single-row updates | BigQuery, Snowflake, ClickHouse |

## How they get their speed

Two ideas explain most of the table.

**1. Design for the query.** In a relational database you model the data, and any query is then possible. In a key-value or wide-column store you start from the queries. If the application must show “the last 20 orders of a customer”, you store the orders under the customer key, sorted by time. That query is then one read. A query you did not plan, such as “all orders above 500”, needs a scan of everything.

**2. Spread the data by key.** These stores divide data across machines by a hash of the key. This is called **sharding** or partitioning. Each machine holds a part, so capacity grows when you add machines. The cost is that an operation across many keys, such as a join or a transaction, becomes slow or impossible.

## Consistency: what you give up for scale

A database on one machine can make each transaction **ACID**: all its changes succeed or none do, and each reader sees a consistent state.

A database spread over many machines must choose what to do when machines cannot reach each other. It can refuse some requests to stay consistent, or it can answer with data that is possibly old. This is the practical content of the **CAP theorem**. Many NoSQL stores choose to answer, and offer **eventual consistency**: all copies will agree after a short time, but a read immediately after a write can return the old value.

For a data engineer this matters during extraction. A read from an eventually consistent store can miss the most recent writes. Read with a delay, or use the change stream of the store.

## Postgres first

Modern PostgreSQL does much of this work at moderate size. It has a JSON column type with indexes, full-text search, a time-series extension (TimescaleDB) and a vector extension (pgvector). A second database is a second system to operate, to secure and to back up.

A reasonable rule: use the relational database until you can name the specific limit that you have reached. Then choose the store that removes that limit.

## As sources: how to extract from each

| Store | Usual extraction |
|---|---|
| Relational | SQL queries on a replica, or log-based [CDC](/lesson/cdc) |
| DynamoDB, MongoDB, Cassandra | The change stream (DynamoDB Streams, MongoDB change streams, Cassandra CDC), or a scheduled export to object storage |
| Redis | Usually not extracted. It holds a cache of data that exists in another place |
| Elasticsearch | Usually not extracted. It is a copy of data from another system. Go to that system |

Documents have no fixed schema, so two documents in one collection can have different fields. Land them as raw JSON first, and give them structure in a transformation where you can see and handle each variation.

::scenario
? A product page must show “customers also bought”. A nightly job computes the list of ten products for each product. The page has 5,000 requests each second.
+ Write the result to a key-value store, with the product as the key | The access is one read by key, at high volume and low latency. This is exactly what a key-value store does. The nightly job replaces the values.
~ Keep it in a table in PostgreSQL with an index on the product | It works at moderate traffic and is one system less. At 5,000 requests each second it adds load to the database that also takes orders.
- Let the page query the warehouse | A warehouse answers in seconds, has a limit on concurrent queries, and charges for each one.
? The application team wants to store user profiles. Each profile has different optional sections, and the team reads a whole profile at a time.
+ A JSON column in the existing PostgreSQL database | You get flexible fields and keep transactions, joins and one system. Move later if a real limit appears.
~ A document database | The data fits the model well. You add a second database to operate for a need that the first one already meets.
- One table for each optional section, fully normalized | Each read needs many joins, and each new section needs a schema change.
::end

## Remember

- Each family is very good at one access pattern and poor at the others.
- Key-value and wide-column stores are designed from the queries, not from the data.
- Distributed stores often give eventual consistency. A read can be behind a write.
- Use a relational database until you can name the limit you have reached.

::quiz
? Why is a query such as “all orders above 500” slow in a key-value store where orders are stored by customer?
+ The store can find data only by key, so it must scan every item
- Key-value stores do not hold numbers
- The data is compressed
! Speed comes from the key. A query that does not use the key cannot use that speed.
::end
