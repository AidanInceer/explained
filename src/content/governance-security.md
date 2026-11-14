---
title: Governance and security
summary: Know what data you hold, who can see it, and how long you keep it. Give each user and job the least access that works.
track: architecture
level: core
minutes: 8
at: [0, 4]
prereqs: [designing-for-failure]
tech: [catalog, clouds]
refs:
  - fode: Ch. 10, Security and Privacy
  - fode: Ch. 2, “Data Management” undercurrent
---
A data platform collects the most valuable and the most sensitive data of a company in one place. Governance and security are the controls on that data: who can find it, who can read it, and how it is kept safe. In *Fundamentals of Data Engineering* they are undercurrents. They apply at every stage, and they cannot be added at the end.

## Governance: can people find, understand and trust the data?

Data governance makes sure that data is usable, correct and used as permitted. For an engineer it comes down to practical questions about each table:

- **What is it?** A description of the table and of each column.
- **Who owns it?** A named team that answers questions and corrects problems.
- **Where is it from?** [Lineage](/lesson/observability-lineage).
- **Can it be trusted?** Tests, freshness, known limits.
- **How sensitive is it?** A classification.
- **How long is it kept?** A retention rule.

A **data catalog** is the tool that holds the answers: a searchable inventory of datasets with their metadata. A catalog is useful only if the metadata is collected automatically from the systems. Descriptions that people must type into a separate tool become out of date quickly. Put documentation next to the code that builds the table, and let the catalog read it.

## Classify the data

You cannot protect data if you do not know where the sensitive data is. Give each column a class. A simple set:

| Class | Examples | Typical control |
|---|---|---|
| Public | Product catalogue | None |
| Internal | Aggregated sales | All employees |
| Confidential | Individual salaries, contracts | Named groups only |
| Restricted | Health data, payment card numbers, identity numbers | Masked by default. Access is logged |

**PII**, personally identifiable information, is any data that can identify a person: a name, an email address, a phone number, a device id, and also combinations such as postcode with date of birth. Privacy laws such as the GDPR in Europe give people rights over this data, and those rights become engineering requirements:

- **The right to erasure.** You must be able to delete one person's data from every table, backup and file. This is difficult in an append-only lake. Design for it from the start. One method is to keep the personal data in one place and refer to it by a key. Another is crypto-shredding: encrypt each person's data with their own key and delete the key.
- **Purpose limitation.** Data that was collected for one purpose cannot be freely used for another.
- **Data minimisation.** Do not collect or keep what you do not need. The safest data is the data that you do not have.

## Security: the principles

**Least privilege.** Each user and each job gets the minimum access that it needs, and nothing more. A dashboard needs to read three tables. It does not need write access to the warehouse. Give access to roles and put people in roles. Do not give access to individuals. This is role-based access control, or RBAC.

**Defence in depth.** Do not depend on one control. Use network limits, authentication, authorisation, encryption and audit logs together, so that one failure does not expose everything.

**Encryption.** Encrypt data *in transit*, with TLS on each connection, and *at rest*, on disk. Cloud services do both with little work. Make sure that they are on.

**Secrets are not code.** Passwords and API keys must never be in a repository, a notebook or a log. Keep them in a secrets manager and read them when the job runs. A credential that has been committed to version control is compromised, even after the commit is removed. Replace it.

**People are the usual cause.** Most incidents are not advanced attacks. They are a storage bucket that was left public, a credential in a public repository, or a copy of production data on a laptop.

## Controls inside the warehouse

- **Column-level security.** Hide specific columns from specific roles.
- **Row-level security.** A regional manager sees only the rows of that region.
- **Dynamic masking.** The same query returns `ana@site.example` to one role and `a**@****.example` to another.
- **Pseudonymisation.** Replace an identifier with a consistent token, such as a keyed hash. Analysts can still count and join by customer, and they cannot see who the customer is. This is weaker than anonymisation, because the original can be recovered with the key.
- **Audit logs.** A record of who queried what. They are necessary in an investigation and often required by regulation.

Apply masking as early as possible in the pipeline. If the raw layer holds unmasked personal data, limit access to that layer to the pipelines themselves.

> **Pitfall.** A copy of production data in a development environment is a common leak. Development and test environments usually have weaker controls. Use synthetic data or masked samples.

## Remember

- Governance: each table has a description, an owner, a classification and a retention rule, and people can find them in a catalog.
- Security: least privilege through roles, encryption in transit and at rest, and secrets kept out of code.
- Privacy rights such as erasure are design requirements. Plan for them before you store the data.

::quiz
? A reporting job needs to read two tables. What access must its service account have?
- Administrator access, to prevent permission errors
+ Read access to those two tables only
- Read access to the full warehouse
! Least privilege. If the credential leaks, the damage is limited to what the job needed.
? An API key was committed to a repository by mistake and removed in the next commit. What must be done?
- Nothing. The key is removed
+ Replace the key. It is in the repository history and must be considered compromised
- Make the repository private
! Version control keeps history. Each copy of the repository still contains the key.
? Analysts must count the orders of each customer and must not see who the customers are. Which control is suitable?
+ Pseudonymisation of the customer identifier
- Row-level security
- Deleting the customer column
! A consistent token keeps the ability to group and join, and hides the identity. If the column is deleted, the count by customer is not possible.
::end
