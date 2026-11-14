The **software development lifecycle** (SDLC) is the sequence of activities that takes a change from an idea to something that runs in production and is maintained. Each team has one, written down or not. A good one makes changes small, safe and frequent.

::fig sdlc | The loop that each change goes through.

## The stages, for a data change

Take one example: finance wants refunds subtracted from the daily revenue table.

1. **Plan.** Find the [requirement](/lesson/stakeholders-requirements): which refunds, dated by refund date or order date? Write the acceptance test in words: “for 3 June the table shows 41,280.50, the same as the finance report”. Split the work if it is large.
2. **Build.** Create a branch. Change the SQL model in a **development environment**, which is your own copy of the tables. Production is not touched.
3. **Test.** Add a code test for the new logic. Run the model on real data and compare the output with the old one: the difference must be the refunds and nothing else.
4. **Review.** Open a pull request. Automated checks run. A colleague reads the change and the comparison.
5. **Release.** After the merge, a deployment pipeline puts the new code in production. Old dates are **backfilled** so that history uses the same rule.
6. **Operate.** Data tests run each day. Finance confirms the number. If something is wrong, you go back to the last version and start the loop again.

The lessons on [environments](/lesson/environments-iac) and [CI/CD](/lesson/testing-ci-cd) cover stages 2 to 5 in detail.

## Waterfall and agile

There are two families of process.

**Waterfall** does each stage once, for the whole project: all the requirements, then all the design, then all the build, then all the tests. It fits work where the requirements are fixed and well known, such as a regulatory report with a legal specification. Its weakness is that the users see the result only at the end, when a change is expensive.

**Agile** methods do the full loop many times, in small pieces. Each piece gives something that a user can try.

| Method | How it works | Fits |
|---|---|---|
| **Scrum** | Fixed periods of one or two weeks (sprints). Plan at the start, show the result at the end | Project work with a clear goal |
| **Kanban** | A board with columns and a limit on the work in progress. No fixed periods | Teams with many small requests and interruptions |

Most data teams use a mixture: planned project work, and a reserve of capacity for requests and incidents. The name of the method matters less than two rules. Deliver in small pieces. Show the pieces to the people who asked.

Data work has a special reason to be iterative: nobody knows what is in the data before they look. A plan made before the first query is a guess.

## CI/CD: the loop, automated

- **Continuous integration** (CI): each change is merged into the main line often, and each merge starts automated checks.
- **Continuous delivery** (CD): the main line can be released at any time, by a pipeline and not by hand.

The research published in *Accelerate* measured thousands of teams and found that the teams that release small changes often are also the teams with fewer failures. Speed and stability are not opposites. Small changes are easier to review, to test and to undo.

The four measures from that research are a good way to look at a data team:

| Measure | Question |
|---|---|
| Deployment frequency | How often do we release a change? |
| Lead time for changes | How long from commit to production? |
| Change failure rate | What part of releases causes a problem? |
| Time to restore | How long to recover when one does? |

## What is different for data

1. **The data changes when the code does not.** A pipeline that passed all its tests can fail tomorrow because a source sent a new value. So tests must also run in production, on each run.
2. **A release can need a backfill.** New logic applies to new data. For history to agree, you must process the old data again, which can take hours and cost money.
3. **You cannot always undo.** You can go back to old code in a minute. A table that was overwritten with wrong values is still wrong. This is the reason for raw copies, [idempotent jobs](/lesson/idempotency) and table history.
4. **Schema changes affect other people.** A renamed column breaks the dashboards that use it. Changes to a public table need a notice and a period where the old and the new exist together.

**DataOps** is the name for these practices as a set: the SDLC, with automation and monitoring, applied to data.

> **Pitfall.** One large release each quarter. It contains 60 changes, and when a number is wrong nobody knows which change caused it. Release each change alone.

## Remember

- The SDLC is plan, build, test, review, release, operate, and then again.
- Agile methods go round the loop in small pieces. This fits data work, where the data always holds surprises.
- CI/CD automates the checks and the release. Small, frequent releases fail less.
- Data adds three problems: the input changes without you, history needs backfills, and a bad write cannot always be undone.

::quiz
? Why must data pipelines be tested in production on each run, and not only before release?
+ The input data changes each day, and the code tests did not see tomorrow’s data
- Production machines are faster
- Code review is not reliable
! Tests before release check the logic against known data. Only tests on each run can find a new problem in the source.
::end
