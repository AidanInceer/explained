In a system with many parts, something is always failing. A machine restarts, an API is slow, a file is malformed, a network link drops for two seconds. Reis and Housley list “plan for failure” as a principle of good data architecture. The aim is not a system that never fails. It is a system where a failure of one part is a small event, not an incident.

## Four numbers to agree first

| Term | Question | Example |
|---|---|---|
| **Availability** | What share of the time must it work? | 99.9% is about 9 hours of outage in a year |
| **Reliability** | How often does it do what it should, when it runs? | 999 of 1,000 runs succeed |
| **RTO**, recovery time objective | After a disaster, how long until it works again? | 4 hours |
| **RPO**, recovery point objective | How much recent data may be lost? | 15 minutes |

RTO and RPO decide the cost. An RPO of zero needs synchronous copies in a second location. An RPO of 24 hours needs a nightly backup. Ask the business, and show the price of each level. See [SLAs and incidents](/lesson/incidents-reliability).

## Kinds of failure

| Kind | Example | Correct reaction |
|---|---|---|
| **Transient** | Timeout, rate limit, a restart | Wait and try again |
| **Permanent** | Wrong credentials, a file with a bad format, a defect in the code | Stop. A retry gives the same error |
| **Partial** | 9,990 of 10,000 records are good | Continue with the good ones. Set the bad ones aside |
| **Silent** | The job succeeds and the data is wrong or empty | Only a [data test](/lesson/data-quality) finds it |
| **Slow** | A dependency answers, but in 40 seconds | A timeout, or it blocks everything behind it |

A design must say which reaction each step has for each kind.

## The patterns

### Timeouts

Every call to another system has a time limit. A call with no timeout can wait without end, and then the pipeline neither fails nor finishes. A hung job is worse than a failed one: no alert is sent.

### Retries, with backoff and a limit

Retry transient failures. Wait longer after each attempt (1, 2, 4, 8 seconds), and add a random part so that many clients do not retry at the same instant. Limit the attempts.

A retry is safe only if the operation is [idempotent](/lesson/idempotency). To retry a step that is not idempotent creates duplicates. This is why idempotency comes before everything else in this lesson.

### Dead-letter queues and reject tables

One bad record must not stop a million good ones, and it must not be lost. After a few attempts, move it to a **dead-letter queue** (in a stream) or a **reject table** (in a batch), with the error and the time.

Two rules make this pattern safe. Someone **monitors** the queue, with an alert on its size. And there is a way to **process the records again** after the cause is corrected. A dead-letter queue that nobody reads is a place where data is lost without notice.

Set a limit on the share of rejects. If 40% of a file is rejected, the problem is the file. Stop the load.

### Circuit breakers

If a dependency is down, each call to it waits for the timeout and fails. A **circuit breaker** counts the failures. After a limit, it stops the calls for a period and fails at once. This protects the caller from waiting, and it gives the dependency time to recover.

In a data pipeline the same idea is a **quality gate**: if the tests on a source fail, the steps after it do not run, and the last good data stays in place. Bad data does not spread. This pattern is also called write-audit-publish.

### Backpressure

When a consumer is slower than its producer, the difference must go somewhere. A [log](/lesson/message-brokers) holds it: the producer continues, and the consumer falls behind and catches up later. This works until the retention period ends. So **lag** is the number to monitor, and retention must be longer than your longest possible outage plus the time to catch up.

Without a buffer, the choices are to slow the producer or to drop data. Decide which, before it occurs.

### Checkpoints and restart

A long job that fails at 95% should not start again at zero. Save progress at safe points: the offset in a stream, the last completed partition in a batch. Divide large batch jobs into tasks by partition, so that a retry repeats one partition. [Stream engines](/lesson/stream-engines) do this with checkpoints.

### Replay

The strongest protection is the ability to **compute the result again from stored input**. Keep the raw data unchanged ([bronze](/lesson/architecture-patterns)), and keep the log for long enough. Then a defect in any later step can be corrected by a rerun. A system that cannot replay must be correct the first time, and no system is.

## Graceful degradation

Decide what the system does when a part is missing, so that the result is worse and not absent.

| Failure | Degraded behaviour |
|---|---|
| The newest source data is late | Publish with yesterday’s data, with a visible “data as of” time |
| An enrichment service is down | Load the records without the enrichment, and fill it in later |
| The real-time path is down | Serve the last batch result |
| The feature store is slow | A simple rule in place of the model. See the [fraud design](/lesson/case-fraud-stream) |

Stale data that is marked as stale is nearly always better than no data, and always better than wrong data.

## Blast radius

Design so that a failure stays small.

- **Separate workloads.** Loading, transformation and dashboards on separate compute. A heavy backfill then cannot slow the dashboards.
- **Separate critical from non-critical.** The finance pipeline does not wait behind an experimental one.
- **Limit concurrency.** Pools and quotas prevent one team from using everything.
- **Small changes.** A release of one model can break one model.

## Backup and disaster recovery

| Risk | Protection |
|---|---|
| A table is overwritten or dropped by error | Table snapshots and time travel. The most common real case |
| A defect corrupts data for a week before it is found | Raw data kept, and jobs that can backfill |
| A whole zone fails | Managed services that span zones. Usually the default |
| A whole region fails | Copies of the data in a second region, and infrastructure as code to rebuild there |
| The account is compromised or deleted | Backups in a separate account with separate credentials |

Most data incidents are the first two rows: a human error or a code defect, not a hardware failure. Spend the first effort there.

A backup that was never restored is a hope, not a backup. **Test the restore** on a schedule, and measure how long it takes. That time is your real RTO.

Analytics platforms rarely need the second region to be live. To rebuild from code in some hours is acceptable for most, and far cheaper. Decide from the RTO that the business agreed.

## Ask the failure questions

For each arrow in a design, from the [design method](/lesson/design-method):

1. What if it runs twice?
2. What if it stops in the middle?
3. What if the input is late, empty or wrong?
4. What if the thing it calls is slow or down?
5. How do we know that it failed?
6. How do we recover, and from what stored data?

> **Pitfall.** Retries without idempotency. The step fails after its write, is tried again, and writes a second time.

> **Pitfall.** Catching every error and continuing. The job is green and the table is half empty. Fail loudly, unless you have decided on purpose how to degrade.

> **Pitfall.** Unlimited retries. The job runs for six hours on a permanent error, and nobody is told.

::scenario
? A nightly load reads 2 million records from a partner file. Tonight 300 of them have a date in a wrong format.
+ Load the good records, write the 300 to a reject table with the reason, and alert if rejects pass a limit such as 1% | The business gets nearly complete data on time, nothing is lost, and someone is told. The limit catches the night when the whole file is bad.
~ Fail the whole load until the file is corrected | Nothing wrong is published. Two million good records wait for 300, perhaps for days.
- Skip the bad records and continue | The numbers are low by 300 records and nobody knows.
? A stream consumer falls behind for six hours during an outage. The topic keeps messages for 24 hours.
+ Let it catch up, and add an alert on lag that fires long before the retention limit | The log did its job as a buffer. The alert is what was missing: six hours passed with no notice.
- Skip to the newest messages, to be current again | Six hours of events are lost for this consumer.
~ Raise the retention to seven days | A good margin for a longer outage. It does not tell anyone that the consumer has stopped.
::end

## Remember

- Agree availability, RTO and RPO with the business. They set the cost.
- Timeouts everywhere. Retries with backoff and a limit, only on idempotent steps.
- Set bad records aside, with a monitor and a limit.
- Stop bad data at a gate. Keep raw input so that you can replay.
- Degrade on purpose. Stale and marked is better than absent or wrong.
- Test the restore.

::quiz
? Why must a step be idempotent before you add retries to it?
+ A step can fail after it has written, and a retry then writes again
- Retries are slower on idempotent steps
- Idempotent steps never fail
! The caller cannot tell “failed before the write” from “failed after the write”. Only an idempotent write makes the second attempt safe.
::end
