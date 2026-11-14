---
title: Use AI, and still learn
summary: An assistant can write the whole project in an afternoon. How to use it so that the knowledge stays with you, and what the project shows an employer.
track: build
level: core
minutes: 5
at: [2, 2]
prereqs: [project-stack]
tech: [ci]
refs:
  - functional: Whole essay, for the habits to practise
  - reddit: Recurring threads on portfolio projects
---
Your project [runs from end to end](/lesson/project-stack). This lesson is about two things that decide what it is worth: what you learned from it, and what it shows to other people.

## Use AI, and still learn

An [AI assistant](/lesson/ai-for-data-engineering) can write this whole project in an afternoon. Then you have a repository and no new skill. It is now easy to build something and learn nothing.

Use it in a way that leaves the knowledge with you:

- **Decide first, then ask.** Choose the grain, the layers and the load pattern yourself. Then ask for help with the code.
- **Ask for explanations.** “Why a merge here and not an insert?” is a better question than “write the load”.
- **Read every line you keep.** If you cannot explain it, you cannot debug it at three in the morning.
- **Debug it yourself first.** The failures are where the learning is. Give yourself twenty minutes before you ask.
- **Let it review you.** Write the model, then ask what is wrong with it.

A test: can you explain to another person why each part of the pipeline exists, and what would go wrong without it? If yes, it does not matter who typed the code.

## What it shows an employer

A small project that runs each day shows things that a certificate does not:

- You can take a vague question to a working result.
- You know what [idempotent](/lesson/idempotency) means, because your pipeline is.
- You have had a failure in production and repaired it. Write about it in the README.
- You can explain your choices and what you gave up.

In an interview, “I chose DuckDB because the data is 200 MB, and here is what I would change at 200 GB” is a strong sentence. It shows the judgement that the [design method](/lesson/design-method) is about.

## Then make it harder, one thing at a time

When it has run for a month, add one thing that the site covers and your project does not: a second source to join, a [Type 2 dimension](/lesson/scd), a [backfill](/lesson/backfills) after a change of logic, a move to a cloud warehouse, a [data diff in CI](/lesson/testing-ci-cd). One at a time, each for a reason.

## Remember

- AI can write the whole project. Then you have a repository and no new skill.
- Decide the design yourself. Ask for explanations. Read every line that you keep.
- The test: you can explain why each part exists, and what goes wrong without it.
- A project that runs each day, with a README about one failure, is proof of work.
- Add one new thing at a time, each for a reason.

::quiz
? Which use of an AI assistant leaves the most knowledge with you?
+ You choose the grain and the load pattern, then ask for help with the code and for the reasons
- You ask it to write the whole pipeline, then run it
- You do not use it at all
! The decisions are the skill. Code that you can explain is yours, whoever typed it.
::end
