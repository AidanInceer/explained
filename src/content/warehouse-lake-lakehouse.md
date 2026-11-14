These three words describe where analytic data is kept. Each one came as an answer to the limits of the one before it.

::fig lakehouse | The difference is who controls the files, and whether there are transactions.

## Data warehouse

A warehouse is a database built for analytics. You load data into tables and query it with SQL. The product manages the storage format, the statistics and the query engine together.

**Strengths:** fast SQL, transactions, access control, little to operate. **Limits:** data must be structured into tables, the storage is in a format only that product reads, and cost can be high at very large volume.

Cloud warehouses such as Snowflake and BigQuery made one important change to the older design: they **separate storage from compute**. Data is held in cheap object storage, and query machines start only when a query runs. You pay for each separately, and many teams can query the same data without competing.

## Data lake

A lake is a set of files in object storage such as Amazon S3, Azure Data Lake Storage or Google Cloud Storage. Any format is allowed: Parquet, JSON, images, audio. Engines such as Spark or Trino read the files directly.

The approach is **schema-on-read**: store the data as it arrives, and apply structure when you query. A warehouse is schema-on-write: the data must fit the table when it is loaded.

**Strengths:** very cheap, holds any data, open formats, any engine. **Limits:** a folder of files is not a table. In a plain lake:

- There are no transactions. A job that fails halfway leaves half its files, and readers see them.
- Two writers can corrupt each other's work.
- Changing or deleting one row means rewriting files by hand.
- Nothing enforces a schema, so quality falls with time. A lake that nobody can trust is called a data swamp.

For years the answer was to run both: a lake for raw data and machine learning, and a warehouse loaded from it for analytics. This works, but it means two copies, two security models and pipelines between them.

## Lakehouse

A lakehouse keeps the files in open formats in object storage, as a lake does, and adds a metadata layer that makes a set of files behave as a table. The layer is a [table format](/lesson/table-formats): Apache Iceberg, Delta Lake or Apache Hudi.

With that layer, the lake gains what it lacked: ACID transactions, schema enforcement, row-level updates and deletes, and the ability to query an older version of a table. Any engine that understands the format can read and write the same tables.

## How to choose

| Situation | Reasonable choice |
|---|---|
| Small or medium data, mostly SQL analytics, small team | A cloud warehouse. Least to operate |
| Large volumes, machine learning, unstructured data, several engines | A lakehouse |
| You must avoid dependence on one vendor's storage format | A lakehouse on an open table format |

The two are converging. Warehouses now read and write Iceberg tables, and lakehouse engines have warehouse-grade SQL. The practical question is less "which product" and more "who owns the files".

> **For experienced readers.** The lakehouse paper argues that the two-tier lake-plus-warehouse design causes most reliability and staleness problems, because every extra copy is another pipeline that can fail. It is eight pages and worth reading in full.

## Remember

- Warehouse: managed tables, strong guarantees, proprietary storage.
- Lake: cheap open files, no guarantees.
- Lakehouse: open files plus a table format that supplies the guarantees.

::quiz
? What does a plain data lake lack that a warehouse has?
- Cheap storage
+ Transactions and an enforced schema
- The ability to store Parquet
! A lake is files in folders. Nothing prevents a half-written job or a file with the wrong columns from being read.
? What does “separation of storage and compute” permit?
+ Paying for query machines only while queries run, and scaling them independently of data size
- Storing data without any schema
- Running queries without any storage
! Data stays in object storage at low cost. Compute starts and stops as needed, and several compute clusters can read the same data.
::end
