---
minutes: 7
tech: []
refs:
  - nygard: Whole essay
  - seag: Ch. 10, “Documentation”
---
Code shows *what* a system does. It almost never shows *why*. Why this database and not that one? Why is this field a string? Why do we retry three times? A year later, nobody remembers, the people who decided have moved on, and the team either repeats old arguments or changes something that was there for a good reason. Writing down decisions is cheap insurance.

## Architecture decision records

An **architecture decision record** (ADR) is a short document, a page or less, for each significant decision. A common shape has four parts:

1. **Context.** What problem we faced, and what forces were at play: requirements, limits, deadlines.
2. **Decision.** What we chose, in a sentence or two.
3. **Consequences.** What becomes easier, what becomes harder, and what we accept. Every real decision gives something up.
4. **Status.** Proposed, accepted, or superseded by a later record.

ADRs are numbered and kept in the repository, often in `docs/decisions/`, so they are reviewed like code and versioned with it. An old ADR is never edited to say something new. A new ADR replaces it and links back, so the history of thinking stays readable.

## What deserves one

A decision that is hard to reverse, or that people will ask about later:

- The choice of database, language, framework, or cloud service.
- A service boundary, as in [Monolith or services](/lesson/architecture-styles).
- An API style, or a rule such as "all money is stored in minor units".
- A security or privacy approach.

Not every small choice. If reversing it costs an afternoon, a good commit message is enough.

## Design documents

Before a large piece of work, many teams write a **design doc**: the problem, the goals and non-goals, the proposed design, the alternatives considered and why they were rejected, and the risks. Colleagues comment before code is written, when changing direction is still cheap. Its lasting decisions then become ADRs.

## Other docs that pay back

- A **README** that says what the project is, how to run it, and how to run the tests. It is the first thing a newcomer reads.
- **Comments that say why**, not what: "We retry three times because the partner's API fails briefly during their deploys" saves the next reader an hour.
- **Runbooks** for operations: what to do when an alert fires.

> **Rule of thumb.** Write docs close to the code and change them in the same pull request as the code. Docs in a separate wiki drift out of date, and wrong docs are worse than none.

## Remember

- Code shows what; decision records show why.
- An ADR has context, decision, consequences and status, and lives in the repository.
- Write one for decisions that are hard to reverse or will be questioned.
- Keep docs next to the code and update them with it.

::quiz
? What is the most valuable part of an ADR a year later?
+ The context and consequences: why it was chosen, and what was given up
- The date
- The list of people in the meeting
! The reasoning lets future readers judge whether it still holds when things change.
? A team changes its database choice. What should happen to the old ADR?
+ Mark it superseded, and write a new ADR that explains the new decision and links to it
- Delete it
- Edit it to describe the new database
! Keeping both shows how and why the thinking changed.
::end
