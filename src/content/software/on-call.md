---
minutes: 8
tech: []
refs:
  - sre: Ch. 11, “Being On-Call”, Ch. 12, “Effective Troubleshooting”, and Ch. 14, “Managing Incidents”
---
Systems fail at inconvenient times. Someone must notice, respond and fix it, including at night. Being **on call** means being that person for a period, usually a week, in a rota. Done well, it is calm and rare. Done badly, it burns people out. The difference is mostly in preparation and in how incidents are run.

## Before the pager goes off

- **Good alerts**, as in [Logs, metrics and traces](/lesson/observability): every page is urgent, real and needs a human. A rota that is woken every night for nothing will start ignoring pages.
- **Runbooks**: for each alert, a short page that says what it means, how to check, and the first safe steps.
- **Access ready**: the on-call person can reach logs, dashboards and the deploy and rollback tools, from home.
- **A clear path to help**: who to call for each system, and for decisions above your level.

## During an incident: first, stop the damage

When something breaks, the first goal is not to find the cause. It is to **restore service**:

- **Roll back** the last deploy, if the problem started after it.
- **Turn off** the feature with its [flag](/lesson/feature-flags).
- **Fail over** to a healthy region or replica.
- **Scale up** if it is load.

Find the root cause after users are fine. Debugging in production while customers wait is slower than undoing the change and investigating calmly.

## Roles

For anything larger than a quick fix, give people clear roles:

- **Incident commander**: coordinates, decides, keeps the big picture. Does not dig into the code.
- **Operations lead**: does the hands-on investigation and fixing.
- **Communications lead**: tells users, support and leadership what is happening, at regular times.

One person can hold several roles in a small incident. What matters is that someone is clearly in charge, and everyone knows it.

## Communicate

Silence makes everything worse. Post an update early, even if it only says "we are aware and investigating", then at regular intervals: what is affected, what is being done, when the next update will come. Keep a timeline of events and actions as you go; you will need it for the postmortem.

> **Rule of thumb.** If you have been stuck for 15 minutes, call for help. Pride costs users minutes; a second pair of eyes is cheap.

## Keep it humane

- Share the rota fairly, with a secondary person as backup.
- Give time off after a bad night.
- Track how often people are paged. If it is too often, fixing the causes is the team's priority, not a burden for the on-call person to carry.

## Remember

- Prepare: urgent, actionable alerts, runbooks, access, and a path to help.
- In an incident, restore service first: roll back, switch off, fail over. Find the cause later.
- Name an incident commander. Communicate early and regularly. Keep a timeline.
- Ask for help early, and keep the rota humane.

::quiz
? Errors rose sharply ten minutes after a deploy. What should the on-call engineer do first?
+ Roll back the deploy, then investigate
- Read the new code line by line to find the bug
- Wait to see if it recovers
! Restoring service comes first. The deploy is the most likely cause, and rolling back is fast and safe.
? Why should the incident commander not also debug the problem?
+ Someone must keep the overview, coordinate people and decisions, and make sure updates go out
- Commanders are not allowed to see code
- It is faster to have nobody in charge
! Deep debugging takes all attention. The commander keeps the response organised.
::end
