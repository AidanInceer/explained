---
minutes: 9
tech: []
refs:
  - microservices: Whole essay, especially “Are Microservices the Future?”
  - ddd: Ch. 14, “Maintaining Model Integrity”, on bounded contexts as boundaries
---
A system can be one program, deployed as a whole: a **monolith**. Or it can be many small programs that talk over the network: **services**, or **microservices**. This is one of the most debated choices in software. The honest answer is that each line you draw between services has a real cost, and is worth it only when it buys something specific.

## The monolith

One codebase, one deploy, usually one database.

- **Simple to build, test and deploy.** A function call is fast and never times out.
- **Easy to change across boundaries.** Rename something and the compiler finds every use.
- **Transactions across the whole system** in one database.
- **Harder at scale of team.** With dozens of developers, everyone deploys the same thing, builds get slow, and one bad change can break everything.

A **modular monolith** keeps one deploy but enforces strong module boundaries inside, as in [Modules and interfaces](/lesson/modules-interfaces). It keeps most of the simplicity, and is easy to split later along those boundaries.

## Services

Each service owns one part of the business and its own data, and others call it through an API.

- **Teams work independently**: each owns, deploys and scales its service on its own schedule.
- **Scale and choose technology per service.**
- **Failures can be contained**, if designed for.

And the costs:

- **Every call is a network call**, with latency and all the failures of [Distributed systems basics](/lesson/distributed).
- **No transactions across services.** Keeping data consistent needs extra patterns.
- **Operations multiply**: many deployments, many dashboards, tracing a request across services, versioning APIs between teams.
- **Wrong boundaries are expensive.** If two services must always change together, you have a distributed monolith: all of the costs, none of the benefits.

## Where to draw the lines

Draw service boundaries where the business has natural seams: the **bounded contexts** of [Modelling the domain](/lesson/domain-modelling). Payments, catalogue and shipping change for different reasons and can be owned by different teams. "The database layer" or "the validation service" are technical layers, not business seams, and make poor services.

> **Rule of thumb.** Start with a well-structured monolith. Split out a service when you have a concrete reason: a team that needs to deploy independently, a part with very different scale, or a part with different security needs.

## Conway's law

Systems tend to mirror the communication structure of the organisation that builds them. Three teams build three services, whether or not the problem has three parts. Use this on purpose: shape teams around the business areas you want the architecture to follow.

## Remember

- A monolith is simple to build, change and run. A modular monolith keeps it organised.
- Services give independent teams and deploys, at the cost of network calls, lost transactions and more operations.
- Draw service lines along business seams, not technical layers.
- Start with a modular monolith; split for a concrete reason.

::quiz
? Every feature requires changing and deploying the same four services together. What has happened?
+ A distributed monolith: the boundaries do not match how the system changes
- A good microservice design
- A modular monolith
! Services that always change together pay the network costs without the independence.
? A five-person startup is building its first product. What is usually the best architecture?
+ A well-structured monolith
- Twenty microservices
- One service per developer
! A small team gains little from service boundaries and pays all their costs.
::end
