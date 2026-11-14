---
title: Software engineering habits
summary: A pipeline is software. Version control, code review, tests and small functions apply to SQL and Python in the same way as to an application.
track: foundations
level: core
minutes: 9
at: [4, 2]
prereqs: [lifecycle]
tech: [vcs, ci]
refs:
  - fode: Ch. 2, “Software Engineering” undercurrent
  - accelerate: Part 1, the technical practices
---
A pipeline is a program. It has inputs, logic and outputs, it has defects, and other people must be able to change it after you. The habits that software engineers use to keep programs correct apply to data work with almost no change. Reis and Housley list software engineering as one of the undercurrents of the [lifecycle](/lesson/lifecycle) for this reason.

A team that writes SQL in a web console and saves it nowhere does not have these habits. That team is slow, because nobody can make a change with confidence.

## Version control

All code is kept in **Git**: SQL, Python, configuration, infrastructure definitions and documentation. Git records each change, who made it and why.

The usual flow:

1. Make a **branch** from the main line. Your change is isolated there.
2. **Commit** small steps, each with a message that says why.
3. Open a **pull request**. Automated checks run, and a colleague reviews the change.
4. **Merge** it into the main line. The main line is what runs in production.

This gives you three things that a shared folder cannot: you can see what changed when a number moved, you can go back to the last good version in one command, and two people can work on the same project without overwriting each other.

> **In practice.** If a query or a notebook affects a number that someone uses, it must be in the repository. “It is in my worksheet” is the start of many incidents.

## Code review

A second person reads each change before it is merged. Review finds defects, but its larger value is that two people now understand that code. Good review asks: Is the logic correct? Is it tested? Will I understand it in six months? What occurs when it runs twice?

Keep changes small. A review of 50 lines finds problems. A review of 2,000 lines gets “looks good”.

## Tests

A test is code that checks other code. In data work there are two kinds, and you need the two.

| Kind | Checks | Example | Runs |
|---|---|---|---|
| **Code test** | The logic, with fixed input | Given three known orders, the revenue function returns 61.50 | On each commit, before release |
| **Data test** | The real data that arrived | `order_id` is unique and not null in today’s load | On each pipeline run, in production |

Code tests protect you from your own changes. Data tests protect you from changes in the source. The lesson on [data quality](/lesson/data-quality) covers the second kind.

To make logic testable, separate it from input and output. A function that takes rows and returns rows can be tested with five lines. A function that also connects to a database, reads a file and sends an email cannot.

## Write code for the next reader

- **Small units with one purpose.** A SQL model of 40 lines that does one thing is better than one of 600 lines that does everything. Use CTEs with clear names.
- **Names that say what the thing is.** `orders_paid_daily`, not `tmp2_final_v3`.
- **No copy and paste of logic.** If the definition of “net revenue” is in four queries, it will soon have four values. Put it in one place and refer to it.
- **Configuration is not code.** Connection details, dates and environment names come from parameters. Passwords are never in the repository: they come from a secrets manager.
- **Automatic formatting and linting.** Tools such as SQLFluff, Ruff and Black remove style arguments from reviews.

## Dependencies and environments

Your code depends on libraries, and libraries change. Write the exact versions in a lock file, so that the code runs the same on your laptop, in the test system and in production. Containers (Docker) go one step further and pack the operating system libraries with the code.

## Documentation where the work is

Three kinds are worth their cost:

- A **README** in each repository: what this is, how to run it, who owns it.
- **Descriptions of tables and columns**, kept next to the code that builds them, so that they are updated in the same change.
- **Decision records**: a short note for each important choice, with the alternatives that were rejected. In two years, “why did we do it this way?” will have an answer.

> **Pitfall.** Treating SQL as “not real code”. SQL holds the business logic of the company. It needs version control, review and tests more than most Python does.

::scenario
? An analyst finds that last month’s revenue changed by 2% between Tuesday and Wednesday. Nobody knows why.
+ Look at the Git history of the revenue model for changes merged on Tuesday | With version control this takes two minutes: one commit changed a filter, and its message and review say why.
~ Compare the two results row by row to find the rows that differ | This finds which rows changed, and not why or who decided it. It is the only option when the logic is not in version control.
- Rebuild the table and see if the number goes back | This can destroy the evidence, and the cause is still unknown.
::end

## Remember

- Keep every piece of logic in Git. Change it through branches, pull requests and review.
- Code tests check your logic. Data tests check the data that arrived. You need the two.
- Small, named, single-purpose units are easier to test and to review.
- Secrets never go in the repository.

::quiz
? What is the main reason to separate transformation logic from the code that reads and writes data?
+ The logic can then be tested with small fixed inputs
- It makes the pipeline run faster
- It uses less storage
! A pure function from rows to rows needs no database to test. Mixed code needs the whole environment.
::end
