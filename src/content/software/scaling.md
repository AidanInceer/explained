---
minutes: 9
tech: []
refs:
  - ddia: Ch. 1, “Reliable, Scalable, and Maintainable Applications”, and Ch. 6, “Partitioning”
  - twelve: VI, “Processes”, and VIII, “Concurrency”
---
A service that handles 100 users may fall over at 100,000. **Scaling** is how you add capacity as load grows. The usual path is well worn: make the servers interchangeable, put several behind a load balancer, and then deal with the part that is hard to copy, the database.

## Up or out

- **Scale up** (vertical): a bigger machine with more CPU and memory. Simple, no code changes, and it has a ceiling and a high price at the top end.
- **Scale out** (horizontal): more machines of the same size. No ceiling in principle, and it needs the application to run as many copies.

Start by scaling up; it is cheap in effort. Design so that you *can* scale out when you need to.

## Stateless servers

To run many copies of the web server, any copy must be able to answer any request. So the server must be **stateless**: it keeps nothing about a user in its own memory between requests.

- Sessions go in a shared store, such as Redis or the database, or in a signed token.
- Uploaded files go to object storage, not the server's disk.
- Caches go in a shared cache, or are fine to lose.

Then you can add, remove or restart servers freely. A server that crashes loses nothing.

## Load balancers

A **load balancer** receives all traffic and spreads it over the servers. It checks each server's health and stops sending to one that fails. It is also where HTTPS often ends, and where you can add servers during a deploy without users noticing.

Cloud platforms can **autoscale**: add servers when the CPU or request count is high, and remove them when it falls.

## The database is the hard part

Web servers are easy to copy. The database holds the one true copy of the data, so it is the usual bottleneck. In order of effort:

1. **Make queries cheaper.** Indexes, fewer queries, no N+1, as in [Databases for applications](/lesson/app-databases). This often buys a factor of ten.
2. **Cache** reads that can be a little stale, as in [Caching](/lesson/caching).
3. **Read replicas.** Copies of the database that serve reads. Writes still go to one primary. Replicas lag a little behind, so a user may not see their own change at once.
4. **Move slow work out** of the request, into [queues](/lesson/queues).
5. **Partition** (or **shard**) the data: split it across several databases by a key, such as customer id. Each holds part of the data. This is powerful and complex: queries across shards are hard, and choosing the key is a big decision.

> **Rule of thumb.** A single well-tuned database server handles far more than most products ever need. Measure before you shard.

## Find the bottleneck

Scaling the wrong part wastes money. Measure: where do requests spend their time? The CPU, the database, a slow partner API? Fix the slowest part, measure again, and repeat.

::fig sw-load | Add load or add servers, and watch the response time.

## Remember

- Scale up first. Design so you can scale out.
- Stateless servers can be copied freely behind a load balancer.
- The database is usually the bottleneck: tune, cache, replicate, queue, then shard.
- Measure to find the real bottleneck before you add capacity.

::quiz
? Users are randomly signed out after a second web server is added. What is the likely cause?
+ Sessions are stored in each server's memory, so the other server does not know them
- The load balancer is too slow
- The database is full
! Servers must be stateless. Store sessions in a shared store or a signed token.
? A database is slow under load. What should you usually try first?
+ Find the slow queries and add indexes or remove repeated queries
- Shard the database across ten servers
- Rewrite the app in another language
! Cheaper queries often give a large gain for little effort. Sharding adds lasting complexity.
::end
