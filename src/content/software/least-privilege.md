---
minutes: 7
tech: []
refs:
  - seceng: Ch. 6, “Access Control”
  - owasp: A01, “Broken Access Control”
---
Give each person, program and key **only the access it needs** to do its job, and no more. This is the **principle of least privilege**. It does not stop every attack. It limits what an attacker can do after one succeeds, which is often the difference between an incident and a disaster.

## Why it matters

Something will be compromised one day: a laptop, a password, a package, a service with a bug. What happens next depends on what that thing could reach.

- A reporting service with read-only access to two tables leaks two tables.
- The same service connected as the database owner can read, change or delete everything.

The breach is the same; the damage is not.

## For services

- **Separate credentials** for each service, as [Secrets and keys](/lesson/secrets) explained. One shared admin password means every service is the admin.
- **Narrow database permissions**: the web app may read and write its own tables; the reporting job may only read; neither may drop tables or change the schema. Migrations run with a separate, stronger account.
- **Narrow cloud permissions**: a service that uploads to one storage bucket gets "write to this bucket", not "full access to storage".
- **Network rules**: the database accepts connections only from the services that need it, not from the whole internet.

## For people

- Day-to-day accounts have normal rights. **Admin access** is separate, used only when needed, and ideally granted for a short time with a reason recorded.
- Remove access when people change roles or leave. Review who has what regularly.
- Production data should not be on laptops. Developers get test data, or access through tools that log what they see.

## For code

- A function that formats a date does not need the network. A plugin should not get the whole application's permissions.
- Containers and processes should not run as the system's root user.
- Phone apps should ask only for the device permissions they use, as in [Background work and notifications](/lesson/background-work).

> **Rule of thumb.** Start from nothing and add the permissions that fail. Starting from everything and removing them never finishes.

## The cost

Least privilege takes work: more roles, more accounts, more requests for access. Too much friction, and people find ways round it, such as sharing one powerful account. Make the right path easy: templates for service permissions, quick and logged ways to get temporary access.

## Remember

- Give each person, service and key only the access its job needs.
- It limits the damage of a breach that will happen one day.
- Separate credentials, narrow database and cloud permissions, network limits.
- Make temporary, logged access easy so people do not work around the rules.

::quiz
? A reporting job connects to the database as the owner account. What is the risk?
+ If the job is compromised, the attacker can change or delete all data
- Reports will be slower
- None, if the password is strong
! A read-only account for reporting limits what a compromised job can do.
? What is the safer way to set permissions for a new service?
+ Start with none, and add each one that it really needs
- Start with full access and remove some later
- Copy another service's permissions
! Granting from nothing gives exactly what is needed. Removing from everything tends to leave too much.
::end
