A real pipeline is many steps. Extract orders. Extract customers. Clean each one. Join them. Test the result. Update the dashboard. Some steps depend on others, and some can run at the same time. An **orchestrator** is the system that runs them in the correct order, at the correct time, and handles failures.

## Why a scheduler is not sufficient

The first attempt is usually cron, the standard scheduler on Unix systems: extract at 01:00, transform at 02:00, publish at 03:00.

This works until the extract takes 70 minutes one night. The transform starts at 02:00 on incomplete data and reports success, and the dashboard is wrong. The times were a guess about how long each step takes. The real requirement was a **dependency**: run the transform *after the extract has succeeded*.

## The DAG

An orchestrator represents the pipeline as a graph. Each **task** is a node. An arrow from A to B means that B depends on A. The graph must be:

- **Directed.** Each dependency has a direction.
- **Acyclic.** There are no loops. If A needs B and B needs A, neither can start.

This is a **directed acyclic graph**, or DAG. From it, the orchestrator can calculate everything it needs: what can run now, what can run in parallel, and what must be stopped when something fails.

::fig dag | A daily sales pipeline. Select a task to make it fail and see which tasks the orchestrator does not run.

## What an orchestrator does

- **Starts runs** on a schedule, or on an event such as "a file arrived" or "the upstream table was updated".
- **Runs tasks in dependency order**, and runs independent tasks in parallel.
- **Retries.** Many failures are temporary: a network timeout, a busy API. A task is retried a set number of times, with a delay that increases, before it is marked as failed.
- **Stops downstream tasks** when a task fails, so that incorrect or partial data does not move forward.
- **Sends alerts** when a task fails or a run is late.
- **Keeps a record** of each run: status, duration, logs. This record is the first place to look in an incident.
- **Does backfills.** It can run the pipeline for a range of past dates.

Retries and backfills run tasks more than once. This is safe only if the tasks are [idempotent](/lesson/idempotency). Orchestration and idempotency are two parts of one design.

## The run date

Each scheduled run is for a specific period of data. The run that processes the data of 5 March has that date as a parameter, whenever it executes. Airflow names this the *logical date* or data interval. Dagster names it a partition.

Tasks must use this parameter and not the system clock. Then the run for 5 March always processes 5 March, on the first attempt, on a retry and in a backfill a year later.

## Two models

| | Task-centred | Asset-centred |
|---|---|---|
| You declare | Tasks and their order | Tables or files, and what each is built from |
| The orchestrator knows | That a task succeeded | That a table is up to date |
| Examples | Apache Airflow, Prefect | Dagster, dbt (for SQL models) |

Airflow is the most widely used. A DAG is defined in Python, and operators do the work. The asset-centred model is newer. It is closer to how data engineers think, because the purpose is the tables and not the tasks.

dbt is a special case. It builds a DAG of SQL models automatically from the references between them. It does not schedule, so it is usually run as one or more tasks inside an orchestrator.

## Practices that prevent incidents

- **The orchestrator starts work. It does not do the work.** A task should start a query in the warehouse or a job on a cluster, and wait. If you process data inside the orchestrator's own workers, a heavy job can stop the scheduling of all the others.
- **Make each task atomic.** A task succeeds completely or leaves nothing. A task that writes half a table and fails is the worst case.
- **Make tasks small enough to retry.** If one task extracts 40 tables and the last one fails, the retry does all 40 again.
- **Set timeouts.** A task that never ends blocks the tasks after it without causing an alert.
- **Put data tests in the DAG**, between the build step and the publish step. See [Data quality and testing](/lesson/data-quality).

> **Pitfall.** Retries hide problems. A task that succeeds on the third attempt each night will fail completely at some time. Monitor the number of retries, not only the final status.

## Remember

- An orchestrator runs tasks by dependency, not by clock time.
- The dependency graph is a DAG: directed, with no loops.
- Retries and backfills need idempotent tasks that take the run date as a parameter.

::quiz
? Why can a dependency graph not contain a loop?
- Loops use too much memory
+ Each task in the loop waits for another task in the loop, so none can start
- Orchestrators cannot draw loops
! A task runs after its dependencies succeed. In a loop there is no task whose dependencies are all complete.
? The <code>clean_orders</code> task fails. What should occur to <code>build_sales</code>, which depends on it?
- It runs with the data that is available
+ It does not run
- It runs twice
! To run downstream tasks on missing or partial input gives data that is wrong and looks correct. A late dashboard is better than a wrong one.
? Why should an orchestrator task start a warehouse query and not process the rows in its own worker?
+ Heavy work in the orchestrator's workers can stop the scheduling of other pipelines
- The warehouse cannot be reached from a worker
- Orchestrators cannot run Python
! The orchestrator is a coordinator. Give the computation to the systems that are built for it.
::end
