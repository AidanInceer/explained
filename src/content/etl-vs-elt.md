A pipeline does three things to data. It **extracts** it from a source, **transforms** it into a useful shape, and **loads** it into a target. The two common designs do these in a different order.

::fig etl-elt | Change between the two. The steps are the same. The location of the transform is different.

## ETL: transform, then load

In ETL the pipeline extracts the data, transforms it on its own servers, and loads only the finished result into the warehouse.

This was the standard design for decades, for an economic reason. Warehouses were expensive machines with fixed capacity. You did not use that capacity to clean raw data, and you did not fill costly disks with data that nobody would query.

## ELT: load, then transform

In ELT the pipeline extracts the data and loads it into the warehouse unchanged. The transformations then run inside the warehouse, as SQL.

Cloud warehouses made this practical. Storage became cheap, and compute could scale up for a heavy transformation and stop after it. The warehouse is usually the most capable engine a company has, so it is sensible to give it the work.

ELT has three practical advantages:

1. **The raw data is kept.** If a transformation has a defect, or the business rule changes, you correct the SQL and rebuild. With ETL you may have to extract again, and the source may no longer have the old data.
2. **Extraction becomes simple.** The extract-and-load step copies tables and does nothing else. Products such as Fivetran and Airbyte do only this, for hundreds of sources.
3. **Transformations are SQL in version control.** Tools such as dbt treat each transformation as a `SELECT` statement in a file, with tests and documentation. Analysts can read and change them. This is the origin of the analytics engineer role.

## When ETL is still correct

- **Sensitive data.** If personal data must be masked or removed *before* it is stored in the warehouse, that transform must occur first.
- **Very large or unstructured input.** Parsing images, or filtering a stream of events down to 1% of its volume, is done better before the load.
- **The target is not a warehouse.** Loading into an operational database or an API leaves no engine to transform with.

Many real pipelines are **EtLT**: a small transform before the load, for masking and type correction, and the business logic afterwards in SQL.

## The layers inside an ELT warehouse

ELT moves the structure into the warehouse. A common arrangement is:

| Layer | Contents | Rule |
|---|---|---|
| Raw | Exact copies of source tables | Never edited by hand |
| Staging | One model for each source table: renamed columns, correct types, no joins | The only layer that reads raw |
| Intermediate | Joins and business logic in reusable steps | Not shown to users |
| Marts | Fact and dimension tables for users | Documented and tested |

This is the same idea as bronze, silver and gold in the [medallion architecture](/lesson/architecture-patterns).

> **Pitfall.** ELT makes it easy to load everything and transform nothing with care. A warehouse of 4,000 raw tables with no owners is a data swamp, as a lake can be. Keeping raw data is useful only if the layers above it are maintained.

## Remember

- ETL transforms before the load, outside the warehouse. ELT loads raw data and transforms it inside.
- ELT is the usual default on cloud warehouses, because raw data is kept and transformations are SQL.
- Transform before the load when the data must not be stored in raw form.

::quiz
? A defect in a revenue calculation is found six months after release. Which design makes the correction easier, and why?
+ ELT, because the raw data is in the warehouse and the corrected SQL can be run again
- ETL, because the transform is on a separate server
- There is no difference
! With the raw tables kept, the correction is a change to the SQL and a rebuild. With ETL, the raw input may be gone.
? A regulation says that national identity numbers must never be stored in the analytics platform. Where must they be removed?
+ Before the load
- In a staging model in the warehouse
- In the dashboard
! Staging models run after the raw data is loaded, so the numbers would already be stored. This is the case for a transform before the load.
::end
