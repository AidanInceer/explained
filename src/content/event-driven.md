A service does something: it accepts an order. Other systems must know: the warehouse, the email service, the fraud check, the search index. How the first system tells the others is one of the most important decisions in an architecture, and data engineers live with the result.

## Three ways to connect systems

| Method | How | Problem |
|---|---|---|
| **Direct calls** | The order service calls each other system | The order service must know all of them. If one is slow, orders are slow |
| **Shared database** | Other systems read the orders tables | Every reader depends on the internal schema. No change is safe |
| **Events** | The order service publishes “order placed” to a [log](/lesson/message-brokers). Others subscribe | More parts. Consumers are a little behind |

An **event-driven architecture** uses the third. The producer does not know its consumers, and a new consumer needs no change to the producer. For data engineering this is the best case: the analytics platform is one more subscriber.

## Kinds of event

| Kind | Content | Example |
|---|---|---|
| **Notification** | “Something happened”, with an ID | `order_placed, id 1004`. The consumer must call back for the details |
| **Event with state** | The fact, with the data that consumers need | `order_placed` with customer, lines and total |
| **Change event** | A row before and after a change, from [CDC](/lesson/cdc) | `orders: status created → paid` |

Events with state are the most useful for analytics: each one is complete, and no call to the source is needed.

A **business event** and a **change event** are not the same thing. “Order placed” says what happened in the language of the business. A CDC event says that three columns of a row changed, in the language of one database schema. To get the business meaning from CDC events, the consumer must know the internals of the producer. Prefer business events where the producing team can supply them.

## The dual-write problem

The order service must do two things: write the order to its database, and publish the event. They are two separate systems.

```
1. INSERT order into the database      ✓
2. publish "order placed" to Kafka     ✗  the service stops here
```

The order exists, and no other system will ever hear of it. If you reverse the two steps, the opposite failure occurs: an event for an order that was never saved. There is no order of the two writes that is safe, because no transaction covers the two systems.

This is the **dual-write problem**. It is the source of many “the numbers in the warehouse do not agree with the application” investigations.

## The outbox pattern

The solution is to make one write, not two.

1. In **one database transaction**, the service inserts the order **and** inserts a row into an `outbox` table that describes the event.
2. A separate process reads the outbox and publishes each row to the log.

```sql
begin;
insert into orders (id, customer_id, total) values (1004, 7, 61.50);
insert into outbox (event_id, type, payload)
values ('e-881', 'order_placed', '{"order_id":1004,"customer_id":7,"total":61.50}');
commit;
```

The two rows are saved together or not at all. The relay process can fail and start again. It then publishes some events twice, so delivery is [at-least-once](/lesson/delivery-semantics), and consumers remove duplicates with the `event_id`.

The usual relay is **CDC on the outbox table**: Debezium reads the transaction log and publishes each new outbox row. This gives the reliability of CDC with the clean business events of an event design. It is the combination to know.

## CDC without an outbox

You can also point CDC at the business tables themselves. It needs no change in the application, and it is the fastest way to get data out of an old system. Its costs:

- Consumers see the **internal schema**. A refactoring of the tables breaks them.
- One business action can be changes to five tables. The consumer must put them together.
- The reason for a change is not in the data: was the status changed by the customer or by a support agent?

A common path: start with CDC on the tables, to get the data moving. Move the important streams to outbox events with a [contract](/lesson/schema-evolution) later.

## Event sourcing

In **event sourcing**, the events are the primary record. The application does not store the current state of an order. It stores `order_placed`, `item_added`, `order_paid`, and computes the state from them.

It gives a full audit history, and the state at any past time. It also makes the application harder to build and to change. It is a decision for the application team. For a data engineer, an event-sourced system is a very good source: nothing was ever overwritten.

Do not confuse it with an event-driven architecture. A system can publish events and still keep its state in normal tables.

## Order, duplicates and time

A consumer of events must handle three things. They are the same in every streaming lesson.

- **Order.** Events are in order only inside one partition. Use the entity ID as the [message key](/lesson/streaming-basics), so that all events of one order are in one partition.
- **Duplicates.** Delivery is at-least-once. Each event needs a unique ID, and the consumer must be [idempotent](/lesson/idempotency).
- **Time.** Each event carries the time it occurred. Do not use the time of arrival.

## Schemas and ownership

An event stream is a public interface. It needs the same care as an API:

- A **schema** in a registry, with [compatibility rules](/lesson/schema-evolution).
- An **owner**: the team that produces it.
- **Versions** for breaking changes.
- **Documentation** of what each field means and when the event is sent.

Without these, an event-driven architecture becomes a shared database with more steps.

## Sagas, in short

A business process can cross several services: reserve stock, take payment, book a courier. No single transaction covers them. A **saga** is a sequence of local transactions, each one started by an event, with a **compensating action** to undo the earlier steps if a later one fails: release the stock if the payment fails.

For analytics this means that an order can be in an intermediate state for some time, and that “cancelled” and “compensated” events are part of the normal flow. An [accumulating snapshot](/lesson/fact-table-types) is the natural model for such a process.

## When events are not the answer

| Situation | Better choice |
|---|---|
| A small system with one database and one team | Read the database. Events add parts with no gain |
| The consumer needs an answer immediately | A direct call |
| A daily report | A batch extract |
| Nobody can own the event schemas | CDC, and accept the coupling for now |

::scenario
? A service writes an order to Postgres and then publishes an event to Kafka. Once a week, the warehouse has fewer orders than the application.
+ Write the event to an outbox table in the same transaction, and publish from there with CDC | The order and its event are now saved together. A failure after the commit only delays the event.
~ Publish first, then write to the database | The failure moves to the other side: events for orders that do not exist. It is harder to notice, not better.
- Add retries around the publish call | It helps when Kafka is slow. It does nothing when the service stops between the two writes.
? An old billing system has no team that can change it. Analytics needs its data within minutes.
+ CDC on its tables | It needs no change to the application and gives every change. Accept the dependency on its schema, and hide it in a staging layer.
- Ask for outbox events | The correct long-term design, but nobody can build it in that system.
~ A query on `updated_at` each few minutes | Works if the column is reliable. It adds load to the system and does not see deletes.
::end

## Remember

- Events let a producer serve consumers that it does not know. Analytics is one more subscriber.
- Two writes to two systems cannot be made safe by ordering them.
- The outbox pattern makes them one transaction, and CDC publishes the outbox.
- CDC on business tables is fast to start and couples consumers to an internal schema.
- Use the entity ID as key, give each event an ID and a time, and own the schema.

::quiz
? Why does the outbox pattern solve the dual-write problem?
+ The business row and the event row are in one database transaction, so they succeed or fail together
- It makes Kafka faster
- It removes the need for a message broker
! One transaction covers the two inserts. Publishing then becomes a separate, repeatable step that cannot lose an event.
::end
