---
title: Environments and infrastructure as code
summary: Development, staging and production are separate copies of the platform. Describe them in code so that they stay the same and can be rebuilt.
track: ops
level: core
minutes: 8
at: [1, 0]
prereqs: [sdlc]
tech: [iac, vcs, ci]
refs:
  - fode: Ch. 2, “Infrastructure as code”, “Pipelines as code”
  - accelerate: Ch. 4, technical practices
---
You must be able to change a pipeline without a risk to the data that people use. For that, the change needs a place to run that is not production. Such a place is an **environment**.

## The usual environments

| Environment | Purpose | Data | Who writes |
|---|---|---|---|
| **Development** | An engineer builds and tries a change | A sample, or a private copy | Each engineer, in their own space |
| **Staging** (or test, CI) | The change runs with the rest of the system, automatically | Like production, often a recent copy or a subset | The CI pipeline |
| **Production** | The real thing that users read | Real | Only the deployment pipeline |

The rule that gives environments their value: **the same code runs in each one**. Only configuration differs: the names of databases, the credentials, the sizes of machines. If production has code that staging does not, the test in staging proves nothing.

## What an environment is, for data

For an application, an environment is a set of servers. For data it is also a set of **tables**.

In a warehouse the common design gives each environment its own database or schema:

```
analytics_prod.marts.fct_orders        -- production
analytics_ci_pr_482.marts.fct_orders   -- built by CI for pull request 482
analytics_dev_ana.marts.fct_orders     -- Ana's development copy
```

The transformation tool builds into the schema that the configuration names. In dbt this is the **target**. The SQL is identical.

Development with production-size data is slow and costly. There are three ways to reduce it:

- **Sample**: build only the last few days in development.
- **Defer**: build only the models you changed, and read the others from production. dbt calls this `--defer`.
- **Zero-copy clones**: Snowflake, BigQuery, Databricks and the [table formats](/lesson/table-formats) can make a copy of a table that shares the stored files until one of them changes. A clone of a terabyte takes seconds and costs nearly nothing.

**Personal data** needs care. If development holds a copy of production, each developer can see each customer. Mask or replace the sensitive columns in environments outside production.

## Infrastructure as code

A platform consists of resources: buckets, warehouses, roles, permissions, clusters, networks, schedules. You can create them by hand in the web console of the cloud. Then nobody knows what exists or why, staging differs from production in unknown ways, and to build it again after an accident takes weeks.

**Infrastructure as code** (IaC) describes the resources in files in version control. A tool compares the files with what exists and makes the changes.

```hcl
resource "google_bigquery_dataset" "marts" {
  dataset_id = "marts_${var.env}"
  location   = "EU"
}

resource "google_bigquery_dataset_iam_member" "analysts_read" {
  dataset_id = google_bigquery_dataset.marts.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "group:analysts@example.com"
}
```

With `env = "staging"` and `env = "prod"` the same file makes two environments that are the same.

The gains are the same as for all code in Git: review of each change, a history, a way back, and the ability to create a full environment with one command.

| Tool | Notes |
|---|---|
| **Terraform**, **OpenTofu** | The most common. Works with every cloud and with many data products such as Snowflake and Databricks |
| **Pulumi** | The same idea in Python or TypeScript |
| **CloudFormation**, **Bicep** | For AWS and for Azure only |
| **Kubernetes manifests**, **Helm** | For workloads on Kubernetes |

Two terms to know. The definition is **declarative**: you describe the result, not the steps. The tool keeps a **state** file of what it created, and that file must be stored safely and shared.

## Containers

A **container** packs a program with its libraries and system files into an image. The image runs the same on a laptop, in CI and in production. This removes the “it works on my machine” problem.

For data work, containers hold pipeline code, orchestrator tasks and custom connectors. **Docker** builds and runs them. **Kubernetes** runs many containers across many machines, and it is a large system to operate. A small team can run containers on a managed service (Cloud Run, ECS, Azure Container Apps) with no cluster of its own.

## Pipelines as code, configuration as data

The same principle extends to everything:

- [Orchestrator](/lesson/orchestration) schedules and dependencies are code, not clicks in a web form.
- Permissions are code. A request for access is a pull request.
- Dashboards and metric definitions can be code in several BI tools.

Configuration that differs between environments comes from variables. **Secrets**, such as passwords and API keys, come from a secrets manager (AWS Secrets Manager, Google Secret Manager, Azure Key Vault, HashiCorp Vault) at run time. They are never in the repository and never in an image.

> **Pitfall.** A correction made by hand in production. It works, nobody records it, and the next deployment removes it. If a manual change is necessary in an emergency, put it in the code in the same hour.

> **Pitfall.** Staging that is not like production. Smaller data hides performance problems. Cleaner data hides quality problems. Staging does not have to be the same size, but it must have the same structure and realistic bad cases.

> **Pitfall.** Shared development tables. Two engineers who build into one schema overwrite each other and cannot tell whose change caused a difference.

## Remember

- Development, staging and production run the same code with different configuration.
- A data environment is a set of tables. Clones, samples and deferral keep them low in cost.
- Describe infrastructure in code, so that it is reviewed, repeatable and can be built again.
- Containers make the run-time the same in each place.
- Secrets come from a secrets manager.

::quiz
? What is the main rule that makes a staging environment useful?
+ It runs the same code as production, with only configuration different
- It has more data than production
- Only managers can use it
! A test in staging says something about production only if the code is the same.
::end
