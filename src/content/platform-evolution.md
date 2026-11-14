No company starts with a mature data platform, and no company should. Platforms grow in stages, and each stage is correct for its time. Reis and Housley write that architecture is never finished. This lesson describes the usual stages, and then the hard part: how to move from one to the next without a break in service.

## Four stages

### Stage 1: queries on the application database

One person writes SQL against a replica of the production database. Reports are spreadsheets.

- **Correct when:** one data source, a few questions, no dedicated data person.
- **Signs that it is over:** questions need data from a second system. Queries slow the application. Two people have two numbers for revenue.

### Stage 2: a warehouse and scheduled SQL

[Managed connectors](/lesson/ingestion-patterns) copy sources into a [warehouse](/lesson/choosing-engine). Transformations are SQL, at first as scheduled queries, then in [dbt](/lesson/transformation-dbt). A BI tool on top.

- **Correct when:** one to five data people, batch needs, several sources.
- **Signs that it is over:** a change breaks something that nobody knew depended on it. Nobody knows which tables are still used. The nightly run is long. People do not trust the numbers.

### Stage 3: engineering practices

The tools are much the same. What changes is how the team works: [version control and CI](/lesson/testing-ci-cd), [tests](/lesson/data-quality), an [orchestrator](/lesson/orchestration), [environments](/lesson/environments-iac), [monitoring](/lesson/observability-lineage), documented owners, an on-call arrangement. Perhaps [CDC](/lesson/cdc) for the main databases and a first streaming use.

- **Correct when:** five to twenty data people, and data that feeds decisions with money behind them.
- **Signs that it is over:** the central team is a queue. Each business area waits weeks. The team cannot know every domain well enough to model it.

### Stage 4: a platform, and teams that own their data

A platform team supplies storage, compute, orchestration, CI templates, the [catalogue](/lesson/governance-security) and access control as a service. Domain teams build and own their pipelines and data products on it. See [data mesh](/lesson/data-mesh).

- **Correct when:** several teams produce data, and the company is large enough to pay for a platform team.
- **Risk:** adopted too early, it is a large organisational change for a problem that the company does not have.

Most of the pain in data teams comes from being at the wrong stage: stage 2 tools with stage 3 responsibilities, or a stage 4 organisation in a company of sixty people.

## What changes between stages is mostly not the tools

| Stage | Main problem | Main investment |
|---|---|---|
| 1 → 2 | Data is in separate systems | Ingestion and a warehouse |
| 2 → 3 | Trust and change safety | Tests, CI, orchestration, ownership |
| 3 → 4 | Throughput of people | Self-service platform, domain ownership |

A common error is to answer a stage 2 → 3 problem (trust) with a stage 1 → 2 solution (a new warehouse).

## Migrations

At some time you will replace a part: a warehouse, an orchestrator, a transformation tool. Migrations have a bad record. They take longer than planned, and for their duration the team runs two systems and builds little that is new.

### Before you start

1. **Name the limit.** What can the business not do today, in one sentence? “It is old” is not a limit.
2. **Find what is really used.** Query logs show which tables and dashboards had readers in the last 90 days. In most platforms a large share has none. Delete it. Do not migrate it.
3. **Measure the size.** Count the pipelines, the models, the dashboards and the consumers.
4. **Define done.** The old system is switched off. A migration that ends with two systems has doubled the cost.

### The method: move in slices, run in parallel, compare

Do not plan a single date on which everything changes. That is the “big bang”, and it fails because every problem appears on the same day.

Use the **strangler** approach: the new system takes over one part at a time, while the old one continues, until nothing is left in the old one.

For each slice, which is one source or one business area:

1. **Build** it in the new system.
2. **Run both** in parallel, on the same input, for a period: two weeks, or one month end.
3. **Compare** the outputs automatically: row counts, sums of the main measures, and a row-by-row diff on keys. This is the same [data diff](/lesson/testing-ci-cd) as in CI.
4. **Explain every difference.** Some are defects in the new system. Some are defects in the old one that everyone had accepted. Decide each one with the owner of the data.
5. **Switch the consumers.** Then switch off the old slice.

The comparison is the centre of the method. Without it, “it looks about right” becomes “finance found a difference in March”.

### Keep the interface stable

Consumers must not have to change at the same moment as the engine. Put a stable layer between them:

- Consumers read **views** with fixed names and columns. During the migration, the view points first at the old table and then at the new one.
- Or the [semantic layer](/lesson/semantic-layer) hides which engine answers.

With this, the switch for one table is one change of a view, and going back is the same change in reverse.

### Order of work

1. Start with a slice that is **small and real**, to learn the new system and build the comparison tools.
2. Then the **most valuable** slices, while there is energy and attention.
3. Leave the **strange old cases** to the end. Many of them turn out to have no users.

### Translating the logic

Stored procedures, old SQL dialects and scheduled scripts must be rewritten. [AI tools](/lesson/ai-for-data-engineering) do the first translation well. The parallel run with an automatic comparison is what makes their output safe to use.

Do not improve the logic during the migration. First reproduce the old result exactly, and prove it. Improve after. If you change the engine and the business rules together, no difference can be explained.

### History

Decide for each table: build the history again in the new system from raw data, or copy the old table as it is? To rebuild is cleaner and can give different numbers for the past. For reported figures, such as last year’s revenue, a copy of the old result is usually correct, with the new logic from a stated date.

## The people side

- **A migration has no visible result for the business** until it ends. Agree the reason and the time with the sponsor first, and report progress as slices completed.
- **Freeze new work on the old system**, or the target moves each week.
- **Train the users** before the switch.
- **Keep a way back** for each slice for some weeks.

## Planning for the next change

You cannot avoid migrations. You can make them cheaper:

- **Logic in version control**, in standard SQL where possible.
- **Open formats** for the data.
- **A stable serving layer**, so that consumers do not know the engine.
- **Raw data kept**, so that anything can be built again.
- **Fewer tools.** Each one is a future migration.

> **Pitfall.** The migration that never ends. 80% is moved, the difficult 20% stays, and the team pays for and operates two platforms for years. Put the switch-off date in the plan, and give the last 20% an owner.

> **Pitfall.** A new platform to solve a problem of trust. The same untested logic on a faster engine gives wrong numbers faster.

::scenario
? A team will move 300 dbt models from one warehouse to another. The business uses about 40 dashboards.
+ Check usage and delete what has no readers. Then move one business area at a time, run both in parallel, and compare automatically before each switch | The scope gets smaller first. Each slice is proven before consumers move, and a problem affects one area.
~ Convert everything, test for two weeks, and switch on one weekend | It can work for a small, simple platform. Every difference appears at the same time, and going back means going back on everything.
- Build new models with improved logic in the new warehouse while migrating | No number can be compared with the old system, so nobody can say if the migration is correct.
::end

## Remember

- Platforms grow in stages. Each stage is correct for a size of team and a kind of problem.
- Know which problem you have: integration, trust or throughput.
- Migrate in slices: build, run in parallel, compare, explain, switch, remove.
- Keep the interface to consumers stable. Do not change logic and engine together.
- A migration is done when the old system is off.

::quiz
? Why run the old and the new system in parallel during a migration?
+ So that their outputs can be compared automatically and every difference explained before consumers switch
- To have twice the capacity
- Because the old system cannot be stopped
! The comparison is the proof that the new system is correct. Without it, differences are found by users, later.
::end
