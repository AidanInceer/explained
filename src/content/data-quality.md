A pipeline can run without an error and still give wrong numbers. The code did what it was written to do. The data was not what the code expected. This is the difference between software testing and data testing, and a data engineer must do both.

## Two things can be wrong

| | Code is wrong | Data is wrong |
|---|---|---|
| Example | A join condition is incorrect | The source sent a null where a value is required |
| When it occurs | When someone changes the code | On any day, with no change to the code |
| Found by | Unit tests, code review, CI | Data tests that run with each pipeline run |
| Found when | Before release | During the run, on the real data |

A software team tests before release and then trusts the code. A data team must also test **each run**, because the input is different each day and you do not control it.

## The dimensions of data quality

"Quality" is not exact. These six dimensions make it possible to test:

| Dimension | Question | Example of a test |
|---|---|---|
| Completeness | Is anything missing? | `customer_id` is never null |
| Uniqueness | Is anything duplicated? | `order_id` is unique |
| Validity | Do values obey the rules? | `status` is one of `placed`, `shipped`, `returned` |
| Consistency | Do related data agree? | Each `customer_id` in orders exists in customers |
| Accuracy | Does it agree with the real world? | Total revenue is equal to the finance system's total |
| Timeliness | Is it recent enough? | The newest row is less than 2 hours old |

::fig quality | Turn tests on and off. Each test finds one kind of problem and no others.

## The basic tests

Four generic tests find a large part of real defects. dbt includes them, and other tools have equivalents.

- **`not_null`** on each column that must have a value.
- **`unique`** on each primary key.
- **`accepted_values`** on each column with a fixed set of values.
- **`relationships`** on each foreign key. This is referential integrity.

Put `unique` and `not_null` on the primary key of **every** table. A duplicated key is the most common cause of numbers that are too large, because a join to that table then multiplies rows.

After those, add tests that are specific to the business: order amounts are not negative, the end date is not before the start date, the row count is within 30% of the count on the same day last week.

## Where to put the tests

Test at the boundaries, and stop bad data as early as possible.

1. **On arrival, on the source data.** Did the file arrive? Does it have the expected columns? Is the row count reasonable? A failure here stops the pipeline before any bad data moves downstream.
2. **After each transformation.** Keys are unique, the grain is correct, row counts agree with the input.
3. **Before publishing.** Reconcile totals with a trusted system.

A useful pattern is **write, audit, publish**. Write the new data to a staging location that users cannot see. Run the tests on it. Only if they pass, exchange it into the production table. Users see either the old correct data or the new tested data, and never bad data.

## What a failed test does

Each test needs a decision about what occurs when it fails:

- **Stop.** The pipeline stops and nothing is published. Use this for defects that make results wrong, such as duplicated keys.
- **Warn.** The pipeline continues and someone is informed. Use this for defects that are not critical.
- **Quarantine.** Move the bad rows to a separate table and continue with the good rows. Use this when a small number of bad records must not stop all the others. Monitor the size of the quarantine table.

A test that fails each day and that nobody acts on is worse than no test. People learn to ignore the alerts. Each failure must be corrected, or the test must be changed or removed.

## Testing the code

Data tests do not replace software practice:

- **Unit tests** for transformation logic: a small fixed input and the expected output. These find logic defects before release.
- **Version control and code review** for all pipeline code and SQL.
- **CI** that builds the changed models in a separate environment and runs the tests before a merge.
- **A development environment** that is separate from production, so that an experiment cannot damage a table that users depend on.

> **From the community.** A common piece of advice on r/dataengineering: when a wrong number reaches a user, the correction is not complete until there is a test that would have found it. The set of tests then grows from real failures and not from guesses.

## Remember

- Code tests run before release. Data tests run with each pipeline run, on that day's data.
- Start with `unique` and `not_null` on each primary key.
- Test before you publish, and decide for each test if a failure stops, warns or quarantines.

::quiz
? A pipeline has run correctly for a year. One day the revenue is twice the true value. The code has not changed. Which kind of test finds this?
- A unit test of the transformation code
+ A data test, such as <code>unique</code> on the key of a joined table
- A code review
! The code is the same, so the data changed. A duplicated key in a dimension makes a join return two rows for each fact. Only a test on the data of that run finds it.
? In the write, audit, publish pattern, what do users see if the audit fails?
+ The previous version of the table
- The new data with a warning
- An empty table
! The new data is not exchanged into production. Late and correct is better than on time and wrong.
? A test has failed each morning for a month and nobody has acted. What is the correct action?
- Leave it. It does no harm
+ Correct the cause, or change or remove the test
- Add more tests
! Alerts that are ignored teach people to ignore all alerts. Each test must be one that someone will act on.
::end
