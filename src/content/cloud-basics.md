---
title: Cloud basics
summary: A cloud is rented compute, storage and network, with an identity system in front. Four ideas explain most of the bill and most of the access errors.
track: foundations
level: core
minutes: 9
at: [3, 2]
prereqs: [lifecycle]
tech: [clouds, object, iac]
refs:
  - fode: Ch. 4, “Location”, “Cost optimization”
  - fode: Ch. 6, Storage
---
Nearly all new data platforms run in a cloud: Amazon Web Services (AWS), Google Cloud or Microsoft Azure. You do not need to be a cloud architect. You do need four ideas, because they explain most of the bill and most of the “access denied” errors.

## 1. You rent three things

| Resource | What it is | How you pay | Data engineering use |
|---|---|---|---|
| **Compute** | Processors and memory, as virtual machines, containers or “serverless” functions | For the time it runs, or for each request | Run pipelines, queries and clusters |
| **Storage** | Disks, and [object storage](/lesson/object-storage) | For each gigabyte each month, and for each request | Keep the data |
| **Network** | Connections between resources, and to the internet | For data that leaves a region or the cloud (egress) | Move data between systems |

The most important property is that **compute and storage are separate**. You can stop all the machines and the data is still there, and you pay only for storage. This is the base of every modern platform.

## 2. Managed services: how much you operate yourself

The same job can be done at several levels.

| Level | You manage | Example |
|---|---|---|
| Virtual machine | The operating system, the software, the scaling | Postgres that you install on a machine |
| Managed service | Configuration and size | Amazon RDS for Postgres, a managed Kafka |
| Serverless | Nearly nothing. It scales to zero and up | BigQuery, AWS Lambda, Snowflake |

Higher levels cost more for each unit of work and need fewer people. For a small team, the people are the larger cost. The lesson on [choosing a stack](/lesson/choosing-a-stack) uses this.

## 3. Identity and access management (IAM)

Every action in a cloud is a request by an **identity**, and a **policy** decides if it is permitted.

- A **user** is a person.
- A **role** or **service account** is an identity for a program. A pipeline runs as a role.
- A **policy** says which actions are permitted on which resources: “this role can read objects under `raw/orders/` in this bucket”.

The rule is **least privilege**: give each identity only what it needs. When a pipeline fails with “access denied”, the question is always the same: which identity made the request, and which policy on which resource does not permit it? The lesson on [secrets and access](/lesson/secrets-access) continues this.

## 4. Regions and zones

A **region** is a geographic area, such as Frankfurt or Northern Virginia. Each region has several **availability zones**, which are separate data centres.

Three consequences:

- **Put compute next to the data.** A query engine in one region that reads a bucket in another is slow, and you pay egress for each byte.
- **Laws can fix the region.** Personal data of European residents is often required to stay in the European Union.
- **Zones give resilience.** Managed services usually copy data across zones for you. Copies across regions are your decision, and they double the cost.

## The same parts on each cloud

The names differ. The parts are the same.

| Part | AWS | Google Cloud | Azure |
|---|---|---|---|
| Object storage | S3 | Cloud Storage | Blob Storage, ADLS |
| Virtual machines | EC2 | Compute Engine | Virtual Machines |
| Serverless functions | Lambda | Cloud Run functions | Functions |
| Containers | ECS, EKS | Cloud Run, GKE | Container Apps, AKS |
| Relational database | RDS, Aurora | Cloud SQL, AlloyDB | Azure SQL |
| Warehouse | Redshift | BigQuery | Fabric, Synapse |
| Event stream | Kinesis, MSK | Pub/Sub | Event Hubs |
| Spark | EMR, Glue | Dataproc | Fabric, HDInsight |
| Orchestration | MWAA, Step Functions | Cloud Composer | Data Factory |
| Identity | IAM | IAM | Entra ID, RBAC |
| Secrets | Secrets Manager | Secret Manager | Key Vault |

Snowflake and Databricks run on all three and add their own layer.

If you learn one cloud well, the second takes weeks, not months. Choose the one your employer uses.

## What a bill is made of

Most surprises on a bill have one of four causes:

1. **Compute that runs with nothing to do**: a cluster or warehouse that was not stopped.
2. **Scans of more data than needed**: a query with no partition filter.
3. **Egress**: data that crosses regions or leaves the cloud.
4. **Many small requests**: millions of small files, or a function called for each row.

Each cloud has a cost explorer and **budgets with alerts**. Set an alert in the first week. The lesson on [cost and performance](/lesson/cost-performance) covers the rest.

## How to start without a large bill

All three clouds have a free tier. A beginner can load a few files into object storage, query them with the serverless SQL engine, and schedule one small job, for close to nothing. Set a budget alert first, and delete what you create.

> **Pitfall.** Access keys in code. A key pushed to a public repository is found by automatic scanners in minutes and used to start machines on your account. Use roles, and never write a key into a file.

> **Pitfall.** Everything in the console by hand. It is the fastest way to learn and the worst way to operate. When you know what you want, describe it with [infrastructure as code](/lesson/environments-iac).

## Remember

- You rent compute, storage and network. Compute and storage are separate.
- Managed and serverless services cost more for each unit and need fewer people.
- Every action is an identity plus a policy. Give the least access that works.
- Keep compute in the same region as the data.
- Set a budget alert before anything else.

::quiz
? A pipeline role can list a bucket but fails with “access denied” when it reads a file. Where do you look?
+ At the policy for that role: it permits the list action and not the read action on those objects
- At the size of the virtual machine
- At the region of the bucket
! Access is decided for each action on each resource. List and read are separate permissions.
::end
