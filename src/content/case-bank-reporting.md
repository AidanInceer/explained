This design is the opposite of the streaming cases. Nobody needs the result fast. The report is produced once a quarter. But each number in it must be exact, each number must be explainable, and the bank must be able to produce the same report again two years later. The requirement is not speed. It is **proof**. The bank and its details are invented for the example, and this is an engineering illustration, not a description of a specific regulation.

Compare it with the [online shop](/lesson/case-online-shop). Both are batch. The shop design is as simple as possible. This one adds controls at every step, because the cost of an error is of a different kind.

## The situation

A bank must report its credit exposure to each counterparty to its regulator, each quarter. The report is signed by a senior officer. An error can mean a fine and a restated report. Auditors, internal and external, review the process each year.

::fig wb-bank | The design in ten steps. Use “Next step”, or “Expand” for a larger view.

## Step 1: users and requirements

| User | Need | What “correct” means |
|---|---|---|
| The regulator | The report, in a fixed layout, by a fixed date | Complete, and consistent with the bank’s published accounts |
| Risk officers | To review, question and sign the numbers | Every large change from last quarter has an explanation |
| Auditors | Evidence, at any later time | Each number can be followed to its inputs, and the run can be repeated |

The non-functional requirements are the design:

- **Reproducible.** The same inputs and the same code version give the same output, bit for bit.
- **Traceable.** For any number: which inputs, which rules, which run, which person.
- **Immutable after sign-off.** A corrected report is a new version. The first one remains.
- **Controlled.** No single person can change the logic or the data alone.

## Step 2: the model

The report tables have one row for each counterparty for each reporting date. Behind them, the model keeps time in two ways. This is the central idea of the design.

| Time | Question | Example |
|---|---|---|
| **Valid time** | When was this true in the world? | The loan had a limit of 5 million from 1 January to 14 March |
| **Transaction time** | When did the bank’s systems know it? | The change of limit was recorded on 20 March, backdated to 14 March |

A table that keeps the two is **bitemporal**. It can answer: “What was the exposure on 31 March, **as we knew it on 10 April** when the report was signed?” and also “…as we know it today, after the corrections of May?”

Without transaction time, a late correction changes history, and the report of March can no longer be produced again. A [Type 2 dimension](/lesson/scd) keeps valid time. A bitemporal table adds the second axis.

## Step 3: the sources

| Source | Delivery | Owner |
|---|---|---|
| Core banking system | Nightly extract file, with a control file | Core banking operations |
| Loans system | Nightly extract file, with a control file | Lending IT |
| Market data | Daily price file from a vendor | Market data team |
| Counterparty reference data | Daily file. Who is who, and which companies belong to one group | Reference data team |

Each source has a **named owner** who confirms each delivery. In a regulated process, “the file arrived” is a signed statement, not a log line.

Why files, and not [CDC](/lesson/cdc) or an API? A file is a fixed, complete object for one business date. It can be stored, checksummed and shown to an auditor. That is worth more here than low latency.

## Step 4: ingestion with controls

1. **Land the file unchanged**, with the time of receipt and a checksum. The landing area is write-once: [object storage](/lesson/object-storage) with object lock, so that even an administrator cannot change a file.
2. **Compare with the control file.** The source states: 1,204,881 rows, total balance 48,112,530,917.44. The load computes the same two numbers from what it read. If either differs, the load **stops**.
3. **Check the business date.** A file for the wrong day is refused.
4. **Record the delivery**: file, checksum, counts, who confirmed.

This is a [quality gate](/lesson/designing-for-failure) in its strictest form. An incomplete file must never flow into a signed report. In this design, stopping is the correct behaviour, and a late report is better than a wrong one.

## Step 5: storage and history

The conformed layer keeps every version of every record with both times. Nothing is updated in place. A correction is a new row.

A “snapshot as of sign-off” is then a query with two filters, not a copy:

```sql
select *
from exposure_history
where valid_from <= date '2025-03-31' and date '2025-03-31' < valid_to      -- true on the reporting date
  and known_from <= timestamp '2025-04-10 17:00' and timestamp '2025-04-10 17:00' < known_to   -- as known at sign-off
```

The engine can be a warehouse or a lakehouse. The choice matters less than these properties: full history, [time travel](/lesson/table-formats) with a long retention, and access control at the level of columns and rows.

## Step 6: transformation

- **Rules as code**, in version control. Each rule of the regulation is a function or a model with a reference to the paragraph it implements.
- **Each run records** the version of the code (the Git commit), the versions of the inputs, the parameters and the user. This record is the **run log**.
- **Rules have effective dates.** When the regulation changes from 1 July, the new rule applies to reporting dates from 1 July. The report for March, produced again, uses the old rule.
- **No current time in the logic.** The reporting date and the “as known” time are parameters. This is [idempotency](/lesson/idempotency) with legal weight.
- **Exact arithmetic.** Money uses decimal types, never floating point. Rounding rules are written down and tested.

## Step 7: operations and controls

**Reconciliation.** The total exposure must agree with the general ledger of the bank within a stated tolerance. Each difference is listed, and a named person explains it. This is the same idea as the payment test in the shop design, with a formal sign-off.

**Variance analysis.** Each number is compared with the last quarter. Changes above a limit need a written explanation. This finds errors that pass every technical test.

**Four eyes.** One person prepares and a second reviews, for code changes and for the report itself. The roles are separate in the access system: the person who writes a rule cannot approve it.

**Change control.** Every change to the logic goes through a [pull request](/lesson/testing-ci-cd), with tests, a review, and a record of who approved. A regression test produces a past report again and compares it with the stored one. If one number moves, the change is not released.

**Freeze.** After sign-off, the report tables for that date are locked.

**Lineage.** For each number in the report, the [lineage](/lesson/observability-lineage) leads back through the calculation and the history to the files. The auditor’s question “where does this 4.2 million come from?” has an answer in minutes.

**Access.** Least privilege, a record of every read of sensitive data, and regular review of who has access. See [secrets and access](/lesson/secrets-access).

**Retention.** Inputs, outputs, code versions and run logs are kept for the period that the law requires, often seven years or more. The cost of that storage is part of the requirement.

## The failure questions

| Question | Answer |
|---|---|
| A file arrives with fewer rows than its control total | The load stops. The source owner is told. Nothing after it runs |
| A source sends a correction for a past date | It is a new version, with its own “known from” time. Signed reports do not change. The next report includes it |
| The regulator asks for the March report again | Run with the reporting date of March and the “as known” time of the sign-off. The result is equal to the stored one |
| An error is found in a signed report | A new version is produced, reviewed and submitted, with the reason. The first version is kept |
| A rule changes in the regulation | A new rule with an effective date. Old reports can still be produced with the old rule |
| A developer changes a calculation by mistake | The regression test against the stored past reports fails in CI |
| An auditor asks who could have changed a number | The access records, the change records and the write-once landing area show that nobody could, alone |

## Alternatives, and why they were not chosen

| Alternative | Why not here |
|---|---|
| Streaming or CDC from the source systems | It gives freshness that nobody asked for, and it removes the fixed, checkable daily file |
| Keep only the current state, and copy the tables at each quarter end | Copies are evidence of the result. They cannot produce the result again with a corrected rule |
| A spreadsheet process | It is how many such reports began. It has no lineage, no access control and no repeatability |
| Skip the control files, and trust the loads | An incomplete load is the most common real cause of a wrong report, and it gives no technical error |

## What to take from this design

- Requirements can be about proof, not speed. Then the design is built around controls.
- Two kinds of time. Without “when did we know”, a late correction changes the past.
- Files with control totals are a strength here.
- Every run records its code version and input versions, and never uses the clock.
- Reconciliation and variance analysis find the errors that tests cannot.
- Stopping is a valid result. A late report is better than a wrong one.

::scenario
? In May, the loans system sends a correction: a loan limit was changed on 14 March, but it was recorded in May. The report for 31 March was signed on 10 April.
+ Store the correction as a new version, valid from 14 March and known from May. The signed March report stays as it is, and the June report uses the corrected history | Both truths are kept: what was true, and what the bank knew. If the difference is material, a restatement is a separate, reviewed decision.
- Update the March data in place, so that it is correct | The signed report can no longer be produced again, and nobody can show what the bank knew when it signed.
~ Ignore the correction for March and apply it from May | The signed report is safe. The history is now wrong for the period from 14 March to May, and each later analysis of that period has the wrong limit.
::end
