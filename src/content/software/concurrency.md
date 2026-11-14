---
minutes: 9
tech: []
refs:
  - ostep: 'Ch. 26, “Concurrency: An Introduction”, Ch. 28, “Locks”, and Ch. 32, “Common Concurrency Problems”'
  - ddia: Ch. 7, “Transactions”, on race conditions
---
A web server answers many users at the same time. An app downloads a file and still responds to taps. Doing several things at once is **concurrency**. It makes programs faster and more responsive, and it adds a kind of bug that appears only sometimes, which makes it hard to find.

## Concurrency and parallelism

Two words are often mixed up.

- **Concurrency**: several tasks are in progress at the same time. They may take turns on one core.
- **Parallelism**: several tasks run at exactly the same moment, on different cores.

A program can be concurrent on a single core: while one task waits for the network, another runs. Parallelism needs several cores, and helps only when the work is CPU-heavy.

## Threads

A **thread** is one sequence of instructions inside a process. A process can have many threads. They share the same memory, so they can work on the same data with no copying.

That sharing is both the strength and the danger. Two threads can change the same value at the same time.

## A race condition

Take a counter of page views, and two threads that each add 1:

```
views = views + 1
```

This looks like one step. It is three: read `views`, add 1, write the result back. Now suppose `views` is 10:

1. Thread A reads 10.
2. Thread B reads 10.
3. Thread A writes 11.
4. Thread B writes 11.

Two views happened. The counter shows one more. This is a **race condition**: the result depends on the exact timing of the threads. It may happen once in a million runs, never in tests, and often in production under load.

## Locks

A **lock** (or **mutex**, for "mutual exclusion") lets only one thread at a time run a piece of code. A thread takes the lock, reads and writes the counter, and gives the lock back. The other thread waits.

Locks fix races and bring new problems:

- **Slower.** Threads wait for each other, so the locked part runs one at a time.
- **Deadlock.** Thread A holds lock 1 and waits for lock 2. Thread B holds lock 2 and waits for lock 1. Both wait for ever.

> **Rule of thumb.** Always take locks in the same order in every part of the program. This one rule removes the most common cause of deadlock.

## Ways to share less

The safest shared data is data that is not shared.

- **Message passing.** Threads do not touch the same values. They send each other messages, often through a queue. Go's channels and the actor model work like this.
- **Immutable data.** A value that never changes can be read by any number of threads safely.
- **Atomic operations.** The hardware can add 1 to a number as one step that cannot be split. Many languages offer these for counters.

## Async: one thread, many waits

Much of a server's time is waiting: for the database, for another service. **Asynchronous** code (`async` and `await` in JavaScript, Python, C# and Rust) lets one thread start a request, do other work while it waits, and come back when the answer arrives. There are fewer threads and fewer locks, but a long calculation still blocks everything else on that thread.

## Remember

- Concurrency is many tasks in progress. Parallelism is many tasks at the same instant.
- Threads share memory, so two threads can change the same value at once.
- A race condition is a result that depends on timing. Locks prevent it and can deadlock.
- Share less: messages, immutable values, atomic operations, async code.

::quiz
? Two threads each run `total = total + 5` 1,000 times, with no lock. The final total is sometimes less than 10,000. Why?
- The CPU adds numbers wrongly under load
+ Both threads read the same old value, and one write overwrites the other
- 5 cannot be stored exactly as a number
! The statement is read, add, write. When the threads overlap, one update is lost. A lock or an atomic add fixes it.
? A server spends most of each request waiting for the database. What helps most?
+ Concurrency: handle other requests while one waits
- A CPU with a higher clock rate
- More locks
! The CPU is idle while it waits. Async code or more threads let it serve other requests in that time.
::end
