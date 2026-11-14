---
title: A free stack, and the order to build in
summary: DuckDB, dbt, Python, Git and a free scheduler are a complete stack at no cost. Go from end to end in days, then improve one part at a time.
track: build
level: core
minutes: 5
at: [1, 1]
prereqs: [first-project]
tech: [transformation, ci]
refs:
  - wiki: Learning resources
  - dbt: Project structure, as used in the example stack
---
You have [a question of your own](/lesson/first-project). This lesson gives the tools to answer it at no cost, and the order to build in.

## A stack that costs nothing

Everything here runs on a laptop or in a free tier.

| Part | Choice | Why |
|---|---|---|
| Language | Python | The standard for extraction code |
| Extract | `requests`, or the `dlt` library | Small, and you see every step |
| Storage and query | **DuckDB**, with Parquet files | A real column-store SQL engine in one file. No server and no bill |
| Transform | **dbt** with the DuckDB adapter | The same tool and project layout as in a company |
| Schedule | A scheduled **GitHub Actions** workflow, or cron | Free, and it gives you CI too |
| Dashboard | Evidence, Streamlit or Metabase | Free and local |
| Code | Git, in a public repository | It is your proof of work |

This is the same shape as the [online shop design](/lesson/case-online-shop), without the bill. When you want to see a cloud warehouse, the free tiers are enough for data of this size. Set a [budget alert](/lesson/cloud-basics) before anything else.

## Build it in this order

1. **Write the question.** One sentence: “Which openings do I lose most with?” This is your [requirement](/lesson/stakeholders-requirements).
2. **Get the data once, by hand.** One API call, saved to a file. Look at it.
3. **Load it raw.** No cleaning. Keep the original.
4. **One staging model, one mart.** Answer the question with one query.
5. **Show the answer.** One chart. You now have a complete pipeline, end to end. Everything after this is improvement.
6. **Make it incremental and idempotent.** Run it twice and check that nothing doubles.
7. **Add tests**: unique keys, not-null columns, a row count that is not zero.
8. **Schedule it**, and add an alert for failure.
9. **Let it run for a month.** This is the step that teaches the most. Something will break: the API changes, a value is new, a run is missed.
10. **Write a README**: the question, a diagram, how to run it, what you would change.

Get to step 5 fast, in a day or two. A thin pipeline that works from end to end is better than a perfect extract with nothing after it.

> **Pitfall.** The project that is never finished. Three weeks on the perfect extract, and no chart. Go end to end first.

## Remember

- DuckDB, dbt, Python, Git and a free scheduler are a complete stack at no cost.
- Go end to end in days: one question, one source, one chart.
- Then improve: incremental, idempotent, tested, scheduled.
- Run it for a month. The failures teach the most.

::quiz
? You have one API call saved to a file. What is the best next step?
+ Load it raw, write one staging model and one mart, and show one chart
- Make the extract handle every error before anything else
- Move the project to a cloud warehouse
! A thin pipeline that works from end to end shows you what matters. You improve each part after that.
::end
