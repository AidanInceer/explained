---
minutes: 7
tech: []
refs:
  - sre: 'Ch. 15, “Postmortem Culture: Learning from Failure”'
---
After an incident is over, the most valuable work begins: understanding why it happened, so it does not happen again. A **postmortem** (or incident review) is a written account of what happened, why, and what will change. Its power depends on one condition: it must be **blameless**.

## Why blameless

If people are blamed for mistakes, they hide them. They stop reporting near-misses, and they describe incidents in the way that protects them, not in the way that is true. The organisation then learns nothing.

A blameless review assumes that everyone acted reasonably with the information and tools they had. The question is not "who made a mistake?" but "why did the system make that mistake easy, and why did nothing stop it?" A person typed the wrong command; the real causes are that one command could delete production, and that nothing asked "are you sure?".

## What goes in it

1. **Summary**: what happened and the impact, in a few sentences. How many users, for how long, what they could not do.
2. **Timeline**: what happened when, from the first sign to full recovery, with the times of detection, response and fix. The notes from [On call and incidents](/lesson/on-call) feed this.
3. **Root causes and contributing factors**: usually several. A bug, a missing test, an alert that did not fire, a runbook that was out of date.
4. **What went well**: worth keeping, too.
5. **Action items**: specific changes, each with an owner and a date.

## Look past the first cause

Ask "why?" more than once:

- The site went down. Why? The database ran out of connections.
- Why? A new feature opened a connection per request and never closed it.
- Why did tests not catch it? Tests use a small number of requests.
- Why did monitoring not warn us? We do not watch connection counts.

Each answer points to a different action item: fix the code, add a load test, add a metric and alert.

## Action items that matter

- Prefer changes to the **system** over "be more careful". Careful people still have bad days.
- Make each item specific: "add an alert when database connections exceed 80%", not "improve monitoring".
- Track them like other work, and check that they get done. Postmortems whose actions are never done are theatre.

> **In practice.** Share postmortems widely. Other teams learn from your incident at no cost, and seeing honest reviews from senior people makes it safe for everyone to write them.

## Remember

- A postmortem records what happened, why, and what will change.
- Make it blameless: ask why the system allowed the mistake, not who made it.
- Include impact, a timeline, several causes, what went well, and owned action items.
- Fix systems rather than asking people to be careful, and follow the actions through.

::quiz
? A postmortem concludes: "Engineer X ran the wrong script. Action: X will be more careful." What is wrong?
+ It blames a person and changes nothing in the system that made the mistake possible
- Nothing, it is clear
- It is too short
! Ask why one script could do that damage, and change the system, for example with a check or a safer tool.
? Which action item is best?
+ Add an alert when database connections exceed 80% of the limit, owned by Sam, due next Friday
- Improve monitoring
- Be more careful with deploys
! Specific, owned and dated items get done and can be checked.
::end
