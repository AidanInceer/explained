A batch job processes a dataset that has an end: yesterday's orders. A streaming job processes a dataset that does not: orders, as they occur, without stopping. The data is the same. The difference is that you do not wait for it to be complete, because it never is.

## Bounded and unbounded data

*Streaming Systems* gives the most useful vocabulary. Data is **bounded** if it is finite and **unbounded** if it continues to arrive. Batch engines were built for bounded data, and streaming engines for unbounded data.

A daily batch job is a way to process unbounded data by cutting it into bounded parts, one for each day. That is a valid design, and it is often the correct one. Streaming is useful when the value of the data falls quickly with time: fraud detection, stock levels, operational alerts, a feature for a recommendation model.

> **Check the need first.** Many requests for "real time" are satisfied by a batch that runs every 15 minutes. Streaming systems are harder to build, test and operate. Ask what decision will be made faster, and what that is worth.

## The log

Most streaming platforms, including Apache Kafka, Amazon Kinesis and Apache Pulsar, are built on one data structure: the **append-only log**.

A log is an ordered sequence of records. New records are added at the end only. Each record gets a sequence number, its **offset**. Records are not changed after they are written.

This is different from a traditional message queue, where a message is removed when a consumer takes it. In a log:

- **Records stay** for a retention period, such as 7 days, whether or not they have been read.
- **Each consumer keeps its own position**, an offset. To read is to advance that number.
- **Many independent consumers** can read the same log, each at its own speed. A new consumer can start from the beginning.
- **A consumer can replay.** Set the offset back, and it processes the old records again. This is how you recover from a defect in a streaming job.

Jay Kreps, one of the creators of Kafka, described in his essay *The Log* why this structure is so general: a database's replication log, a [CDC](/lesson/cdc) feed and an event stream are the same thing.

## Topics, partitions and consumer groups

In Kafka, a log for one kind of event is a **topic**, such as `orders`. One log on one machine has a throughput limit, so a topic is divided into **partitions**. Each partition is an independent log.

A **producer** chooses the partition for each record. Usually it hashes the record's **key**: `partition = hash(key) % number_of_partitions`. All records with the same key go to the same partition.

This gives the most important guarantee to remember: **order is kept inside a partition, and not across partitions.** If all events for order 1004 must be processed in sequence, use the order id as the key.

A **consumer group** is a set of consumer processes that share the work of a topic. Kafka assigns each partition to exactly one consumer in the group.

::fig consumers | Change the number of consumers. Each partition has one reader in the group, so the number of partitions is the limit on parallel work.

Different groups are independent. A fraud service and a warehouse loader can each read every record of `orders`, each with its own offsets.

## What a consumer must decide

A consumer reads a batch of records, does its work, and then **commits** its offset, which records "I have processed up to here". If it stops and starts again, it continues from the last commit.

The order of "do the work" and "commit" decides what occurs on a failure, and there is no order that avoids both loss and duplication. [Delivery guarantees](/lesson/delivery-semantics) covers this.

**Consumer lag** is the distance between the newest offset in a partition and the consumer's committed offset. It is the first number to monitor. Lag that grows means the consumer is slower than the producers.

## Remember

- A log is append-only, ordered, and kept for a period. Consumers keep their own offsets and can replay.
- A topic is divided into partitions. The key decides the partition. Order is kept inside one partition only.
- In a consumer group, each partition has one reader. Partitions limit parallel work.

::quiz
? Events for one bank account must be processed in the order in which they occurred. How do you make sure of this in Kafka?
- Use one consumer
+ Use the account id as the record key
- Use a topic with a long retention period
! Records with the same key go to the same partition, and a partition keeps its order. One consumer reading several partitions does not keep order across them.
? A topic has 6 partitions and a consumer group has 8 consumers. How many consumers do work?
+ 6
- 8
- 1
! Each partition is assigned to one consumer in the group. The other two wait as spares.
? How is a log different from a traditional message queue?
- A log is faster
+ Records stay after they are read, and each consumer keeps its own position
- A log can hold only text
! Because records are kept, several consumers can read independently, and a consumer can go back and process old records again.
::end
