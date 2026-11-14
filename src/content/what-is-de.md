---
title: What data engineers do
summary: Data engineers move data from the systems that create it to the people and programs that use it, and keep it correct on the way.
track: foundations
level: core
minutes: 6
at: [2, 0]
prereqs: []
tech: [clouds, warehouses, orchestrators]
refs:
  - fode: Ch. 1, Data Engineering Described
  - wiki: "FAQ: What is Data Engineering?"
  - reddit: Community wiki, “Getting started”
---
A shop sells a pair of shoes. The till records the sale in a database. A week later, someone asks how many shoes were sold in each city last month, and whether the discount helped.

The till's database cannot answer that question well. It holds the current state of the shop, it is busy serving customers, and it does not know about the marketing system that sent the discount. Someone must copy the sales out, join them with the other data, correct what is wrong, and put the result where an analyst can query it. That work is data engineering.

## The job in one sentence

Reis and Housley define it as the development, implementation and maintenance of systems that take in raw data and produce high-quality, consistent information for downstream use, such as analysis and machine learning.

In practice a data engineer does four things:

- **Moves data** from where it is created to where it is used.
- **Changes its shape** so that it is easy and cheap to query.
- **Keeps it correct**, and finds out first when it is not.
- **Runs all of this on a schedule**, without a person starting each step.

## Who does what

| Role | Main question | Output |
|---|---|---|
| Software engineer | Does the application work? | The systems that create data |
| Data engineer | Is the data available, correct and on time? | Pipelines and tables |
| Analytics engineer | Do the tables match how the business thinks? | Modeled, documented tables |
| Data analyst | What happened, and why? | Reports and answers |
| Data scientist, ML engineer | What will happen? | Models and predictions |

The boundaries move between companies. In a small team one person does three of these roles. The table shows where the data engineer sits: after the people who create data, before the people who use it.

> **For new readers.** You do not need to learn every tool. Tools change every few years. The ideas on this map, such as how storage layout affects speed, or why a job must be safe to run twice, have been stable for decades.

## What makes it hard

The individual steps are simple. A copy is a copy. The difficulty comes from four facts:

1. **You do not control the sources.** An application team renames a column and your pipeline breaks at night.
2. **Volume changes the method.** A join that takes a second on a laptop takes hours across a billion rows unless the data is laid out for it.
3. **Failures are partial.** A job stops halfway. Was the data written? Is it safe to run again?
4. **Wrong data looks like right data.** A broken application shows an error. A broken pipeline shows a number, and the number is wrong.

Most of the lessons on this map are answers to one of these four problems.

## Remember

- Data engineering connects the systems that create data to the people and programs that use it.
- The work is to move, reshape, check and schedule.
- Learn the concepts first. Each tool is one implementation of a concept.

::quiz
? A dashboard shows revenue that is twice the true value. No job failed. Which of the four difficulties is this?
- You do not control the sources
- Volume changes the method
+ Wrong data looks like right data
! Nothing reported an error, and the number looked reasonable. This is why data engineers add tests on the data and not only on the code.
? Which of these is the best first thing to study?
- The most popular orchestration tool this year
+ How storage layout affects query speed
- The configuration options of one cloud warehouse
! Concepts transfer between tools. A tool is easy to learn when you know which problem it solves.
::end
