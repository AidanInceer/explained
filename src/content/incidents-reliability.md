Every pipeline fails at some time. A reliable data team is not one with no failures. It is one that has agreed what “working” means, that finds a failure before the users do, and that learns from each one. These practices come from site reliability engineering, and Google’s *Site Reliability Engineering* book is the standard reference. They apply to data with small changes.

## Say what “working” means: SLI, SLO, SLA

- A **service level indicator** (SLI) is a measurement. “The time at which `fct_orders` was last updated.”
- A **service level objective** (SLO) is a target for it. “`fct_orders` is updated by 07:00 on 99% of working days.”
- A **service level agreement** (SLA) is a promise to a customer with a consequence if it is not met. Inside a company the word is often used for an SLO that was agreed with the consumers.

For a dataset the useful indicators are:

| Indicator | Question | Example objective |
|---|---|---|
| **Freshness** | How old is the newest data? | Less than 2 hours old, at any time in working hours |
| **Timeliness** | Was it ready at the agreed time? | Ready by 07:00 on 99% of days |
| **Completeness** | Is all the expected data there? | Row count within 10% of the same weekday last week |
| **Correctness** | Do the values pass the tests? | Zero failed tests of severity “error” |
| **Availability** | Can it be queried? | 99.9% of queries succeed |

Agree the objectives **with the consumers**. The [requirements](/lesson/stakeholders-requirements) question “what occurs when it is late or wrong?” gives the answer. Not every table needs an objective. Start with the few that feed decisions or other systems.

## Error budgets

99% of working days means about two or three late days in a year are accepted. That is the **error budget**. It makes two things clear.

First, 100% is not the target. Each extra nine costs much more than the one before it. The business must say how much reliability it wants to pay for.

Second, it gives a rule for priorities. If the budget is used up, the team stops new work and improves reliability. If the budget is not used at all, the team can take more risk and move faster.

## Alerts that people can act on

An alert must be something that a person has to do something about, now. All other signals belong on a dashboard.

- Alert on **symptoms that the consumer feels** (“the table is late”), not on each internal cause (“task 14 was tried again”).
- Each alert has an **owner** and a link to a **runbook**: what it means, how to check, how to correct.
- Set **severities**. A late finance table at month end can wake someone. A late marketing table waits for the morning.
- Remove alerts that are ignored. A channel with 200 alerts a day is a channel that nobody reads. This is **alert fatigue**, and it is how real incidents are missed.

The lesson on [observability and lineage](/lesson/observability-lineage) covers what to measure.

## During an incident

A data incident has a special property: bad data spreads. A wrong table is read by other jobs, exported and put in reports. So the order of actions is different from the instinct to find the cause first.

1. **Acknowledge.** One person takes the incident, and says so in the team channel.
2. **Stop the spread.** Pause the jobs that read the bad table. Stop exports and [reverse ETL](/lesson/serving-reverse-etl). A late dashboard is better than a wrong one.
3. **Tell the consumers.** Early and in plain words: what is affected, since when, what they must not use, and when the next message will come. Put a notice on the affected dashboards.
4. **Find the size.** Use [lineage](/lesson/observability-lineage) to list each table and report downstream. Find the time range.
5. **Restore.** The fast path first: go back to the last good version of the code or of the table. Table snapshots and raw copies make this possible.
6. **Correct and backfill.** Repair the cause, run the [backfill](/lesson/backfills), and run the tests.
7. **Close.** Tell the consumers that the data is correct again, with the range that was rebuilt.

In a larger incident, name one **incident lead** who coordinates and communicates, so that the people who repair are not interrupted.

## After an incident: the blameless review

For each significant incident, write a short review, within a few days.

- **What happened**, with a timeline.
- **The effect**: who was affected, for how long.
- **How it was found**: by a test, by monitoring, or by a user. If a user found it, that is a finding of its own.
- **The causes**: usually more than one. Ask “why?” several times.
- **What went well.**
- **Actions**, each with an owner and a date.

The review is **blameless**. It assumes that each person acted reasonably with the information they had, and it asks what in the system made the error possible. “Ana deployed a bad change” has no action. “A change that removed 30% of rows passed CI because no test compares row counts” has one.

If people are punished for incidents, they hide them, and the team loses its best source of improvement.

## On-call

If an objective must hold outside working hours, someone must be reachable. A rota is sustainable when:

- It has **enough people**, so that each one is on call one week in several.
- Alerts are **rare and real**. A person who is woken twice a night will leave.
- There are **runbooks**, and the on-call person has the access to act.
- There is a **second person** to escalate to.
- The time is **paid or given back**.

Many data teams do not need a night rota. If the freshest objective is “ready by 07:00”, a check at 06:00 with an alert, and the first person who starts work, is often enough. Decide from the objectives, not from habit.

## Reliability in the design

Most reliability is decided before an incident:

- [Idempotent](/lesson/idempotency) jobs, so that to run again is always safe.
- Automatic retries with a delay, for failures that pass.
- Raw copies and table snapshots, so that you can go back.
- Tests that stop bad data, in place of alerts after it has spread.
- Fewer dependencies in the critical path.

> **Pitfall.** Silence. The team sees the problem at 08:00, works on it until 14:00, and tells nobody. The users found it at 09:00 and decided that the data team does not know. Communication is half of incident response.

## Remember

- Define objectives for freshness, completeness and correctness with the consumers. Not for every table.
- An error budget accepts that 100% is not the target, and it guides priorities.
- Alert only on what needs a person now. Each alert has an owner and a runbook.
- In an incident: stop the spread, tell the consumers, then restore and repair.
- Review without blame, and turn each finding into an action with an owner.

::quiz
? A table with wrong values is found at 09:00. What is the first technical action?
+ Pause the jobs and exports that read it
- Find the root cause
- Delete the table
! Bad data spreads to each consumer downstream. Contain it first. The cause can be found after.
::end
