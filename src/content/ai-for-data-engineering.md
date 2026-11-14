---
title: AI in data engineering work
summary: Language models write and explain SQL, draft tests and documentation, and read logs. They also make confident errors, so the review habits matter more, not less.
track: foundations
level: core
minutes: 10
at: [4, 4]
prereqs: [sdlc]
tech: [semantic, ml, ci]
refs:
  - fode: Ch. 11, The Future of Data Engineering
  - reddit: Recurring threads on AI tools in data engineering work
---
Large language models are now a normal tool in data engineering work. They are good at some tasks and unreliable at others, and the difference is predictable. This lesson is about using them as an engineer. The lesson on [data for machine learning and AI](/lesson/data-for-ml) covers the other direction: building the data supply for AI systems.

This area changes fast. Treat product names as examples, and check what is current.

## What a model is good at, and why

A language model predicts text that is probable, given its training data and what you put in the prompt. Two consequences explain nearly all of its behaviour.

- It is **strong where the pattern is common and the answer can be checked**: standard SQL, Python, configuration files, regular expressions, explanations of error messages.
- It is **weak where the answer depends on facts it does not have**: your table names, your business rules, the meaning of `status = 3`, what changed in your pipeline last Tuesday. Without those facts in the prompt, it produces something plausible, and plausible is not the same as correct.

So the work is to **give it the context and check the result**.

## Uses that work well

| Task | How it helps | How to check |
|---|---|---|
| **Write SQL and code** | A first version of a query, a transformation, an API client, a Terraform resource | Run it. Read it. Test it on known data |
| **Explain code** | “What does this 300-line query do?” A fast way into an old project | Compare with the output for a few rows |
| **Translate** | One SQL dialect to another. pandas to PySpark. A stored procedure to dbt models | Run the two versions and compare the results |
| **Write tests** | Unit test cases for edge conditions: nulls, duplicates, time zones | Review that each test checks something real |
| **Write documentation** | Column descriptions and a README from the code | A person who knows the data must read it |
| **Read logs and errors** | Paste a stack trace and get the probable cause | Confirm in the system before you act |
| **Regular expressions, date formats, shell commands** | Things that are easy to check and hard to remember | Try them on examples |
| **Review** | A second reader that looks for missing cases before a colleague does | It is an addition to human review, not a replacement |

Migrations are one of the best uses. To translate 400 stored procedures by hand takes months. With a model that translates, and a test that compares old and new output for each one, the same work takes weeks, and the comparison test gives the confidence.

## Uses inside the pipeline

A model can also be a step in a pipeline, mainly for **unstructured data**.

- **Extract fields from text**: an invoice, a contract or a support ticket becomes a row with typed columns.
- **Classify**: put free-text feedback into categories.
- **Clean and match**: decide if “Acme Ltd.” and “ACME Limited” are the same company.

These steps need the same engineering as any other, with some additions:

- **Force a schema.** Ask for JSON that matches a defined structure, and validate each response. Reject and retry what does not match.
- **Expect variation.** The same input can give a different output. Store the output with the model version and the prompt version, so that a run can be explained later.
- **Measure quality.** Keep a set of examples with known correct answers, and measure accuracy on it for each change of prompt or model. This is a test suite for the step.
- **Watch cost and speed.** A call for each row of a billion-row table is slow and expensive. Process only new rows, group requests, and use the smallest model that passes the quality test.
- **Mind the data.** Check what you are permitted to send to an external service. Remove personal data that the task does not need.

## Questions in plain language: text-to-SQL

The idea is attractive: a manager asks “what was revenue in Spain last month?” and gets the number. On raw tables it fails often, for the reasons above: the model must guess which of five tables has revenue, whether tax is included and which date to use.

It works much better on top of a [semantic layer](/lesson/semantic-layer). The model then chooses a named, defined metric and its dimensions, and the layer writes the SQL. The model’s job is reduced to understanding the question, which it does well.

This gives a practical rule: **AI on a data platform is only as good as the documentation, the metric definitions and the data quality below it.** The preparation is ordinary data engineering.

## Agents

An **agent** is a model that can use tools in a loop: run a query, read the result, edit a file, run the tests, try again. Coding agents can now do multi-step work, such as “add this column through staging, the mart and its tests”.

They are useful under supervision, and the supervision is the [engineering process](/lesson/sdlc) you already have:

- The agent works on a **branch**, in a **development environment**, with **read-only** access to production data at most.
- Its work arrives as a **pull request**, with CI, a data diff and a human review.
- It gets the **least access** that the task needs. An agent that can drop production tables will, at some time, drop one.

The better your tests and CI are, the more work you can safely give to an agent. A team with no tests has no way to know if the generated change is correct.

## What does not change

- **You are responsible for what you merge.** “The model wrote it” is not an explanation for a wrong revenue number.
- **You must be able to read it.** If you cannot explain a query, you cannot maintain it. Use the model to learn, and ask it to explain each part.
- **Requirements are still the hard part.** A model writes the SQL for the question you ask. It does not know that the question is wrong.
- **Fundamentals matter more.** To judge generated code you must know what correct looks like: grain, joins, [idempotency](/lesson/idempotency), partitions. The rest of this site is that knowledge.

> **Pitfall.** Generated SQL that runs and is wrong. It joins at the wrong grain, and the total is 3% too high. Nothing fails. Always check the row counts before and after each join, and compare the total with a number you trust.

> **Pitfall.** Secrets and customer data in a prompt. Treat a prompt to an external service as data that leaves the company. Follow the rules of your employer.

::scenario
? You must add a refund calculation to a revenue model. You have an AI coding assistant.
+ Describe the rule and the tables to the assistant, then review the SQL, add a unit test for a refund, and read the data diff | You get the speed of generation, and three independent checks that the logic is what finance asked for.
~ Write it by hand, without the assistant | Correct and slower. For a rule this small the difference is minor. For a migration of many models it is large.
- Ask the assistant, see that the query runs, and merge | A query that runs has been checked for syntax only. A wrong join or sign gives a wrong number with no error.
? The head of sales wants to ask questions about the data in plain language.
+ Define the main sales metrics in a semantic layer first, then connect a model to that layer | The model selects from definitions that people have agreed. The answers are consistent with the dashboards.
- Connect a model directly to the raw tables | It must guess the business rules. Some answers will be wrong and will look as certain as the correct ones.
~ Build more dashboards | Reliable for the known questions. It does not help with a question that nobody expected.
::end

## Remember

- A model is strong on common patterns that you can check, and weak on facts that are specific to your company.
- Give it context, and verify the output: run it, test it, compare it.
- In a pipeline, force a schema, version the prompt and the model, and measure quality on known examples.
- Text-to-SQL needs a semantic layer and good documentation below it.
- Agents work inside the normal process: branch, CI, review, least access.

::quiz
? Why does text-to-SQL work better on a semantic layer than on raw tables?
+ The business rules are already defined, so the model selects a metric and does not have to guess the logic
- The semantic layer is faster
- Raw tables cannot be queried with SQL
! The model is good at understanding the question. It cannot know your definitions unless they exist in a form it can use.
::end
