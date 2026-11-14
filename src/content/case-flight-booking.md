This is the second worked design. The [online shop](/lesson/case-online-shop) needed a plain batch design. This system has three properties that make it harder: the main record changes many times, some users need data within the hour, and the data includes sensitive personal details. The airline and its numbers are invented for the example.

## The situation

A regional airline sells seats on about 300 flights a day through its website, its app and travel agents. A booking is not one event. It is created, paid, changed, sometimes cancelled and refunded, checked in, and finally flown. Between the first step and the last there can be eleven months.

::fig wb-flight | The design in eight steps. Use “Next step” to draw it in order.

## Step 1: users and requirements

| User | Decision | Freshness | Correctness |
|---|---|---|---|
| Revenue management | Change fares by how full each flight is | Hourly | A small error is acceptable. Late data is not |
| Finance | Revenue, refunds and taxes for each day | Daily | Must agree with the payment provider |
| Customer service | See all that happened to one booking | Minutes | Complete history |
| Marketing | Which searches become bookings | Daily | Approximate |

Out of scope, and this matters: **the sale of seats**. “Is seat 14C free?” is answered by the booking service, with a transaction, in milliseconds. An analytic platform is minutes behind by design. It must never be the system that decides if a seat can be sold. A clear line between the operational system and the analytic system is part of the design.

The freshest need is customer service, in minutes. But look at it again: an agent who wants the current state of one booking can read the booking service. What the platform adds is *history*. So the fast path is needed for revenue management, at one hour.

## Step 2: the model

| Table | Grain | Kind | Why |
|---|---|---|---|
| `fct_booking` | One booking | [Accumulating snapshot](/lesson/fact-table-types): dates for created, paid, ticketed, checked in, flown, cancelled | Time between steps. How many bookings are at each step |
| `fct_booking_event` | One change to a booking | Transaction | The full history, for customer service and audit |
| `fct_flight_leg_daily` | One flight on one departure date, for each day before departure | Periodic snapshot: seats sold, capacity, revenue | The booking curve: how a flight fills in time |
| `fct_payment` | One charge or refund | Transaction | Reconciliation with the provider |
| `dim_flight`, `dim_route`, `dim_airport`, `dim_date` | | | |
| `dim_fare` | One version of a fare | [Type 2](/lesson/scd) | Fares change daily. A booking must keep the fare it was sold at |
| `dim_passenger` | One passenger | Type 1, sensitive columns masked | |

The three kinds of fact table from one source are the main modelling point of this design. The events are the base. The accumulating snapshot and the periodic snapshot are built from them.

## Step 3: the sources

| Source | Type | Volume | How it changes |
|---|---|---|---|
| Booking service | PostgreSQL, OLTP | 40,000 bookings a day. About 400,000 row changes a day | Each booking is updated many times. Abandoned bookings are **deleted** |
| Payment provider | Webhooks, and a daily settlement report | 45,000 charges and refunds a day | Disputes can change a charge weeks later |
| Flight schedule | A file from the operations system, each 15 minutes | 300 flights a day, with changes | Delays, aircraft changes, cancellations |
| Search events | Events from web and app | 5 million a day. Peaks of 400 each second | Inserts only. Some arrive late from mobile devices |

Estimate: the search events are the volume, at perhaps 5 GB a day in raw form. Bookings are small in volume and high in value.

## Step 4: ingestion

Each source gets the method that fits it.

**Bookings: [change data capture](/lesson/cdc).** A query on `updated_at` each hour has three problems here. It does not see deleted bookings. It sees only the last state of a booking that changed four times in the hour, so the history that customer service needs is lost. And it puts load on the database that sells tickets. Debezium reads the transaction log and writes each change to Kafka.

**Search events: the same Kafka cluster.** The website publishes to a topic.

**Payments: both paths.** Webhooks go to Kafka for a fast, provisional view. The daily settlement report is loaded in batch and is the official record. Webhooks can be lost, and the report corrects the gaps.

**Flight schedule: a batch loader.** A file each 15 minutes is a batch by nature. A job that starts when the file arrives checks it and loads it.

## Step 5: storage

A [lakehouse](/lesson/warehouse-lake-lakehouse): Iceberg tables in object storage, in [three layers](/lesson/architecture-patterns).

- **Bronze**: every change event as it arrived, append-only, partitioned by ingestion date. One row for each *change* to a booking.
- **Silver**: the current state of each booking, with duplicates removed, and the cleaned events.
- **Gold**: the facts and dimensions of step 2.

Why a lakehouse and not only a warehouse? Three reasons from the requirements. The CDC stream needs frequent merges, which [table formats](/lesson/table-formats) support with a low cost. Revenue management’s data scientists want to train pricing models on files with Spark. And the 5 million search events a day are cheap to keep in object storage. A cloud warehouse with a streaming ingestion feature is a valid alternative with fewer parts. The choice depends on the skills of the team.

## Step 6: transformation

- **Bronze to silver, each 15 minutes.** A Spark job reads the new change events and [merges](/lesson/idempotency) them into the silver booking table by booking ID. It applies events in the order of their log position, so that an old event that arrives late cannot overwrite a newer state. Deletes become a `deleted_at` value, not a removed row.
- **Masking.** Passport numbers, dates of birth and payment details are masked or dropped in this step. Gold never contains them. See [governance and security](/lesson/governance-security).
- **Silver to gold, hourly.** [dbt](/lesson/transformation-dbt) builds the facts. `fct_booking` is incremental. `fct_flight_leg_daily` is rebuilt for flights that have not yet departed.
- **Finance tables, daily**, after the settlement report is loaded.

## Step 7: operations

- **Orchestration.** [Airflow](/lesson/orchestration) schedules the batch steps, with a sensor for the schedule file. The CDC connector and Kafka run continuously and are monitored, not scheduled.
- **Tests that stop the pipeline.**
  - Seats sold for a flight are not more than its capacity.
  - Tickets paid for a day equal the settled payments for that day.
  - Each booking in gold has a flight in `dim_flight`.
- **Freshness objective.** `fct_flight_leg_daily` is at most 90 minutes old in working hours. An alert goes to the on-call engineer. See [SLAs and incidents](/lesson/incidents-reliability).
- **CDC health.** Monitor the lag of the connector and the size of the replication slot in Postgres. If the connector stops, the database keeps its log for it, and the disk of the booking database can fill. This is the most dangerous failure in the design, because it can stop the sale of tickets.
- **Privacy.** A passenger can ask for deletion. The design must know each place where personal data is stored: bronze, silver, and backups. Bronze has a retention period for this reason.

## The failure questions

| Question | Answer |
|---|---|
| The merge job runs twice on the same events | The merge is by booking ID and log position. The second run changes nothing |
| An event arrives out of order | The log position decides. An older event does not replace a newer state |
| Kafka is not available for an hour | Debezium waits and continues from its position in the Postgres log. No change is lost. Watch the disk of the source |
| The schedule file is missing | The sensor times out and alerts. The last schedule stays in place. Gold is marked as not fresh |
| A webhook is lost | The provisional view misses a payment until the nightly settlement load corrects it |
| A defect in the silver logic is found after two weeks | Bronze has every change. Correct the code and build silver again from bronze |
| The booking team adds a column | Debezium passes it on. Bronze stores it. The silver job selects named columns, so nothing breaks |

## Alternatives, and why they were not chosen

| Alternative | Why not here |
|---|---|
| A snapshot of the bookings table each hour | Loses the changes between snapshots, and loads the sales database |
| Flink for the whole path, in seconds | Nobody needs seconds. The hourly requirement is met by micro-batches at lower cost and with simpler operations |
| Only the accumulating snapshot, with no event table | Customer service and audit need each change. And it could not be built again |
| The booking service publishes business events itself, with no CDC | Better in the long term: events with business meaning, under a [contract](/lesson/schema-evolution). It needs work by the booking team. Plan it as the next version |

## What to take from this design

- A record that changes many times needs CDC and an event table. The current state and the history are two different products.
- Three kinds of fact table come from the same events and answer three kinds of question.
- Each source has its own ingestion method. One design contains CDC, events, webhooks and files.
- The fast path is as fast as the fastest *real* requirement, which was one hour.
- The design states what it does not do: it does not sell seats.

::scenario
? Revenue management now asks for load factors that are at most five minutes old during sales campaigns.
+ Run the bronze-to-silver merge and the one gold table they need each few minutes, and leave the rest hourly | The CDC stream already arrives in seconds. Only the schedule of one path must change. Check that each run finishes well inside its interval.
~ Add a Flink job that computes seats sold for each flight from the Kafka topic | It gives seconds. It also adds a second definition of “seats sold” next to the batch one, and the two must be kept equal.
- Let the pricing system query the booking database directly | Heavy analytic queries on the system that sells tickets, during the busiest period.
::end
