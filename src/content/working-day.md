---
title: The day-to-day work
summary: Most of the job is not new pipelines. It is requests, failed runs, backfills, reviews, small changes and the messages that explain them.
track: foundations
level: core
minutes: 9
at: [0, 3]
prereqs: [stakeholders-requirements]
tech: [orchestrators, vcs, monitor]
refs:
  - fode: Ch. 1, “Whom data engineers work with”
  - reddit: "Recurring threads: “What does your day look like?”"
  - sre: Ch. 5, Eliminating Toil
---
Courses teach how to build a new pipeline. In a job, that is perhaps a quarter of the time. The rest is the work of keeping existing pipelines correct and useful. This lesson describes that work, because it is what you will be judged on.

## Where the time goes

A rough division for an engineer in a working team. Your team will differ.

| Work | Share | Examples |
|---|---|---|
| **Operate and repair** | 20 to 30% | A run failed in the night. A source sent a new column. A table is late |
| **Small changes** | 20 to 30% | Add a column. Change a filter. A new source table |
| **Project work** | 25 to 40% | A new pipeline or model. A migration |
| **Review, planning, meetings** | 15 to 20% | Code review. Requirements talks. Stand-up |
| **Improvement** | 5 to 10% | Remove an alert that is noise. Speed up CI. Write the missing runbook |

The last row is the one that gets dropped when the team is busy. It is also the one that reduces the first row. The Google SRE book calls repetitive manual operations work **toil** and advises a limit on it, so that there is always time to remove its causes.

## A typical morning

1. **Look at what ran.** Open the orchestrator and the alerts channel. Which runs failed? Which data is late?
2. **Triage.** For each failure: who is affected, and by when do they need it? A failed marketing table at 07:00 and a failed finance table on closing day are not the same problem.
3. **Repair or rerun.** Many failures pass on a retry: a timeout, a rate limit. Others need a correction. See [how to debug a pipeline](/lesson/debugging-pipelines).
4. **Tell people.** If consumers are affected, write to them before they write to you.
5. **Then start the planned work.**

## The recurring tasks

**Backfills.** Logic changed, or a defect was corrected, and history must be built again. This is routine if the jobs are [idempotent](/lesson/idempotency) and take a date as a parameter. See [backfills and late data](/lesson/backfills).

**Schema changes from sources.** A producer adds, renames or removes a column. You change the staging model and tell the consumers. See [schema evolution](/lesson/schema-evolution).

**Access requests.** Someone needs to read a table. With [access as code](/lesson/environments-iac), this is a small pull request.

**“Why is this number different?”** The most frequent question from the business. Usually the cause is a definition, a filter or a time zone, not a defect. To answer it fast you need [lineage](/lesson/observability-lineage) and written metric definitions.

**Data requests.** “Can you get me the list of…” Answer the first one by hand. If it comes a second time, build a table or a dashboard so that the person can answer it without you.

**Cost reviews.** Each month, look at the most expensive queries and jobs. See [cost and performance](/lesson/cost-performance).

**Upgrades.** Tools, libraries and connectors need new versions. Small and often is safer than large and rare.

**On-call.** In some teams, one person each week is the first to respond to alerts. See [SLAs, incidents and on-call](/lesson/incidents-reliability).

## Tickets, estimates and status

Work arrives as tickets. A good ticket has the requirement, not only the request: who needs it, for what decision, by when, and how to know it is done. If a ticket does not have these, ask before you start. See [stakeholders and requirements](/lesson/stakeholders-requirements).

**Estimates** in data work are uncertain, because you do not know what is in the data until you look. Give a range, say what the uncertainty is, and offer a first step that removes it: “Two to six days. I will know more after one day with the source data.”

**Status** is something you give before you are asked. A short message when you start, when you are blocked, and when you finish is enough. Bad news early is always better than bad news late.

## Written communication

A data engineer writes more prose than most people expect: pull request descriptions, incident messages, design notes, answers in chat. Three habits make it effective:

- **Lead with the result.** “The revenue table is correct again for 1 to 14 June” first. The cause comes after.
- **Write for a reader with no context.** Name the table, the date range and the effect. Do not write “it is fixed”.
- **Separate what you know from what you think.** “The row count fell by 30%. I think the cause is the new filter. I am confirming it now.”

A message to stakeholders during a problem has four parts: what is affected, since when, what they must do or not do, and when the next message will come.

## Review, as author and as reviewer

As the **author**: keep the change small, describe what it does and why, show the effect on the data ([a data diff](/lesson/testing-ci-cd)), and say how you tested it.

As the **reviewer**: read for correctness first, then clarity. Ask questions. “What occurs if this runs twice?” teaches more than “this is wrong”. Approve when it is good enough and better than before, not when it is as you would have written it.

## Saying no, and saying later

There are always more requests than time. Each pipeline you build must be operated for years. A good engineer does not accept everything and does not refuse without a reason. Useful forms:

- “Yes, and it moves X to next week. Is that the correct priority?”
- “Not as asked, but this smaller thing answers the same question and takes a day.”
- “Not now. Here is what would change that.”

Priorities between stakeholders are a decision for the person who leads the team. Bring the conflict to them with the facts. Do not decide it in silence.

## What a good colleague looks like

Technical skill gets you the job. These habits decide how you are seen in it:

- You **finish**. A pipeline with no tests, no documentation and no owner is not finished.
- You **leave things better**: a clearer name, a removed dead table, a runbook line.
- You **ask early** when blocked, with what you tried.
- You **admit errors fast**. “My change caused this, and here is the correction” builds trust. Hiding it destroys trust.
- You **know the business**. You can say what the company sells and which numbers its leaders look at.
- You **make others faster**: reviews on the same day, answers in public channels where the next person can find them.

> **Pitfall.** The quiet repair. You find wrong data, correct it, and tell nobody. The consumers used the wrong numbers yesterday and do not know. Always say what was wrong and for which period.

## Remember

- Most of the work is operation, small changes and communication. Plan for it.
- In the morning: look, triage by effect on users, repair, tell, then build.
- Give estimates as a range with the reason for the uncertainty.
- Lead with the result when you write. Give bad news early.
- Keep some time each week to remove a cause of repeated work.

::quiz
? A run failed at 03:00 and you see it at 08:30. The table feeds a dashboard that the sales team opens at 09:00. What is the first action after you start the rerun?
+ Tell the sales team that the dashboard shows yesterday’s data and when it will be current
- Write the review of the incident
- Find the root cause
! The users are about to read old data. A short message now prevents wrong decisions and shows that the team is in control.
::end
