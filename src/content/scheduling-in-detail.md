---
title: Scheduling in detail
summary: Logical dates, catch-up, sensors, dependencies between DAGs, pools and timeouts. These settings cause most of the confusion in an orchestrator.
track: ops
level: core
minutes: 9
at: [0, 1]
prereqs: [orchestration]
tech: [orchestrators, transformation]
refs:
  - fode: Ch. 2, “Orchestration” undercurrent
  - functional: Sections on reproducible, partitioned tasks
---
The lesson on [orchestration and DAGs](/lesson/orchestration) covered the idea: tasks, dependencies, retries. This lesson covers the settings that cause confusion in daily use. The terms are from Apache Airflow, because it is the most common orchestrator. Dagster and Prefect have the same ideas under other names.

::fig dag | The DAG from the orchestration lesson. Select a task to make it fail, and see which tasks do not run.

## The logical date is not the time of the run

A daily job that processes the data **of** 3 June runs **on** 4 June, after the day is complete. An orchestrator keeps these two times apart.

| Term | Meaning | Example |
|---|---|---|
| **Data interval** | The period of data that this run is responsible for | 3 June 00:00 to 4 June 00:00 |
| **Logical date** | The start of that interval | 3 June |
| **Run time** | When the task really ran | 4 June 00:05, or 9 June for a rerun |

The task must use the data interval to select its data, and never the clock.

```sql
where event_time >= '{{ data_interval_start }}'
  and event_time <  '{{ data_interval_end }}'
```

This one habit makes three things work: a retry gives the same result, a run that is five hours late processes the correct day, and a [backfill](/lesson/backfills) of last March processes last March. It is the practical form of [idempotency](/lesson/idempotency).

## Schedules

A schedule is a cron expression, or a preset.

| Expression | Meaning |
|---|---|
| `0 6 * * *` | Each day at 06:00 |
| `*/15 * * * *` | Each 15 minutes |
| `0 6 * * 1` | Each Monday at 06:00 |
| `0 2 1 * *` | The first day of each month at 02:00 |

Two things to decide on purpose:

- **Time zone.** Schedule in UTC where you can. A schedule in local time runs twice, or not at all, on the days when the clocks change.
- **Margin.** A job at 00:00 for the day that just ended will miss late events. Run later, or reprocess a window of days.

## Catch-up

If a DAG was paused for four days, should the orchestrator run the four missed intervals when it is turned on again?

- **Catch-up on:** yes, one run for each missed interval. Correct for jobs where each interval produces its own partition.
- **Catch-up off:** only the newest. Correct for jobs that always process “everything new”, or that replace a whole table.

The classic accident: a new DAG is deployed with a start date of two years ago and catch-up on. The orchestrator starts 730 runs at once. Set the start date and catch-up with care, and limit the number of active runs.

## Waiting for something: sensors

Not every task can start by the clock. Some must wait for a condition: a file arrives, a partition appears in another table, another DAG finishes.

A **sensor** is a task that checks a condition until it is true.

| Setting | Why it matters |
|---|---|
| **Interval** between checks | Each minute is usually enough. Each second loads the system |
| **Timeout** | Without one, a sensor for a file that never comes waits without end |
| **Mode** | A waiting sensor should release its worker between checks (“reschedule” or “deferrable”). If not, a hundred sensors occupy a hundred workers and nothing else runs |

When a sensor times out, that is information: the data did not arrive. It must alert someone.

## Dependencies between DAGs

Inside one DAG, dependencies are explicit. Between DAGs, they are the source of many problems.

| Method | How | Weakness |
|---|---|---|
| **By time** | DAG B is scheduled an hour after DAG A | A is late one day, and B runs on old data and succeeds |
| **Sensor** | B waits for a task of A to finish | Fragile when the schedules of A and B differ |
| **Trigger** | A starts B as its last step | A must know its consumers |
| **Data-aware** | B is scheduled “when the table that A writes is updated” | Needs an orchestrator with this feature: Airflow datasets and assets, Dagster assets |

Dependency by time is the one to avoid. It is the same error as cron, at a larger scale.

The data-aware form is the best: the dependency is on the **data**, not on the name of another team’s DAG. This is the idea behind **asset-based** orchestration. You declare the tables and what each one is built from, and the orchestrator works out what to run.

## Retries, timeouts and alerts

| Setting | Guidance |
|---|---|
| **Retries** | Two or three, with a delay that grows. Only for [idempotent](/lesson/idempotency) tasks |
| **Execution timeout** | Each task has one. A hung task then fails and alerts |
| **SLA or deadline** | “This DAG must finish by 07:00.” Alert when it has not, also if nothing failed |
| **On-failure alert** | To a channel that the owning team reads, with a link to the log and the runbook |

The deadline alert catches what a failure alert cannot: the job that is slow, or waiting, or was never started.

## Limits on concurrency

Unlimited parallel work breaks the systems that the tasks call.

- **Pools** limit how many tasks use a resource at once: “at most 4 tasks query the source database”.
- **Maximum active runs** for each DAG stops a backfill from starting 730 runs.
- **Maximum active tasks** protects the orchestrator itself.
- **Priority** lets the finance pipeline go first when workers are few.

## Reruns

To run a task again for a past interval, **clear** it. The orchestrator runs it again with the same logical date, and then every task after it. Because the tasks use the data interval and are idempotent, the result replaces the old one.

To backfill a range, run the DAG for each interval in the range, with a limit on parallel runs.

## Keep the DAG file light

The orchestrator reads each DAG file often, to see its structure. Code at the top level of the file runs each time.

- **Do not** query a database or call an API at the top level of a DAG file. Put that work inside tasks.
- **Do not** pass data between tasks through the orchestrator’s own store (XCom in Airflow). It is for small values, such as a row count or a file path. Data goes to storage, and the task passes its location.
- **Keep heavy processing out of the orchestrator.** A task should start work in the warehouse, in Spark or in a container, and wait. The orchestrator coordinates. It does not compute.

## Dynamic tasks

Sometimes the number of tasks is not known in advance: one task for each file that arrived, or for each customer. Orchestrators can create tasks at run time from a list (dynamic task mapping). Use it with a limit, because a list of 50,000 items makes 50,000 tasks.

## Event-driven runs

Not everything fits a clock. A run can start when something happens: a file lands in a bucket, a message arrives, an API is called. This removes waiting, and it works well for irregular arrivals. Keep a scheduled check as well, to find the day on which the event never came.

> **Pitfall.** `datetime.now()` or `current_date` in a task. The task gives a different result on each run, and a backfill cannot work.

> **Pitfall.** A DAG that succeeds because a step was skipped. An upstream check found no data and skipped the load. The DAG is green and the table is not updated. Decide for each case if “nothing to do” is success or a failure.

> **Pitfall.** One DAG with 600 tasks. Nobody can read it, and one change deploys everything. Divide by domain, and connect the parts through data.

## Remember

- A run is responsible for a data interval. Use it to select data, and never the clock.
- Decide catch-up, start date and time zone on purpose.
- Sensors need a timeout and must release their worker while they wait.
- Connect DAGs through data, not through schedules that hope the other is finished.
- Give each task a timeout, each DAG a deadline alert, and each shared resource a pool.
- The orchestrator coordinates. It does not process data.

::quiz
? DAG B starts at 03:00 because DAG A “always finishes by 02:30”. One night A finishes at 03:40. What occurs?
+ B runs on yesterday’s data and reports success
- B waits for A
- B fails with an error
! A dependency by time is only a hope. Use a sensor or a data-aware schedule, so that B starts when A’s output exists.
::end
