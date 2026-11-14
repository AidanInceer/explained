---
minutes: 7
tech: []
refs:
  - cdbook: Ch. 10, “Deploying and Releasing Applications”
  - seag: Ch. 24, “Continuous Delivery”
---
A **feature flag** is a switch in the code that turns a feature on or off without a new deploy. It separates two things that used to happen together: **deploying** code and **releasing** a feature to users. With flags, you can ship unfinished work safely, release to a few users first, and turn a bad feature off in seconds.

## How it works

```python
if flags.enabled("new_checkout", user):
    return new_checkout(basket)
return old_checkout(basket)
```

The flag's value comes from a configuration service or a flag tool, and can depend on the user: on for staff, on for 5% of customers, on for one country. Changing it takes effect at once, with no deploy.

## What flags make possible

- **Merge unfinished work.** Code for a feature that is weeks away can merge into main every day, switched off. This keeps branches short, as [Branches, merges and pull requests](/lesson/branches-merges) recommended.
- **Gradual rollout.** Turn a feature on for staff, then 1% of users, then 10%, watching errors and key measures at each step. This is the same idea as a canary in [Continuous delivery and deployment](/lesson/cd), at the level of a feature.
- **Kill switch.** If the new checkout raises errors, turn it off in seconds, without a rollback or a new deploy.
- **Experiments.** Show two versions to two groups and measure which works better: an A/B test.

## Flags are debt

Each flag doubles the paths through a piece of code. Ten flags in one area give hundreds of combinations, and nobody tests them all.

- **Remove flags** once a feature is fully released. Put a removal date on each one when you create it.
- **Keep flag logic at the edges**, in a few places, not spread through deep code.
- **Test both states** of each flag that is still live.
- **Name flags clearly** and record who owns each one.

> **Pitfall.** Do not reuse an old flag for a new purpose. A company once lost hundreds of millions of dollars in under an hour when a deploy turned on a repurposed flag on a server that still had old code, which ran a long-retired trading routine.

## Kinds of flags

- **Release flags**: short-lived, to roll out a feature. Remove within weeks.
- **Operational flags**: long-lived switches to turn off expensive or risky parts under load.
- **Permission flags**: features for some plans or customers. These are really product settings, and belong in your permission model.

## Remember

- A feature flag turns a feature on or off without a deploy.
- Flags let you merge unfinished work, roll out gradually, and switch off fast.
- Every flag adds paths to test. Remove release flags soon after launch.
- Never reuse an old flag for something new.

::quiz
? A new search feature raises errors after release to 20% of users. What is the fastest safe response?
+ Turn its feature flag off
- Write a fix and deploy it
- Roll back the whole release
! The flag switches the feature off in seconds. Then fix it calmly.
? A codebase has 140 flags, many from features released years ago. What is the problem?
+ Dead flags add untested paths and confusion; release flags should be removed after launch
- Too few flags
- Flags slow down the CPU
! Every live flag multiplies the paths through the code. Old release flags are pure cost.
::end
