A schema is the list of columns of a dataset, with their names and types. It does not stay the same. The application team adds a field, splits a column, or changes a number into a string. **Schema evolution** is the set of rules that lets a schema change while old data and old readers continue to work.

It is one of the most frequent causes of pipeline failure, because the change is made by a different team from the one that it breaks.

## Two directions of compatibility

Old and new versions exist at the same time: old files are in storage, and old code still runs.

- **Backward compatible**: new code can read old data. You need this to read your history.
- **Forward compatible**: old code can read new data. You need this because consumers are not updated at the same moment as producers.

A change that is compatible in the two directions is safe. Kleppmann covers this in chapter 4 of *Designing Data-Intensive Applications*.

## Which changes are safe

| Change | Effect | Safe? |
|---|---|---|
| Add a column that can be null, or has a default | Old readers ignore it. New readers get null or the default for old data | Yes |
| Remove a column that nobody reads | Readers that used it fail | Only after you confirm there are no readers |
| Rename a column | For a reader it is a removal and an addition | No |
| Widen a type: `INT` to `BIGINT` | Each old value fits in the new type | Usually yes |
| Narrow or change a type: `STRING` to `INT`, `BIGINT` to `INT` | Old values may not fit | No |
| Change the meaning: `amount` from euros to cents | The schema is the same and every number is wrong | No, and nothing will detect it |
| Add a new value to a status column | Logic with a fixed list of values puts it in “other” or drops it | Risk. Test for accepted values |

The last two rows are **semantic** changes. They are the most dangerous, because no technical check fails.

## How formats handle it

[File formats](/lesson/file-formats) differ a lot here.

- **CSV** has no schema. Columns are found by position. One new column in the middle moves every later column into the wrong field.
- **JSON** carries field names in each record, so added fields are harmless. But no rule says which fields exist or what type they have.
- **Avro** stores the writer’s schema with the data. A reader gives its own schema, and Avro resolves the two by field name, with defaults for missing fields. It is built for evolution, which is why it is common in Kafka.
- **Parquet** stores the schema in each file. Different files of one table can have different schemas, and the engine or the table format must merge them.
- **[Table formats](/lesson/table-formats)** (Iceberg, Delta) follow columns by an internal **ID**, not by name or position. So a rename is a metadata change and old files are still read correctly. This is a main reason to use them.

For streams, a **schema registry** holds the versions of each topic’s schema and rejects a producer whose new schema breaks the compatibility rule.

## Expand, migrate, contract

To make a breaking change with no failure, do it in three steps. For a rename of `cust_id` to `customer_id`:

1. **Expand.** Add `customer_id` and fill it. The two columns now exist with the same values.
2. **Migrate.** Tell the consumers. Each one changes to the new column in its own time. Watch the query logs to see who still reads the old one.
3. **Contract.** When no reader uses `cust_id`, remove it.

For a table that many people use, the same idea becomes **versions**: publish `orders_v2` next to `orders_v1`, announce a date, and remove the first version after it.

## Schema drift at ingestion

When a source changes without notice, the pipeline has three possible reactions. Choose one on purpose for each source.

| Policy | Behaviour | Fits |
|---|---|---|
| **Fail** | Stop the load when the schema differs from the expected one | Financial and regulated data, where a silent error is worse than a delay |
| **Evolve** | Add new columns automatically. Alert a person | Most analytic sources. New data is kept, nothing breaks |
| **Ignore** | Load only the known columns | Rarely correct. Data is lost and nobody knows |

A common safe design: land the raw record in full, for example as a JSON or variant column, so that nothing is lost. Then select named columns in the staging model. A new field does not break anything, and it is available when someone needs it.

## Data contracts

The better solution is to prevent the surprise. A **data contract** is an agreement between the producer and the consumers of a dataset, written as code and checked automatically. It states the schema, the meaning of each field, the quality rules and the notice period for changes.

```yaml
dataset: orders
owner: checkout-team
fields:
  - { name: order_id,  type: string,    required: true, unique: true }
  - { name: amount,    type: decimal,   unit: EUR, description: Total, tax included }
  - { name: status,    type: string,    allowed: [created, paid, shipped, cancelled] }
freshness: 15 minutes
breaking_changes: 30 days notice, new version
```

The check runs in the producer’s CI pipeline. A change that breaks the contract fails the producer’s build, before it reaches any consumer. The lesson on [observability and contracts](/lesson/observability-lineage) covers how teams operate this.

> **Pitfall.** `SELECT *` from a source table into a pipeline. A new column changes the shape of every table after it, and a `UNION` or an `INSERT` by position puts values in the wrong columns.

::scenario
? The application team will change `orders.amount` from a decimal in euros to an integer in cents next week. Twelve models read it.
+ Ask them to add a new column `amount_cents` and keep `amount` until the models have moved | This is expand, migrate, contract. Nothing breaks, each model changes when ready, and the name states the unit.
~ Change all twelve models on the day of the release | It can work if the timing is exact. A run between the two changes multiplies or divides revenue by 100.
- Do nothing, because the column name and table are the same | The type may still load, and each amount is then wrong by a factor of 100 with no error.
::end

## Remember

- Additions of optional columns are safe. Renames, removals and type changes are not.
- Changes of meaning with no change of schema are the most dangerous.
- Use expand, migrate, contract for a breaking change.
- Choose a policy for drift for each source: fail, evolve or ignore.
- A data contract moves the failure to the producer’s build.

::quiz
? Why can Iceberg and Delta tables rename a column without rewriting files?
+ They identify each column by an internal ID, so the name is only metadata
- They store data as CSV
- They copy the table at each change
! Old files hold data under the column ID. The table metadata maps the ID to its current name.
::end
