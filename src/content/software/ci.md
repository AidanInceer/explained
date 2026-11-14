---
minutes: 8
tech: []
refs:
  - seag: Ch. 23, “Continuous Integration”
  - cdbook: Ch. 3, “Continuous Integration”
  - accelerate: Ch. 4, “Technical Practices”
---
**Continuous integration** (CI) means that everyone merges their work into the shared main branch often, at least daily, and every change is built and tested automatically before it is merged. Problems show up within minutes of the change that caused them, while the author still remembers what they did.

## The problem it solves

When people work on separate branches for weeks, each branch works on its own. Then they merge, and nothing works together: conflicts, broken interfaces, tests that pass alone and fail combined. Teams called this "integration hell", and it could take longer than the work itself.

CI makes integration small and constant, so it stops being an event.

## The pipeline

A CI service, such as GitHub Actions, GitLab CI or Jenkins, runs a **pipeline** on every push and pull request:

1. Check out the code.
2. Install dependencies from the lock file, as in [Packages and dependencies](/lesson/packages).
3. Run the formatter check, the linter and the type checker, as in [Linters, formatters and types](/lesson/code-quality).
4. Build the project.
5. Run the [unit tests](/lesson/unit-tests), then the slower integration tests.
6. Report a pass or a fail on the pull request.

The pull request can only be merged when the pipeline passes. This site does exactly this: every pull request runs `npm run check`.

## Rules that make it work

- **Merge small and often.** A change that lives a day is easy to integrate, as [Branches, merges and pull requests](/lesson/branches-merges) explained.
- **Keep the main branch green.** If the build on main breaks, fixing it is the team's first job. A broken main blocks everyone.
- **Keep the pipeline fast.** Ten minutes is a common target. A one-hour pipeline means people batch changes and stop waiting for it. Run tests in parallel, cache dependencies, and move slow tests to a later stage.
- **Make it reliable.** A flaky pipeline teaches people to press "retry" until it passes, and then a real failure gets retried away.
- **Run the same checks locally.** One command, the same as CI, so developers find problems before they push.

> **Rule of thumb.** If the pipeline fails, look at why before you retry. A retry that passes may be hiding a race condition or a test that depends on timing.

## What CI is not

Running a build server is not CI on its own. If people keep long-lived branches and merge once a month, a pipeline only tells them on that day that everything is broken. The practice, merging small changes often, is the point; the tools support it.

## Remember

- CI: merge into main often, and build and test every change automatically.
- A pipeline checks format, lint, types, build and tests, and blocks merging on failure.
- Keep main green, the pipeline fast and reliable, and the same checks runnable locally.
- The practice of frequent merging matters more than the tool.

::quiz
? A team's CI pipeline takes 70 minutes. What is the likely effect?
+ People batch many changes together and stop waiting for results, so problems are found late
- Better quality, because more is tested
- Nothing
! Slow feedback leads to large, risky changes. Speed up the pipeline and move slow tests later.
? The build on the main branch fails. What should the team do?
+ Fix it first, or revert the change that broke it
- Keep merging and fix it at the end of the week
- Turn off the failing test
! A broken main blocks everyone and hides new failures. Restore it quickly.
::end
