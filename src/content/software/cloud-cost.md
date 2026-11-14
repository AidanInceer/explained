---
minutes: 8
tech: []
refs:
  - finops: “FinOps Principles”, and the phases Inform, Optimize and Operate
---
In the cloud, every engineer can spend money with one command. That is the great strength of [Cloud basics](/lesson/cloud), and it is why bills grow quietly: a test environment left running all year, logs kept for ever, a database three sizes too large "to be safe". Keeping cost in check is part of engineering, not just finance.

## Where the money goes

Most bills are dominated by a few things:

- **Compute**: virtual machines and containers, often running more or larger than needed.
- **Databases**: managed databases are convenient and priced accordingly.
- **Storage**: cheap per gigabyte, but it only grows, with old backups, logs and files.
- **Data transfer**: moving data out of the cloud, or between regions, is charged, and easy to forget.
- **Managed extras**: monitoring, logging, and especially log volume.

## See it first

You cannot reduce what you cannot see.

- **Tag** every resource with its team, service and environment, so the bill can be split by owner.
- Show each team its own costs, regularly. People change behaviour when they see their own numbers.
- Set **budgets and alerts**, so a sudden jump is noticed in a day, not at the end of the month.

## Common savings

- **Turn things off.** Development and test environments can stop at night and at weekends: that alone cuts their cost by more than half.
- **Right-size.** Check real CPU and memory use, and choose smaller instances where they sit mostly idle.
- **Scale with load**, as in [Scaling a service](/lesson/scaling), instead of running for the peak all day.
- **Commit for discounts.** For steady, long-term use, providers give large discounts for one- or three-year commitments.
- **Use spot instances** for work that can be interrupted, such as batch jobs: much cheaper, and the provider can take them back.
- **Expire data.** Set retention rules: delete old logs, move old files to archive storage.
- **Watch transfer.** Keep chatty services in the same region and zone, and use a CDN for heavy downloads.

> **Rule of thumb.** Make cost visible in the same place as other service measures. A team that sees "£1,900 a month" next to its error rate makes better trade-offs than one that never sees the bill.

## Cost is a design input

Architecture decisions have price tags. Twenty microservices each with their own database cost more than one well-built service. Keeping every log line for two years costs more than keeping errors for a year and the rest for a month. Ask "what will this cost at ten times the load?" alongside "will it scale?".

## Remember

- Cloud bills grow quietly. Compute, databases, storage and data transfer dominate.
- Tag resources, show each team its costs, and alert on sudden changes.
- Turn off idle environments, right-size, scale with load, commit for steady use, expire data.
- Treat cost as a design input, like speed and reliability.

::quiz
? Test environments run 24 hours a day but are used only in working hours. What is a simple saving?
+ Stop them outside working hours and at weekends
- Move them to a larger instance type
- Add more environments
! Working hours are about a quarter of the week. Stopping idle environments saves most of their cost.
? Nobody knows which team owns half of the cloud bill. What helps first?
+ Tag every resource with its team and service, and report costs by tag
- Delete untagged resources at once
- Ask finance to pay it
! Ownership comes before optimisation. Tags let each team see and act on its own costs.
::end
