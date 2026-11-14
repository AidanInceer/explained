Data mesh is different from the other subjects on this map. It is not a technology. It is a proposal for how to organise the *people and ownership* around data in a large company. Zhamak Dehghani described it in 2019.

## The problem that it addresses

The usual design has one central data team. That team ingests the data of every department into one warehouse or lake, models it, and serves every consumer.

When a company grows, this has three weaknesses:

1. **The central team becomes a bottleneck.** Each new source and each new question goes into one queue.
2. **The central team does not know the domain.** The engineers who model the payments data did not build the payments system. They guess what the fields mean, and some guesses are wrong.
3. **The producers have no responsibility for the data.** The payments team releases a change, the pipeline of the central team fails, and the payments team does not know. The team that causes the problem and the team that has it are different teams.

This is the same scaling problem that a monolithic application had, and data mesh applies the same solution that microservices did: divide by business domain, and give each part an owner.

## The four principles

**1. Domain ownership.** The team that knows the data best owns its analytic data. The payments domain publishes the payments datasets. The logistics domain publishes the shipments datasets. Responsibility moves to the place where the knowledge is.

**2. Data as a product.** A domain does not make its tables available and stop there. It treats each dataset as a product that has users. A **data product** must be:

- **Discoverable**: it is in the catalog.
- **Understandable**: documented, with a clear meaning.
- **Trustworthy**: with published quality and freshness guarantees.
- **Addressable and interoperable**: a stable interface and shared identifiers, so that it can be joined with the products of other domains.
- **Secure**: with access control.

Each product has a named owner who is responsible for its quality. A [data contract](/lesson/observability-lineage) is the usual way to specify the interface.

**3. A self-serve data platform.** If each domain had to build its own infrastructure, the cost would be very large and each would do it differently. So a central platform team provides the tools as a service: storage, pipelines, orchestration, a catalog, monitoring. The platform team builds the *tools*. The domains build the *data products* with those tools.

**4. Federated computational governance.** Some rules must be global for the products to work together: how a customer is identified, how personal data is classified and protected, what metadata each product must have. A group with members from the domains and the platform sets these rules. "Computational" means that the platform enforces them automatically. They are not left to manual review.

The four principles depend on each other. Domain ownership without a platform gives duplicated work. Ownership without shared governance gives silos that cannot be joined. Dehghani says clearly that they are one set.

## What it is not

- **It is not a product.** A vendor cannot sell you a data mesh. A lakehouse or a warehouse can be the platform under one.
- **It is not "each team does what it wants".** Without the platform and the governance, decentralisation gives the silos that warehouses were built to remove.
- **It is not only for one architecture.** The domains can share one warehouse, each in its own area. The change is in ownership, not in the number of databases.

## When it is suitable

Data mesh solves a problem of organisational scale, and it adds cost. Each domain needs people with data skills, and someone must build and operate the platform.

| Situation | Is data mesh a good choice? |
|---|---|
| One data team of five people in a company of 200 | No. The central team is not yet the bottleneck |
| Many business units, a central team with a queue of months, incidents caused by upstream changes | Possibly. This is the problem that it was designed for |
| Domain teams with no engineers and no interest in owning data | Not yet. Ownership cannot be assigned to a team that cannot do the work |

Many companies take parts of it without the full change. Two parts are useful at almost any size: **name an owner for each important dataset**, and **treat shared datasets as products** with documentation and guarantees.

> **From the community.** Opinion on r/dataengineering about data mesh is divided. The common criticism is that companies used the name and did not make the organisational change, and got more silos. The common point in its favour is that the ideas of product thinking and domain ownership are sound, also in small teams, and do not need a full mesh.

## Remember

- Data mesh is a change in organisation and ownership. It is not a tool.
- Four principles: domain ownership, data as a product, a self-serve platform, and federated computational governance.
- It is for a problem of large organisations. Owners and product thinking are useful at any size.

::quiz
? Which problem is data mesh designed to solve?
- Slow queries on large tables
+ A central data team that is a bottleneck and does not know the domains
- A high cost of storage
! It is an answer to organisational scale: too many sources and consumers for one team, and ownership that is far from the knowledge.
? A company gives each domain team ownership of its data and does not build a shared platform or shared rules. What is the probable result?
+ Duplicated work, and datasets that cannot be joined
- A data mesh that works
- Lower costs
! The four principles depend on each other. The platform prevents duplicated infrastructure, and federated governance keeps the products interoperable.
::end
