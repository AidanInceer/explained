---
title: "Worked design: product analytics from clicks"
summary: Events from a web and mobile application become sessions, funnels and a usage chart inside the product. One event stream serves batch and real-time users.
track: designs
level: core
minutes: 12
at: [1, 1]
prereqs: [design-method, streaming-basics]
tech: [brokers, rtolap, transformation]
refs:
  - kimball: Ch. 15, Electronic Commerce, on clickstream data
  - ddia: Ch. 11, Stream Processing
---
This design is about **events that your own applications produce**: page views, clicks, searches, feature use. There is no source database to copy. You decide what is recorded, and that freedom is the main risk. The company and its numbers are invented for the example.

Compare it with the [online shop](/lesson/case-online-shop): that design copied business tables in batch. This one collects a stream, and serves it in two ways.

## The situation

A company sells a project planning tool, as a web application and two mobile applications. It has 400,000 active users and about 60 million events a day, with peaks of 3,000 each second. Product managers want funnels and retention. The growth team runs experiments. And the product itself shows each customer a chart of their team’s activity.

::fig wb-clicks | The design in ten steps. Use “Next step”, or “Expand” for a larger view.

## Step 1: users and requirements

| User | Question | Freshness | Correctness |
|---|---|---|---|
| Product managers | Where do users stop in the signup flow? Who comes back? | Daily | A few percent is acceptable |
| Growth team | Did variant B of the experiment do better? | Hourly | The comparison between groups must be fair |
| Customers, in the product | What did my team do this week? | About a minute | Must be only their own data |

Two users are served well by batch. The third is different in kind: it is a feature of the product, with thousands of readers who each expect a fast answer. That one needs its own path.

## Step 2: the model

| Table | Grain | Notes |
|---|---|---|
| `fct_event` | One event | The base. Very large |
| `fct_session` | One visit of one user | Built from events with a gap rule |
| `fct_funnel_step` | One user at one step of a defined funnel | For conversion |
| `fct_user_day` | One user on one day on which they were active | For retention and active-user counts |
| `dim_user` | One user, with the anonymous devices that belong to them | Identity |
| `dim_experiment_assignment` | One user in one experiment, with the variant | Assigned once, never changed |

A **session** does not exist in the data. It is a definition: a sequence of events of one user with no gap longer than 30 minutes. It can be computed only after the gap has passed, which is one reason this part is batch.

## Step 3: the sources, and the tracking plan

The sources are the web application, the mobile applications and the backend services. Because the team controls them, the most important design step is a document, not a technology.

A **tracking plan** lists each event: its name, when it is sent, and its fields with types.

| Event | Sent when | Fields |
|---|---|---|
| `project_created` | The server has saved a new project | `user_id`, `project_id`, `template`, `occurred_at` |
| `task_completed` | A task is set to done | `user_id`, `project_id`, `task_id`, `occurred_at` |
| `page_viewed` | A page is shown in the browser | `anonymous_id`, `user_id` if logged in, `path`, `occurred_at` |

Rules that prevent the usual problems:

- **One naming form**: object, then verb in the past. `task_completed`, not `completeTask`.
- **Each event has a schema** in a [registry](/lesson/schema-evolution), and a version.
- **Two times** on each event: when it occurred on the device, and when the server received it.
- **A unique event ID**, made on the device, so that an event sent twice can be found.
- **Important business events come from the backend**, not the browser. A browser event can be blocked or lost. “Order paid” must not depend on a script that an ad blocker removes.

Without a tracking plan, each team invents names, and analysts spend their time finding which of four events means “signed up”.

## Step 4: ingestion

Applications send events to a small **collector** service. It:

1. checks each event against its schema,
2. adds the time of receipt,
3. applies **consent**: events from users who refused analytics are dropped here,
4. writes valid events to [Kafka](/lesson/streaming-basics), with the user as the key.

Events that fail the check go to a reject table with the reason. A sudden rise of rejects after a release means that a developer changed an event. That is useful to know within the hour.

Why Kafka, when most users are batch? Because there are two readers with different speeds, and more will come. See [queues, logs and brokers](/lesson/message-brokers). Managed products exist for this whole front part, such as Snowplow, Segment and RudderStack. For most teams, to buy the collector is the correct choice.

## Step 5: storage

**The lake, for everything.** A loader writes all events to bronze tables each few minutes, partitioned by event date. 60 million events a day is about 10 GB a day as Parquet, and 3.6 TB a year. That is cheap in [object storage](/lesson/object-storage) and expensive to scan carelessly, so every query filters on the date.

**A real-time OLAP store, for the product chart.** A [ClickHouse-type store](/lesson/choosing-engine) reads the same topic. Its table is sorted by customer and time, so that “events of customer 812 in the last 7 days” reads a small part of the data.

## Step 6: transformation

An hourly batch job builds silver:

- **Deduplicate** by event ID. Mobile clients retry.
- **Filter bots** and internal users. Otherwise conversion rates are diluted by crawlers.
- **Sessionise**: a [window function](/lesson/sql-and-queries) marks an event as the start of a session when the time since the user’s previous event is more than 30 minutes.

```sql
select *,
  sum(is_new_session) over (partition by user_key order by occurred_at) as session_seq
from (
  select *,
    case when occurred_at - lag(occurred_at) over (partition by user_key order by occurred_at)
              > interval '30' minute
           or lag(occurred_at) over (partition by user_key order by occurred_at) is null
         then 1 else 0 end as is_new_session
  from events
)
```

- **Resolve identity.** A visitor browses without an account, with an anonymous ID, and signs up a day later. The events before the signup belong to the same person. An identity table maps each anonymous ID to the user it later became, and the job applies it also to past events. This is why sessions for the last few days are rebuilt on each run.

dbt then builds the marts. Sessions and funnels for recent days are rebuilt each hour, because [late events](/lesson/backfills) from mobile devices and new identity links change them.

## Step 7: operations

- **Volume by event, against the same hour last week.** A release that breaks tracking does not cause an error. It causes a fall. This is the most valuable alert in the design.
- **Reject rate** at the collector.
- **Experiment checks.** The two groups of an experiment must have the sizes that were planned. If a 50/50 split shows 53/47, the assignment or the tracking has a defect, and the result cannot be trusted.
- **Tenant isolation** in the product chart: each query is filtered by the customer, enforced in the service, and tested.
- **Privacy.** Events hold a user key, not names or emails. See [privacy in practice](/lesson/privacy-in-practice). Raw events have a retention period.

## The failure questions

| Question | Answer |
|---|---|
| The collector is down | Clients keep events and retry. Mobile applications store them locally |
| An event arrives twice | Removed by event ID in silver. The OLAP table also deduplicates by the same ID |
| A mobile device sends events from three days ago | They go to the partition of their event date. The hourly job rebuilds a window of recent days |
| A developer renames a field | The schema check rejects the events. The reject alert fires. Nothing wrong reaches the marts |
| The definition of a session changes | Bronze has every event. Rebuild silver and the marts |
| The OLAP store is down | The product chart shows a message. The batch path is not affected |
| Traffic is ten times normal after a launch | Kafka absorbs the peak. Consumers fall behind and catch up. Lag is monitored |

## Alternatives, and why they were not chosen

| Alternative | Why not here |
|---|---|
| Only a third-party product analytics tool | A good start, and many companies stay with it. Here the data must also be joined to billing data and shown inside the product |
| The product chart reads the warehouse | Seconds for each query, a limit on concurrent queries, and a cost for each one |
| Sessions computed in a stream processor | Possible. Late events and identity links change old sessions, so a batch rebuild is simpler and more correct |
| No tracking plan. Collect everything automatically | You get every click and no meaning. Events with business meaning must be designed |

## What to take from this design

- When you own the source, the design starts with a contract: the tracking plan.
- One event stream, two readers. The log makes the second reader cheap.
- The fast path exists for one user, and serves only that user.
- Sessions and identity are definitions applied in batch, and recent days are rebuilt.
- The most important alert is on a fall in volume, not on an error.

::scenario
? After a release of the mobile application, daily active users fall by 20%. No pipeline failed.
+ Compare the volume of each event by application version, before and after the release | A fall in one version points to a tracking change in that release, not to a real loss of users. The check takes minutes.
~ Tell the product team that users are leaving | It may be true. If the cause is a renamed event, the company reacts to a problem that does not exist.
- Rerun the pipeline for the week | The events were never sent. A rerun reads the same input.
::end
