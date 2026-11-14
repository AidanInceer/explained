A pipeline connects to many systems: a source database, an API, object storage, a warehouse. Each connection needs proof of identity. How that proof is stored and what it permits is a large part of the security of a data platform. A leaked credential of a pipeline is often worse than a leaked credential of a person, because the pipeline can read everything.

## Two questions: who are you, and what may you do

- **Authentication** proves an identity: this request really comes from the nightly load job.
- **Authorisation** decides what that identity may do: it can read `raw.orders` and write `staging.orders`, and nothing else.

Most leaks are failures of the first. Most of the damage they cause is decided by the second.

## Kinds of credential, from worst to best

| Kind | Example | Problem |
|---|---|---|
| **A person’s password** in a pipeline | Ana’s database login in a script | It stops working when Ana leaves, and it has all of Ana’s rights |
| **A long-lived key** | An API key or cloud access key in a configuration file | It is valid until someone revokes it. If it leaks, it works for the attacker for months |
| **A key in a secrets manager** | The same key, read at run time | Much better. It is not in the code, access to it is logged, and it can be rotated |
| **Short-lived credentials from an identity** | The job runs as a cloud role and gets a token that is valid for one hour | Nothing to steal that lasts. Nothing to rotate |

Aim for the last row wherever the systems support it.

## Workload identity

In a [cloud](/lesson/cloud-basics), a job can **be** an identity. A virtual machine, a container or a function runs as a **role** or **service account**. When the code asks for access to a bucket, the platform supplies a temporary token for that role. There is no password in any file.

The same idea connects systems of different vendors. A CI job in GitHub or GitLab can exchange its own signed identity token for a short-lived cloud role (**OIDC federation**), so that the CI system holds no cloud keys.

Use **one identity for each pipeline or job**, not one for the whole platform. Then each can have exactly the rights it needs, the audit log shows which job did what, and a leak affects one job.

## Secrets managers

Some credentials cannot be replaced by an identity: the API key of a SaaS tool, the password of an old database. They go into a **secrets manager**: AWS Secrets Manager, Google Secret Manager, Azure Key Vault, HashiCorp Vault.

- The pipeline reads the secret **at run time**, by name.
- Access to each secret is limited to the roles that need it.
- Each read is logged.
- The secret can be **rotated** in one place, and no code changes.

Orchestrators have a place for connections. Configure it to read from the secrets manager, so that the orchestrator’s own database does not become a second store of passwords.

## Where secrets must never be

- In **code**, also not “for now”.
- In **Git history**. To delete the line in a later commit does not remove it. A secret that was pushed is compromised and must be rotated.
- In **container images**, notebooks and shared documents.
- In **logs**. A debug line that prints the connection string writes the password into the log system.
- In **URLs**, where proxies and logs record them.
- In **chat messages** and tickets.
- In a prompt to an external [AI service](/lesson/ai-for-data-engineering).

Automatic **secret scanning** in the repository and in CI finds most accidents. A pre-commit hook finds them before they leave the laptop.

## Least privilege, in practice

Give each identity the smallest set of rights that lets it work.

| Identity | Needs | Does not need |
|---|---|---|
| Ingestion job for orders | Read on the source replica. Write to `raw.orders` | Any other table. Delete rights |
| dbt in production | Read on raw. Write to staging and marts | Rights to create users. Access to other projects |
| dbt in CI | Read on production. Write to its own temporary schema | Write to production |
| BI tool | Read on marts | Raw data. Write on anything |
| An analyst | Read on marts, with sensitive columns masked | Raw personal data |
| An [AI agent](/lesson/ai-for-data-engineering) | Write on a development schema. Read where needed | Production write. Drop rights |

Three practical rules:

1. **Grant to roles, not to people.** A person gets rights by being a member of a role. When they change team, change the membership.
2. **Separate read from write, and production from the rest.**
3. **Define access as code.** Grants are in [version control](/lesson/environments-iac), and a request for access is a pull request. You can then see who has what, and why.

Start with too little and add when a job fails. The reverse, to start wide and reduce later, does not occur in practice.

## People

- **Single sign-on** with multi-factor authentication for every tool. No local passwords.
- **No shared accounts.** “The admin login that we all use” removes the audit record.
- **Temporary elevation.** For rare tasks that need high rights, give them for an hour with a reason, not for all time.
- **Offboarding.** When someone leaves, their access ends on the same day. This is automatic if access comes only from the identity provider.

## Rotation

A credential that never changes has had years in which to leak. Rotate long-lived secrets on a schedule, and immediately when a person with access leaves or a leak is suspected.

Rotation is safe only if you have practised it. If nobody knows which pipelines use a key, nobody dares to change it. This is one more reason to prefer short-lived credentials, which rotate themselves.

## Network, as a second layer

Identity is the first control. The network is the second.

- Databases and warehouses do not accept connections from the whole internet. Limit them to known networks or use **private endpoints**.
- Pipelines reach sources over a private connection where possible.
- Data is **encrypted in transit** (TLS) and **at rest**. The clouds do the second by default. Check that the first is required.

## When a secret leaks

Speed matters more than certainty.

1. **Revoke or rotate** it at once. Do not first investigate if it was used.
2. **Look at the logs** for use of the credential from unknown places.
3. **Find how it leaked**, and close that path.
4. **Tell** the security team, as your company’s process requires.
5. Treat it as an [incident](/lesson/incidents-reliability), with a review and no blame. People report fast when reporting is safe.

## A checklist for a new pipeline

- It runs as its own role, not as a person.
- That role has the minimum rights, defined as code.
- No secret is in the repository, the image or the logs.
- Secrets that must exist are in the secrets manager.
- CI has no long-lived cloud keys.
- Production data cannot be written from a laptop.

> **Pitfall.** One service account with administrator rights for all pipelines, “to keep it simple”. Any defect or leak in any pipeline now has access to everything.

> **Pitfall.** A `.env` file with real credentials, committed by accident. Add it to `.gitignore` on the first day, and use the scanning tools.

## Remember

- Authentication proves who. Authorisation decides what.
- Prefer short-lived credentials from a workload identity to stored keys.
- Secrets that must exist are in a secrets manager, read at run time, and rotated.
- One identity for each job, with the least rights, granted to roles and defined as code.
- A leaked secret is rotated first and investigated second.

::quiz
? A cloud access key was committed to a repository and removed in the next commit one minute later. What must you do?
+ Rotate the key at once, because it is still in the Git history and may have been copied
- Nothing, because it was removed
- Delete the repository
! History keeps the key, and automatic scanners find pushed keys in minutes. Only a new key makes the old one useless.
::end
