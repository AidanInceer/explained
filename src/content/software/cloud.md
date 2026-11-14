---
minutes: 8
tech: []
refs:
  - nistcloud: Section 2, “The NIST Definition of Cloud Computing”
  - sre: Ch. 1, “Introduction”
---
Not long ago, running a service meant buying servers, waiting weeks for delivery, and paying for a room to keep them in. **Cloud computing** lets you rent computers, storage and networks by the hour or by the request, start them in minutes, and give them back when you are done. Amazon Web Services, Microsoft Azure and Google Cloud are the largest providers.

## What you rent

The services fall into a few families:

- **Compute**: virtual machines, containers, and **functions** that run your code only when a request arrives.
- **Storage**: **object storage** for files of any size (Amazon S3 and similar), block disks for virtual machines, and archives for data you rarely read.
- **Databases**: managed PostgreSQL, MySQL and others, where the provider handles backups, updates and failover.
- **Networking**: private networks, load balancers, DNS and CDNs.
- **Everything else**: queues, identity, monitoring, machine learning, email.

## Who does what

The more the provider manages, the less you control and the less you must do:

| Model | You manage | Example |
|---|---|---|
| Infrastructure as a service (IaaS) | Operating system, runtime, app, data | A virtual machine |
| Platform as a service (PaaS) | Your app and data | A managed app platform or container service |
| Function as a service | Your functions | AWS Lambda, Google Cloud Run functions |
| Software as a service (SaaS) | Your data and settings | Email, CRM |

For a small team, managed services are usually the right default: a managed database is far less work than running one yourself.

## Regions and zones

Providers run data centres in many **regions** around the world. Each region has several **availability zones**: separate buildings with their own power and network. Running copies of your service in two zones keeps it up when one building fails. Choose regions close to your users, and where the law requires their data to be stored.

## What changes

- **Capacity on demand.** Add servers for a busy day and remove them after, as in [Scaling a service](/lesson/scaling).
- **Pay for use.** No large upfront cost, but a bill that grows quietly if nobody watches it. The lesson on cloud cost covers this.
- **Shared responsibility.** The provider secures the buildings, hardware and its services. You secure your configuration, your code, your data and who has access. Most cloud breaches come from the customer's side: a storage bucket left public, a key with too much power.

> **Pitfall.** Every service you use ties you a little more to one provider. That is often a fair trade for less work. Make it a conscious choice, and keep your own code free of provider details behind small interfaces where it is cheap to do so.

## Remember

- The cloud rents compute, storage, databases and networks on demand.
- The more the provider manages, the less you operate. Managed services suit small teams.
- Use several availability zones for resilience, and regions near users and the law.
- Security is shared: the provider runs the platform, you secure your settings and data.

::quiz
? A team of three needs a PostgreSQL database. What is usually the best choice?
+ A managed database service from their cloud provider
- Install PostgreSQL on a virtual machine and manage it themselves
- Buy a physical server
! A managed service handles backups, updates and failover, which a small team should not spend its time on.
? A company's files leaked from a cloud storage bucket set to public. Whose responsibility was that?
+ The customer's: configuration and access are their side of the shared model
- The cloud provider's
- Nobody's
! The provider secures the platform. Who may read a bucket is the customer's setting.
::end
