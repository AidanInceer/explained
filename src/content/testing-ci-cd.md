---
title: CI/CD for pipelines
summary: "Every change runs through automated checks before it reaches production: lint, unit tests, a build against sample data, and a comparison with the current output."
track: ops
level: core
minutes: 9
at: [1, 1]
prereqs: [environments-iac, orchestration]
tech: [ci, quality]
refs:
  - accelerate: Ch. 4, continuous delivery
  - dbt: Best practices
  - fode: Ch. 2, “DataOps” undercurrent
---
**Continuous integration** (CI) runs automated checks on each change before it is merged. **Continuous delivery** (CD) releases the merged change to production by an automated pipeline. Together they turn “I think this is correct” into “this passed the same checks as every other change”.

The [SDLC lesson](/lesson/sdlc) gives the reasons. This lesson shows what the pipeline contains for data work.

::fig ci | A typical pipeline for a change to a SQL model. Select a step to make it fail.

## The steps, in order of cost

The order matters. Low-cost checks run first, so that most errors are found in seconds.

**1. Lint and compile.** A linter (SQLFluff for SQL, Ruff for Python) checks style and common errors. The project is compiled: each reference to a model or column must resolve. No data is read.

**2. Unit tests.** Small fixed inputs go through a transformation, and the output is compared with the expected rows. For Python this is `pytest`. dbt and SQLMesh have unit tests for SQL models: you give a few input rows as text and the rows you expect.

```yaml
unit_tests:
  - name: refund_is_subtracted
    model: fct_revenue_daily
    given:
      - input: ref('stg_payments')
        rows:
          - { day: 2025-06-03, amount: 100, kind: charge }
          - { day: 2025-06-03, amount: 30,  kind: refund }
    expect:
      rows:
        - { day: 2025-06-03, revenue: 70 }
```

Unit tests are the place for edge cases: nulls, duplicates, time zones, a refund with no charge.

**3. Build in an isolated schema.** The pipeline builds the changed models, and the models that depend on them, in a schema that exists only for this pull request. It reads production for everything that did not change. In dbt this is **slim CI**: `dbt build --select state:modified+ --defer`. Without this selection, each small change would build the whole warehouse.

**4. Data tests.** The tests for keys, nulls, accepted values and relationships run on the tables that were just built. See [data quality](/lesson/data-quality).

**5. Compare with production.** This step is specific to data and very useful. The new build is compared with the current production table: row counts, totals of important columns, and the number of rows that differ. Tools such as Datafold, Recce and the dbt `audit_helper` package produce this **data diff**. The reviewer then sees not only the changed code, but its effect: “0.4% of rows changed, all in the `discount` column”. A change that should affect one column and changes 30% of all rows is caught here.

**6. Review and merge.** A person reads the code and the diff.

**7. Deploy.** After the merge, the pipeline releases the code to production and runs it. If a [backfill](/lesson/backfills) is needed, it is a planned step.

## The test pyramid for data

| Level | Checks | Speed | How many |
|---|---|---|---|
| **Static checks** | Syntax, style, references | Seconds | Automatic, for everything |
| **Unit tests** | Logic of one transformation, with fixed input | Seconds | Many, for the logic that matters |
| **Data tests** | Properties of real tables | Minutes | Several on each important table |
| **Integration and diff** | The whole path. Comparison with production | Minutes to hours | A few |
| **Monitoring in production** | Freshness, volume, distribution on each run | Continuous | On every table that is used |

The top level is the one that software does not have in the same form. Because the data changes each day, the last test environment is production itself.

## Deployment methods

How do you release a change to a table that people are reading?

- **Build, test, then replace.** Build the new version next to the old one. Run the tests. Replace the old one in one atomic step only if they pass. Readers never see a table that is half built or that failed its tests. This is often called **blue-green** deployment, or write-audit-publish.
- **Views as the public interface.** Users read a view. The view points at a physical table. A release changes where the view points, and a return to the old version changes it back.
- **Table versions.** [Table formats](/lesson/table-formats) keep snapshots. A bad write can be undone by a return to the last snapshot.

For a change that breaks consumers, use expand, migrate, contract from [schema evolution](/lesson/schema-evolution).

## Tools

| Purpose | Examples |
|---|---|
| CI runner | GitHub Actions, GitLab CI, Azure DevOps, Jenkins |
| SQL lint | SQLFluff, sqlfmt |
| Python lint and tests | Ruff, Black, pytest |
| Transformation tests | dbt tests and unit tests, SQLMesh audits |
| Data diff | Datafold, Recce, dbt audit_helper |
| Infrastructure | `terraform plan` in the pull request, `apply` after the merge |

## What a good pipeline feels like

- It gives an answer in **less than about ten minutes**. If it is slow, people stop making small changes.
- It **cannot be passed by**. The main branch is protected, and nothing reaches production by another path.
- A failure **says what to do**. “`unique` test failed on `order_id`: 14 duplicates, example 1004” is useful. “Exit code 1” is not.
- It is **trusted**. A test that fails at random is removed or repaired at once. If people learn to run it again until it passes, all the checks lose their value.

> **Pitfall.** CI that builds everything. A full build of 900 models for a one-line change takes an hour and costs real money. Select the changed models and their dependents.

> **Pitfall.** Tests only on the happy path. The defects of data pipelines are in nulls, duplicates, late rows and empty inputs. Write the unit tests for those.

> **Pitfall.** No production deployment pipeline. The checks pass in CI, and then a person runs the release by hand from a laptop, with a different version of the tool.

::scenario
? A change to one model is ready. The code looks correct and all tests pass. The data diff shows that 28% of the rows of the final table changed. The author expected about 1%.
+ Stop and find out why before the merge | The tests check properties, and all of them can hold while the values are wrong. An unexpected diff is the best signal you have, and it costs nothing to look.
- Merge, because all tests are green | Tests cover what someone thought to check. A change of 28% that nobody can explain is probably a join that now multiplies or loses rows.
~ Merge, and watch the dashboards the next day | You may see the problem. So will the users, and the wrong data will be in each table that depends on this one.
::end

## Remember

- CI checks each change automatically. CD releases it automatically.
- Order the checks from low cost to high cost: lint, unit tests, build, data tests, diff.
- Build only what changed, in a schema of its own.
- The data diff shows the effect of a change, not only its code.
- Build and test before you replace what users read.

::quiz
? What does a data diff add that code review and data tests do not?
+ It shows how the output rows changed, so that an effect nobody intended is visible
- It makes the pipeline faster
- It checks the SQL style
! Review shows the code and tests check declared properties. The diff shows the real change in the data.
::end
