This is the third worked design, and the only one of the three where streaming is necessary. The reason is in the first requirement: a program must decide in less than a second, and the checkout waits for the answer. The company and its numbers are invented for the example.

Compare it with the [online shop](/lesson/case-online-shop) and the [flight booking system](/lesson/case-flight-booking). The method is the same. The requirement is different, so the design is different.

## The situation

A payment company processes card payments for online merchants: about 2 million payments a day, with peaks of 150 each second. A small part is fraud: stolen card numbers that are tested with small payments and then used for large ones. Each payment must be approved or declined before the customer sees the result.

::fig wb-fraud | The design in seven steps. Use “Next step”.

## Step 1: users and requirements

| Consumer | Action | Latency | Correctness |
|---|---|---|---|
| The payment API | Approve or decline one payment | The fraud check has 100 milliseconds | A wrong decline loses a sale. A wrong approval loses money |
| Fraud analysts | Investigate patterns. Change rules | Minutes | Complete |
| Data scientists | Train and evaluate the model | Daily | [Point-in-time correct](/lesson/data-for-ml) |
| Finance | Losses and chargebacks | Daily | Exact |

The first row is not a normal analytic requirement. The consumer is a program, the latency is milliseconds, and it is in the path of the customer. [Batch and micro-batch](/lesson/batch-vs-streaming) cannot be used for it. The other three rows are ordinary batch needs, and the design keeps them in batch.

## Step 2: what the decision needs

The model that scores a payment needs **features**. Some are in the payment itself: amount, country, merchant. The useful ones describe recent behaviour:

- Number of payments with this card in the last 10 minutes.
- Total amount with this card in the last hour.
- Number of different countries for this card in the last 24 hours.
- Number of declined attempts in the last 5 minutes.

These are [window aggregations](/lesson/windows-and-time) for each card, and they must be current to the last few seconds. A fraudster who tests a card makes ten payments in one minute. A feature that is five minutes old does not see them.

## Step 3: the sources

| Source | Type | Volume | Notes |
|---|---|---|---|
| Payment attempts | Events from the payment API | 2 million a day. 150 each second at peak | The main stream |
| Chargebacks | A file from the card networks | A few thousand a day | Arrive **days to weeks** after the payment. These are the labels |
| Merchant and card data | The operational database | Slow changes | Reference data |

## Step 4: ingestion

The payment API publishes each attempt to a [Kafka topic](/lesson/streaming-basics), with the **card ID as the key**. The key puts all events of one card in one partition, in order. Without it, two events of the same card could be processed out of order on different machines.

The API does not wait for the stream. It publishes the event and, in parallel, asks the scoring service. This matters: the path of the customer does not depend on the health of the analytic path.

Chargebacks are a daily batch file. Reference data comes by [CDC](/lesson/cdc) into compacted topics.

## Step 5: the stream path

A [Flink](/lesson/stream-engines) job reads the topic and keeps **state for each card**: the counts and sums for each window. For each event it updates the state and writes the new feature values to an **online feature store**, a [key-value store](/lesson/operational-stores) such as Redis or DynamoDB.

The scoring service does three things for each request:

1. Reads the features of the card from the key-value store, in about a millisecond.
2. Runs the model and the fixed rules.
3. Returns approve, decline or review.

The scoring service never queries Kafka or Flink. A request path must depend only on fast reads by key.

**Why Flink?** The work is state for each key, on event time, with latency of less than a second and exact recovery after a failure. That is the specific strength of a true streaming engine. Spark Structured Streaming in micro-batches of a few seconds would be at the limit. A streaming database is a valid alternative if the features can be written in SQL.

## Step 6: the batch path

The same topic is written continuously to the lake as Parquet. From there:

- A **daily training job** builds the training set and trains a new model. The scoring service loads the new version after it passes evaluation.
- **Analysts** query the history in the warehouse.
- **Finance** gets daily loss tables.

So the stream path *uses* the model, and the batch path *makes* it. This is the idea behind the [Lambda architecture](/lesson/architecture-patterns), and here the two paths have clearly different jobs.

### The hard part: labels arrive late

You learn that a payment was fraud when the cardholder disputes it, days or weeks later. The training job joins each chargeback back to its payment.

It must then attach the features **as they were at the moment of the payment**. If it computes “payments in the last 10 minutes” again from the full history, it must use exactly the same logic as the Flink job. Any difference is [training-serving skew](/lesson/data-for-ml).

The safest design avoids a second computation: the scoring service **logs the features it used** with each decision. The training set is then the logged features joined to the labels. What the model sees in training is by construction what it saw in production.

## Step 7: operations

- **Delivery guarantees.** Flink’s [checkpoints](/lesson/delivery-semantics) give exactly-once updates of its own state. The write to the feature store is an overwrite by key, which is idempotent.
- **Do the features need exactly-once?** Not strictly. A count of 7 in place of 6 for a few seconds does not change a decision. This design accepts small errors in features for the sake of speed. The money itself is in the payment ledger, which is a transactional database and is not part of this pipeline.
- **Fallback.** If the feature store or the scoring service does not answer in 100 milliseconds, the payment API applies a simple rule: approve small amounts, decline or review large ones. The system gets worse in a controlled way, and payments do not stop.
- **Monitoring.** Consumer lag of the Flink job, in seconds. The 99th percentile of the scoring latency. The approval rate: a sudden fall is an incident. The distribution of each feature, to see drift.
- **State.** Each card’s state has a time to live. Without it, state for cards that are never seen again grows without limit.
- **Releases.** A new version of the Flink job starts from a savepoint of the old one. A new model runs first in **shadow mode**: it scores real payments and its decisions are logged and not used, until it is shown to be better.
- **Replay.** Kafka retention of seven days, and the full history in the lake, let you compute a new feature for the past before you use it.
- **Security.** Card numbers are replaced by tokens before they enter this system. The pipeline never holds a real card number.

## The failure questions

| Question | Answer |
|---|---|
| A Flink machine fails | The job restarts from the last checkpoint and reads again from the saved offsets. Features are a few seconds old for a short time |
| An event is processed twice | Inside Flink, state and offset are saved together, so it counts once. The feature write is an overwrite |
| Events arrive late or out of order | Windows use event time with a short watermark. Very late events are dropped from the features and still stored in the lake |
| Traffic is five times normal on a sale day | Partitions and Flink parallelism are sized for the peak. Lag is the signal. The fallback rule protects the checkout |
| The feature store is down | Fallback rule. An alert to the on-call engineer |
| A new model is worse than the old one | Shadow mode finds it before it decides anything. If not, go back to the last version in the registry |
| One card has thousands of events (a merchant’s test card) | A [skewed key](/lesson/spark-tuning). Filter known test cards, and limit the state for each key |

## Alternatives, and why they were not chosen

| Alternative | Why not here |
|---|---|
| A batch job each minute that computes features | A fraudster makes ten payments in that minute. The features are always too old |
| The scoring service counts recent payments with a query on the payments database | It adds a heavy query to each payment, on the database that must stay fast |
| Only rules, with no model and no stream | Works for the simplest fraud. It is the correct first version for a new company, and it is the fallback here |
| A stream path only, with training on the stream too (Kappa) | Possible. The late labels and the heavy training job fit batch naturally |

## What to take from this design

- Streaming was chosen because a program must act in milliseconds, not because it is modern. Three of the four consumers are still served by batch.
- The request path reads from a key-value store. It never waits for the analytic system.
- The message key decides order. The choice of key is a design decision.
- Log the features at decision time, so that training and serving cannot differ.
- Decide what the system does when a part fails. A fallback rule is part of the design.
- Exactly-once is used where it is needed. It is not needed everywhere.

::scenario
? The team wants to add a feature: “number of different merchants for this card in the last 30 days”.
+ Compute it in batch each night, write it to the same feature store, and let the stream job handle only the short windows | A 30-day window changes slowly. A nightly value is nearly as good, and Flink does not have to keep 30 days of state for each card.
~ Add a 30-day window to the Flink job | It gives a value that is exact to the second. The state for each card grows a lot, checkpoints become slow, and the extra exactness has little effect on decisions.
- Query the warehouse from the scoring service for each payment | A warehouse query takes seconds. The budget is 100 milliseconds.
::end
