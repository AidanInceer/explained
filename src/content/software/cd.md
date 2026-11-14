---
minutes: 8
tech: []
refs:
  - cdbook: Ch. 1, “The Problem of Delivering Software”, and Ch. 5, “Anatomy of the Deployment Pipeline”
  - accelerate: Ch. 2, “Measuring Performance”
---
[Continuous integration](/lesson/ci) makes sure every change is built and tested. **Continuous delivery** goes further: every change that passes is ready to release at any moment, by pressing one button. **Continuous deployment** removes the button: every change that passes goes to production automatically. Both make releases small, frequent and boring, which is exactly what you want.

## Why release often

It sounds riskier to release twenty times a day than once a month. It is the opposite:

- **Small changes are easy to check.** If something breaks, it was one of a few lines changed an hour ago.
- **Small changes are easy to undo.** Roll back one small change, not a month of work.
- **Fast feedback.** Users get fixes and features in hours; the team learns what works.
- **No release events.** Monthly releases need freezes, late nights and many people. Frequent releases are routine.

Research behind the *Accelerate* book found that teams which deploy more often also have fewer failed changes and recover faster. Speed and stability go together.

## The deployment pipeline

The pipeline continues from CI:

1. **Build once.** The artefact, often a container image, is built once and the same one goes everywhere, as [Environments and configuration](/lesson/environments-config) explained.
2. **Test**: unit and integration tests, then deploy to staging and run end-to-end and smoke tests.
3. **Release**: deploy to production, by a button (delivery) or automatically (deployment).
4. **Verify**: check health and key measures after the release, and roll back if they get worse.

Every step is automated. A release that needs a person to follow a long checklist is slow and error-prone.

## Deploying without downtime

- **Rolling deploy**: replace servers a few at a time, so some always serve users.
- **Blue-green**: run the new version next to the old, then switch traffic over at once. Switch back if needed.
- **Canary**: send a small share of traffic, say 5%, to the new version, watch it, then increase.

Old and new versions run together during any of these, so database changes must be compatible both ways: expand, then contract, as in [Databases for applications](/lesson/app-databases).

## Release is not launch

**Deploying** code and **releasing** a feature to users can be separate. Deploy the code switched off, then turn the feature on for some users with a flag, as the lesson on feature flags explains. Deploys become routine; launches become a business decision.

> **Rule of thumb.** If a deploy is scary, do it more often, in smaller pieces, until it is not. Fear usually means too much change at once.

## Four measures

Common measures of delivery, from the same research:

- **Deployment frequency**: how often you release.
- **Lead time for changes**: from commit to production.
- **Change failure rate**: share of releases that cause a problem.
- **Time to restore**: how long it takes to recover from a failure.

## Remember

- Continuous delivery: every passing change is releasable. Continuous deployment: it is released.
- Small, frequent releases are safer than large, rare ones.
- Build once, test, release, verify, all automated.
- Deploy without downtime with rolling, blue-green or canary releases.

::quiz
? A team releases once a quarter and each release causes problems. What usually helps most?
+ Release smaller changes much more often through an automated pipeline
- Release less often, with more testing at the end
- Freeze all changes for a month before each release
! Large releases bundle many risks. Small, frequent releases make each one easy to check and undo.
? What is a canary release?
+ Sending a small share of traffic to the new version first, and increasing it if all is well
- Releasing only on Fridays
- Testing in a separate country
! A canary limits how many users meet a bad version before you notice.
::end
