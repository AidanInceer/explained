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

> **Pitfall.** Starting with the tools. “I want to learn Kafka” gives a cluster with nothing to put in it. Start with the question. Add a tool when the project needs it.

## Remember

- You cannot practise at company scale, and you do not need to. The ideas are the same when the data is small.
- Choose a problem of your own that you want solved. You will keep it running.
- Real data forces each idea on you: reruns, changes, failures.
- Use official APIs and exports, and respect their limits.

Next: [the stack and the order to build it in](/lesson/project-stack).

::quiz
? Why is a small pipeline that runs each day for a month better practice than a tutorial on a large cluster?
+ Real data and time force you to handle reruns, changes and failures, which are the ideas that carry over to any scale
- Small data is harder to process
- Employers do not use clusters
! Operation over time is what the job consists of. A tutorial ends before anything breaks.
::end
