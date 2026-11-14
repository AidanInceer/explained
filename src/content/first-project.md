Reading explains the ideas. You learn the job by building a pipeline, running it each day, and repairing it when it breaks. This lesson is about how to do that with no employer and no budget.

## The problem with practice

Data engineering at a company means terabytes, clusters and many sources. You cannot rent that for practice. A large warehouse and a Spark cluster that run for a month cost more than most people want to pay to learn.

The answer is not to copy the scale. **Scale is the least important thing to practise.** The ideas that make an engineer good are the same at 50 MB and at 50 TB: [incremental loads](/lesson/incremental-loading), [idempotency](/lesson/idempotency), [layers](/lesson/transformation-dbt), [modeling](/lesson/dimensional-modeling), [tests](/lesson/data-quality), [scheduling](/lesson/scheduling-in-detail), and what to do when a run fails. A small pipeline that has all of these teaches more than a tutorial on a large cluster.

## Start from something that annoys you

Tutorial projects use tidy public datasets, and they end when the tutorial ends. The projects that teach are the ones you keep running, and you keep running the ones that you want the result of.

So the rule is: **find something in your own life that is annoying, and that data could improve.**

A real example. A chess player wanted statistics about their own games: which openings lose most, how results change by time of day, how the rating moves. The website shows some of this, and keeps the detailed analysis for paying members. But the site has a public API that returns the games of any player. So the player built a pipeline:

1. **Extract**: fetch the monthly game archives of themselves and some friends from the API.
2. **Load**: store the raw responses.
3. **Transform**: parse each game into rows, and model games, players and openings.
4. **Serve**: a dashboard with the statistics they wanted.

It is small. It also contains almost every idea on this site, because real data forced each one:

| What happened | The lesson it forced |
|---|---|
| The API returns games by month. To fetch all history each day is slow and impolite | [Incremental extraction](/lesson/api-extract-worked): fetch only the current month |
| A rerun loaded the same games twice | [Idempotent load](/lesson/merge-patterns): merge by game ID |
| The game record is a block of text in chess notation | Parsing semi-structured data in a staging layer |
| “Win rate by opening” needed a clear definition of one row | [Grain](/lesson/dimensional-modeling): one row for each game for each player |
| A friend changed their username | [Slowly changing dimensions](/lesson/scd), in a small form |
| The API was down one night | Retries, and an alert |
| The dashboard should be current each morning | [Scheduling](/lesson/scheduling-in-detail) |
| Times were in UTC, and “evening games” were wrong | Time zones |

Nobody had to tell the builder to learn idempotency. The duplicate rows did.

## Ideas, by size

Choose one where you care about the answer.

**Small: a weekend to a first result**

- Your own data from a service that has an export or an API: games, music listening, running or cycling, reading, bank statements as CSV.
- Prices of something you want to buy, collected each day.
- Energy use at home, from a smart meter export.
- Local weather against something you record yourself.

**Medium: a few weeks**

- Several sources that must be joined: your spending and your calendar. Public transport delays and weather.
- Open public data with an update schedule: transport feeds, government statistics, sports results.
- A small web application of your own that produces events, and analytics on those events.

**Larger: to learn one specific thing**

- A stream: a public event feed into a local [Redpanda or Kafka](/lesson/message-brokers), with a small consumer and a [window](/lesson/worked-streaming-window).
- [CDC](/lesson/cdc): a local Postgres with Debezium, to see change events.
- A [lakehouse](/lesson/table-formats) on your laptop: Parquet and Iceberg tables with DuckDB or Spark in local mode.

Be careful with data about other people, and with the terms of use of a site. Use official APIs and exports, respect the rate limits, and do not collect what you would not want collected about you.

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

> **Pitfall.** Starting with the tools. “I want to learn Kafka” gives a cluster with nothing to put in it. Start with the question. Add a tool when the project needs it.

> **Pitfall.** The project that is never finished. Three weeks on the perfect extract, and no chart. Go end to end first.

## Remember

- You cannot practise at company scale, and you do not need to. The ideas are the same when the data is small.
- Choose a problem of your own that you want solved. You will keep it running.
- DuckDB, dbt, Python, Git and a free scheduler are a complete stack at no cost.
- Go end to end in days. Then improve: incremental, idempotent, tested, scheduled.
- Run it for a month. The failures teach the most.
- Use AI to go faster, and make sure you can explain every part.

::quiz
? Why is a small pipeline that runs each day for a month better practice than a tutorial on a large cluster?
+ Real data and time force you to handle reruns, changes and failures, which are the ideas that carry over to any scale
- Small data is harder to process
- Employers do not use clusters
! Operation over time is what the job consists of. A tutorial ends before anything breaks.
::end
