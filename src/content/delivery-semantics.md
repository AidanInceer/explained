A consumer reads a message, does some work, and records its progress. It can fail between any two of those steps. What occurs after the restart is the system's **delivery guarantee**. There are three, and their names promise more than they give.

::fig delivery | The consumer fails at one point near message 3. The order of the work and the progress record decides the result.

## At-most-once

Record progress first, then do the work. If the consumer fails between the two, the message is marked as done and it was never processed. It is **lost**.

Each message is processed zero times or one time. This is acceptable where a gap is harmless and a duplicate is not, for example high-volume metrics where a sample is sufficient.

## At-least-once

Do the work first, then record progress. If the consumer fails between the two, it restarts from the old position and processes the message again. The message is **duplicated**.

Each message is processed one or more times. Nothing is lost. This is the default of most systems, and the one to assume unless you have made sure of something stronger.

## Exactly-once

Each message affects the result one time only. This is what everyone wants.

Understand what the term means. **Exactly-once delivery is not possible** across a network. A sender that gets no acknowledgement cannot know if the message was lost or only the acknowledgement was. It must send again, or risk a loss. What is possible is **exactly-once processing**, also named *effectively once*: messages can be delivered more than once, and the system makes sure that the repeats have no effect on the result.

There are two ways to get it.

### 1. Idempotent writes

Make the write to the target safe to repeat. Then at-least-once delivery gives a correct result.

- **Upsert on a unique key.** If each message has an id, write with a merge on that id. The second copy replaces the first with the same values.
- **Remove duplicates by id.** Keep the ids that have been processed, for a period, and skip the repeats.
- **Write to a deterministic location.** If the output for window 12:00 to 12:05 always goes to the same file name or the same row key, a second attempt replaces the first.

This is the same principle as [idempotent pipelines](/lesson/idempotency) in batch. It is the simplest and most reliable method, and it works with any system.

### 2. Atomic commit of output and progress

Make "write the result" and "record the progress" one atomic operation, so that both occur or neither does.

- **Keep the offset in the target.** If the target is a database, write the result rows and the consumer's offset in *one transaction*. After a failure, read the offset from the database. It always agrees with the data.
- **Transactions in the platform.** Kafka can write output records to other topics and commit the consumer offsets as one transaction. This gives exactly-once for work that reads from Kafka and writes to Kafka.
- **Checkpoints with two-phase commit.** Flink saves a consistent snapshot of the state and positions of all operators. Targets that support it hold their output as pending until the checkpoint is complete, and then commit it.

## The guarantee stops at the boundary

"Exactly-once" in a product's documentation applies inside that product. The whole pipeline is only as strong as its weakest connection.

A Flink job with exactly-once state that sends an email for each event will send the email again when it restarts from a checkpoint. The email is an external effect that the checkpoint cannot undo. *Streaming Systems* has a chapter on this, and its conclusion is the practical rule: to get exactly-once effects in an external system, that system must accept idempotent writes or take part in the transaction.

## The producer side

Duplicates can also come from the producer. It sends a record, the acknowledgement is lost, and it sends again. Kafka's **idempotent producer** adds a sequence number to each record, so that the broker can discard the repeat. In current versions it is on by default.

## How to design with this

1. Assume at-least-once from every source.
2. Give each event a stable, unique id at the place where it is created.
3. Make each write idempotent with that id, or commit the write and the progress together.
4. For effects that cannot be reversed, such as payments and messages to people, record under the id that the effect was done, and check that record before you do it.

## Remember

- At-most-once can lose messages. At-least-once can duplicate them.
- Exactly-once means exactly-once *effect*: repeated delivery, with no repeated result.
- You get it with idempotent writes, or with one atomic commit of the output and the progress.

::quiz
? A consumer writes a row to a database and then fails before it commits its offset. After the restart it processes the same message. Which guarantee is this, and what is the risk?
- At-most-once. The message is lost
+ At-least-once. The row is written twice
- Exactly-once. There is no risk
! The work was done before the progress was recorded, so nothing is lost. The message is processed again, and a plain insert gives a duplicate.
? How does a merge on the message id change that result?
+ The second write replaces the first with the same values, so the result is correct
- The second write fails and stops the pipeline
- The message is skipped and lost
! An idempotent write makes a repeated delivery harmless. At-least-once delivery with idempotent writes gives an exactly-once result.
? A stream job with exactly-once checkpoints calls a payment API for each event. After a restart, can a payment be made twice?
+ Yes, unless the API accepts an idempotency key or the job records the payments it has made
- No. The checkpoint prevents it
! The engine's guarantee applies to its own state. An external call that was made before the failure is made again when the event is replayed.
::end
