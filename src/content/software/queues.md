---
minutes: 8
tech: []
refs:
  - ddia: Ch. 11, “Stream Processing”, section on message brokers
  - sre: Ch. 22, “Addressing Cascading Failures”
---
Some work is too slow to do while a user waits: sending email, resizing photos, generating a report, calling a slow partner API. Do it later. A **queue** holds jobs, and **workers** take jobs from it and do them in the background. The user gets a fast answer, and the slow work still happens, safely.

## How it works

1. The web server receives a request, saves what it must, and adds a **message** to the queue: "send the receipt for order 8841".
2. It answers the user at once.
3. A **worker** process takes the message, does the job, and tells the queue it is done.

Common tools are RabbitMQ, Amazon SQS, Redis-based queues, and Kafka for high-volume streams. Many frameworks have a job library on top of one of these.

## Why use a queue

- **Fast responses.** The user does not wait for the slow part.
- **Smooth peaks.** A sale brings 10,000 orders in a minute. The queue grows, and the workers work through it at their own pace instead of falling over.
- **Survive failures.** If the email provider is down, jobs wait in the queue and run when it is back.
- **Scale separately.** Add workers when the queue grows, without touching the web servers.

## Retries

Jobs fail: networks drop, partners time out. A good queue setup retries failed jobs:

- **Back off.** Wait longer after each failure: 1 second, then 2, 4, 8. Hitting a struggling service again at once makes it worse.
- **Limit attempts.** After, say, five failures, move the job to a **dead-letter queue** for a person to look at, instead of retrying for ever.

## At least once

Most queues promise **at-least-once** delivery: every message is delivered, but sometimes twice. A worker may finish the job and crash before it reports success, and the queue gives the job to another worker.

So jobs must be **idempotent**: running one twice gives the same result as running it once, the same idea as in [HTTP](/lesson/http).

- "Set order 8841's status to shipped" is idempotent.
- "Send a receipt" is not. Record that the receipt for order 8841 was sent, and check that record first.
- "Charge the card" must never run twice. Payment APIs accept an **idempotency key**, so a repeated request with the same key is ignored.

> **Pitfall.** "Exactly once" is very hard to promise across a network. Design every job to be safe to run twice.

## Watch the queue

A queue hides problems until it overflows. Watch its length and the age of the oldest message. A queue that keeps growing means the workers cannot keep up, or are failing.

## Remember

- Put slow work in a queue, answer at once, and let workers do it.
- Queues smooth peaks, survive outages and scale separately.
- Retry with back-off and a limit, then move to a dead-letter queue.
- Delivery is at least once, so make every job idempotent.

::quiz
? A worker sends an email, then crashes before it marks the job done. The job runs again. What prevents a second email?
+ The job records that the email was sent, and checks that record before sending
- The queue never redelivers
- A faster worker
! Queues deliver at least once. Idempotent jobs check whether their effect already happened.
? An email provider is down for an hour. What happens with a queue and retries?
- All emails are lost
+ Jobs wait and retry with back-off, then succeed when the provider returns
- The website stops taking orders
! The queue holds the work. The user-facing site keeps running while the jobs wait.
::end
