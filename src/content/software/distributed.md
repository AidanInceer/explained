---
minutes: 9
tech: []
refs:
  - ddia: Ch. 8, “The Trouble with Distributed Systems”, and Ch. 9, “Consistency and Consensus”
---
Once a system runs on more than one machine, a new kind of problem appears. Each machine can fail on its own, the network between them can drop or delay messages, and their clocks disagree. A **distributed system** must keep working, and stay correct, while some of its parts are broken in ways that it cannot even see clearly.

## Partial failure

On one computer, a program usually works or crashes. Across machines, a call to another service can:

- succeed,
- fail with an error,
- or simply get **no answer**.

No answer is the hard case. Did the request arrive? Did the other service do the work and the reply get lost? Is it just slow? From the caller's side, these look the same. So every call over a network needs a **timeout**, and the caller must decide what to do when it fires.

## Retries, carefully

Retrying a failed call is natural. Done carelessly, it causes harm:

- **Duplicates.** The first request may have worked. Retry only operations that are idempotent, or use an idempotency key, as in [Queues and background jobs](/lesson/queues).
- **Retry storms.** A struggling service gets slower. Every client retries, tripling the load, and it falls over completely. Use exponential **back-off** with random **jitter**, and a limit.
- **Cascades.** Service A waits on B, which waits on C. When C is slow, everything upstream fills with waiting requests. A **circuit breaker** stops calling a failing service for a while and fails fast instead.

::fig sw-backoff | 300 clients and a server that goes down. Compare three ways to retry.

## Clocks cannot be trusted

Each machine's clock drifts, and synchronisation over the network is only accurate to some milliseconds, sometimes much worse. So "which event happened first?" cannot be answered reliably by comparing timestamps from different machines.

> **Pitfall.** "Last write wins" by timestamp silently drops updates when clocks disagree. A write from a machine whose clock is a second behind loses to an older write from another.

Systems that need order use other tools: a single leader that assigns order, sequence numbers, or logical clocks.

## Consistency and replicas

Data is often copied to several machines for safety and speed. Copies take time to agree:

- **Strong consistency**: every read sees the latest write, as if there were one copy. Needs coordination, which costs speed, and during a network split some requests must be refused.
- **Eventual consistency**: copies agree in the end, if writes stop. Reads may be stale for a while. Faster and more available.

The **CAP theorem** states it in short: when the network splits, a system must choose between answering everyone (availability) and giving only up-to-date answers (consistency).

## Agreement

Some decisions must be made by exactly one machine: which server is the leader, who holds a lock. **Consensus** algorithms, such as Raft and Paxos, let a group agree even when some members fail. They are subtle, so use proven systems built on them, such as etcd, ZooKeeper or the database's own replication, rather than writing your own.

## Remember

- In a distributed system, parts fail independently, and "no answer" is ambiguous.
- Use timeouts, idempotent retries with back-off and jitter, and circuit breakers.
- Clocks on different machines disagree. Do not order events by timestamps alone.
- Copies can be strongly or eventually consistent. Use proven consensus systems.

::quiz
? A payment call times out. What do you know?
- The payment failed
- The payment succeeded
+ Nothing certain: it may or may not have happened
! A timeout says only that no answer arrived in time. Make the call idempotent and check its status before retrying.
? Why add random jitter to retry delays?
+ So that many clients do not all retry at the same moment and overload the service again
- To make the code harder to read
- Because clocks drift
! Clients that retry in step create waves of load. Random delays spread them out.
::end
