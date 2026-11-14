In a lake, and between systems, data is stored in files. The file format decides how large the data is, how fast it reads, and what happens when the schema changes.

## The four formats to know

| | CSV | JSON | Avro | Parquet |
|---|---|---|---|---|
| Layout | Rows, text | Rows, text | Rows, binary | Columns, binary |
| Schema | None | In every record, as key names | In the file header | In the file footer |
| Types | All text | Few: string, number, boolean | Many | Many, with nesting |
| A person can read it | Yes | Yes | No | No |
| Size | Large | Largest | Small | Smallest |
| Best use | Exports, small hand-made files | APIs, logs | Events in Kafka, row-by-row writes | Analytic tables |

## CSV and JSON: text formats

**CSV** is the common denominator. Everything can read it. But it has no types and no standard. Is `01/02/2026` January or February? Is an empty field an empty string or a null? What happens when a value contains a comma? Each reader must guess, and each guess is a possible defect.

**JSON** adds nesting and a few types, and repeats every key in every record. It is the usual format of APIs and application logs. Newline-delimited JSON, one object on each line, is the common form for data files.

Both are **row-based text**. To read one column you must parse all of every line.

## Avro: rows with a schema

Avro is a binary row format. The schema is stored once and each record holds only values, so records are small and fast to write. It is the usual choice for messages in a stream.

Its main strength is **schema evolution**. The writer's schema travels with the data. A reader with a newer schema can still read old records, provided the change follows rules such as "a new field must have a default".

## Parquet: columns with statistics

Parquet is the standard format for analytic data at rest. A Parquet file is laid out as follows:

- The file is divided into **row groups**, each of about a hundred thousand to a million rows.
- Inside a row group, each column is stored separately as a **column chunk**, encoded and compressed.
- A **footer** at the end holds the schema and, for every column chunk, statistics such as the minimum and maximum value.

The footer gives two optimisations that a text file cannot have:

1. **Column pruning.** The engine reads only the chunks of the columns in the query. See [Row and column storage](/lesson/row-vs-column).
2. **Predicate pushdown.** For `WHERE amount > 1000`, the engine reads the footer first. If the maximum `amount` in a row group is 800, it skips the group without reading it.

ORC is a similar columnar format. Parquet is more widely supported.

> **Pitfall.** A Parquet file cannot be appended to or edited. To change one row you rewrite the file. This is why lakes write new files for new data, and why [table formats](/lesson/table-formats) exist to track which files are current.

## How to choose

- Data arrives one record at a time and is read as complete records: **Avro**.
- Data is queried by analytic engines: **Parquet**.
- A person or an old system must read it: **CSV**, with the delimiter, quoting and encoding written down.
- A source gives you JSON: store the raw JSON, then convert to Parquet as the first transformation.

## Remember

- Text formats are easy to read and slow to query. Binary formats carry a schema and types.
- Avro is for rows in motion. Parquet is for columns at rest.
- Parquet's footer statistics let the engine skip data without reading it.

::quiz
? A query filters on <code>event_date = '2026-03-05'</code>. How can the engine skip a Parquet row group without reading its data?
- It cannot. It must read every row
+ The footer holds the minimum and maximum of each column chunk
- Parquet keeps an index of every value
! If the date is outside the minimum and maximum for that row group, no row in it can match. This is predicate pushdown.
? You receive 300 GB of JSON logs each day and analysts query them with SQL. What should the pipeline do?
- Keep them as JSON, because that is how they arrived
+ Keep the raw JSON and convert it to Parquet for querying
- Convert them to CSV
! Parquet is far smaller and lets the engine read only the columns and row groups a query needs. Keeping the raw files means you can rebuild if the conversion has a defect.
::end
