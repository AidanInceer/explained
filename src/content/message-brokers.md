A **message broker** is a system that takes messages from producers and gives them to consumers. The producer does not need to know who the consumers are, or if they are running at this moment. This separation is the reason to use one.

There are two designs, and they behave very differently. Many problems come from using one where the other was needed.

::fig queue-log | Choose queue or log, then use “Next step”. Each step says what the broker does and why.

## Queues

A **queue** holds messages until a worker takes them. When the worker confirms that the work is done (an acknowledgement), the broker deletes the message.

- Each message goes to **one** worker.
- More workers share the load. This is the main use: a list of jobs to do.
- A message that was processed is gone. A new consumer that starts later does not see it.
- Order is not guaranteed when several workers read in parallel.

Examples: RabbitMQ, Amazon SQS, Google Cloud Tasks, Azure Service Bus queues.

## Logs

A **log** adds each message to the end of a file and keeps it for a retention period, whether it was read or not. Each consumer remembers its own position, the **offset**.

- **Many** independent consumers can each read every message.
- A consumer can go back and read again. A new consumer can start from the first message.
- Order is guaranteed inside a partition.
- Capacity grows with partitions, as described in [streams and logs](/lesson/streaming-basics).

Examples: Apache Kafka, Redpanda, Amazon Kinesis Data Streams, Azure Event Hubs, Apache Pulsar.

Jay Kreps describes in his essay *The Log* why this structure became the base of data integration: one ordered record of what happened, which every system can read at its own speed.

## Compared

| | Queue | Log |
|---|---|---|
| A message is read by | One worker | Each consumer group |
| After it is read | Deleted | Kept until retention ends |
| Replay of old messages | No | Yes |
| Add a consumer later | It sees new messages only | It can read the history |
| Order | Weak | Strict inside a partition |
| Parallel work | Add workers, with no limit | Limited by the number of partitions |
| Slow message | Other workers continue | It blocks its partition |
| Typical use | Jobs: send an email, resize an image | Events: orders, clicks, database changes |

For data engineering the log is usually the correct one, because analytics always arrives as a second, third and fourth consumer, and because replay lets you process history again with new logic.

**Publish-subscribe** services such as Google Pub/Sub and Amazon SNS are between the two: each subscription gets every message, as with a log, but messages are deleted after acknowledgement, with only limited replay.

## The products

| Product | Type | Operated by | Notes |
|---|---|---|---|
| **Apache Kafka** | Log | You, or a managed service: Confluent Cloud, Amazon MSK, Aiven | The standard. The largest set of connectors and tools |
| **Redpanda** | Log | You or their cloud | Uses the Kafka protocol. One binary, no JVM |
| **Amazon Kinesis Data Streams** | Log | AWS | Capacity in shards. Simple if you are on AWS. Fewer tools |
| **Azure Event Hubs** | Log | Azure | Also accepts the Kafka protocol |
| **Google Pub/Sub** | Publish-subscribe | Google | No partitions to manage. Order only with ordering keys |
| **Apache Pulsar** | Log and queue | You or a managed service | Storage separate from brokers. Smaller community |
| **Amazon SQS** | Queue | AWS | Nearly no administration. Not for replay |
| **RabbitMQ** | Queue | You or a managed service | Flexible routing. Good for tasks between services |

## Ideas that every log broker shares

- **Topic**: a named stream of messages.
- **Partition**: an ordered part of a topic. The **key** of a message decides its partition, so all messages with one key stay in order.
- **Offset**: the position of a message in its partition.
- **Consumer group**: a set of consumers that share the partitions of a topic. Each partition has one reader in the group.
- **Retention**: how long messages are kept, by time or size. With **log compaction**, the broker keeps only the last message for each key, which turns a topic into a table of current values.
- **Replication**: each partition is copied to several brokers, so that the loss of one machine loses no data.
- **Lag**: how far a consumer is behind the newest message. It is the main number to monitor.

## Schemas for messages

A broker carries bytes and does not check them. If a producer changes the format, each consumer fails. A **schema registry** stores the schema of each topic, usually in Avro or Protobuf, and rejects changes that are not compatible. See [schema evolution](/lesson/schema-evolution).

## Dead-letter queues

Some messages cannot be processed: the format is wrong, or a referenced record does not exist. If the consumer tries again without end, the partition is blocked. The usual design sends the message to a separate **dead-letter** topic after a few attempts, with the error, and continues. Someone must monitor that topic, or it becomes a place where data is lost quietly.

> **Pitfall.** Kafka as a database. It can keep data for a long time, but it has no query by field. Use it to move and hold events, and build tables from it for queries.

> **Pitfall.** Too few partitions at the start, or too many. The number of partitions limits the parallel consumers. To add partitions later changes which partition a key goes to, and that breaks order for keys in flight. Choose with growth in mind, and not thousands for a small topic.

::scenario
? A web shop must send a confirmation email for each order. If the email service is slow, orders must still be accepted.
+ A queue between the shop and the email worker | Each email must be sent once, by one worker. Add workers when the list grows. No replay is needed.
~ A Kafka topic with one consumer group | It works, and it lets other consumers read orders later. It is more to operate if email is the only use.
- A direct call from the shop to the email service | When the email service is slow, the checkout is slow.
? The order events must go to the warehouse, to a fraud model, and to a search index. A fourth team will probably want them next year.
+ A log such as Kafka or Kinesis | Each consumer reads all events at its own speed. The fourth team can start from the history without a change to the producer.
- One queue that the three consumers share | Each message goes to only one of them. Each consumer gets a third of the orders.
~ Three queues, and the shop writes each order to all three | It works for three. The shop must change for each new consumer, and a failure between the writes leaves them different.
::end

## Remember

- A queue gives each message to one worker and deletes it. Use it for jobs.
- A log keeps messages for every reader and permits replay. Use it for events and data integration.
- Keys give order. Partitions give capacity. Lag tells you the health of a consumer.
- Use a schema registry and a monitored dead-letter topic.

::quiz
? A new analytics consumer must process the events of the last seven days. Which broker type makes this possible?
+ A log, because messages are kept after they are read
- A queue, because it has many workers
- The two types make it possible
! A queue deletes each message after it is acknowledged. A log keeps it for the retention period, so a new reader can start from the past.
::end
