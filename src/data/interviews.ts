/**
 * The Interviews page of each subject: the stages of a typical hiring process, questions that come up often, mistakes
 * that are common in the first months of the job, and places to practise. Data engineering is here; software
 * engineering and AI have their own files. Lesson ids must be written or planned lessons (checked in content.test.ts).
 */
import type { SubjectId } from './tracks.ts'
import { AI_INTERVIEWS } from './interviews-ai.ts'
import { SOFTWARE_INTERVIEWS } from './interviews-software.ts'

export interface InterviewStage {
  name: string
  /** What the stage tests, in one or two sentences. */
  tests: string
  prepare: string[]
  lessons: string[]
}

export interface InterviewQuestion {
  q: string
  /** What a good answer covers. Not a script to learn by heart. */
  answer: string
  lessons: string[]
}

export interface Gotcha {
  title: string
  why: string
  instead: string
  lessons: string[]
}

export interface InterviewGuide {
  lead: string
  /** The stages of a typical hiring process, in order. Companies differ; most use some of these. */
  stages: InterviewStage[]
  questions: { topic: string; items: InterviewQuestion[] }[]
  /** Mistakes that new people make often on the job. */
  gotchas: Gotcha[]
  /** Places to practise: [name, address, what it is good for]. */
  practice: [string, string, string][]
}

export const DATA_INTERVIEWS: InterviewGuide = {
  lead: 'Most data engineering interviews test four things: SQL, coding, how you model data, and how you design a pipeline. This page lists the usual stages, questions that come up often, and the mistakes that new data engineers make on the job. Each item links to the lessons that teach it.',
  stages: [
    {
      name: 'Recruiter call',
      tests: 'Whether your experience fits the role, and what you expect for pay and location. No technical questions, or very few.',
      prepare: ['A two-minute story of what you built and why it mattered', 'The stack of the team, from the job advert', 'Your salary range, said as a range'],
      lessons: ['what-is-de'],
    },
    {
      name: 'SQL screen',
      tests: 'Joins, aggregations and window functions under time pressure. Often on a shared editor with a small schema.',
      prepare: ['Window functions: ROW_NUMBER, LAG, running totals', 'Find duplicates and the latest row per key', 'Say what each join does to the row count'],
      lessons: ['sql-and-queries', 'merge-patterns'],
    },
    {
      name: 'Coding round',
      tests: 'Python with plain data structures: parse a file, group records, call an API with retries. Clean, tested code counts more than clever code.',
      prepare: ['Dictionaries, sets and sorting', 'Read and write JSON and CSV', 'Handle bad input without a crash'],
      lessons: ['api-extract-worked', 'idempotency'],
    },
    {
      name: 'Data modelling',
      tests: 'Design tables for a business, such as a shop or a ride app. They look for a clear grain, facts and dimensions, and how history is kept.',
      prepare: ['State the grain of each fact table first', 'Know the SCD types and when to use each', 'Ask which questions the business must answer'],
      lessons: ['dimensional-modeling', 'scd', 'fact-table-types', 'modeling-worked'],
    },
    {
      name: 'Pipeline or system design',
      tests: 'Design a pipeline end to end: sources, ingestion, storage, processing, serving, and what happens when a part fails.',
      prepare: ['A fixed order to talk in: requirements, volumes, design, failure, cost', 'Batch or streaming, and why', 'Backfills, late data and reruns'],
      lessons: ['design-method', 'batch-vs-streaming', 'designing-for-failure', 'case-online-shop'],
    },
    {
      name: 'Behavioural',
      tests: 'How you work with people: a disagreement, an incident, a project that went wrong. They want specific stories, not opinions.',
      prepare: ['Four or five stories, each told as situation, action, result', 'One incident you handled, and what changed after it', 'One time you pushed back on a request'],
      lessons: ['stakeholders-requirements', 'incidents-reliability'],
    },
  ],
  questions: [
    {
      topic: 'SQL',
      items: [
        {
          q: 'Return the latest order for each customer.',
          answer: 'ROW_NUMBER() over a partition by customer, ordered by date descending, then keep row 1. Say what happens with two orders at the same time, and add a tie-breaker column.',
          lessons: ['sql-and-queries'],
        },
        {
          q: 'A join returns more rows than you expected. Why?',
          answer: 'The key is not unique on one side, so each match multiplies rows. Check the grain of both tables with a COUNT grouped by the key before the join.',
          lessons: ['sql-and-queries', 'dimensional-modeling'],
        },
        {
          q: 'What is the difference between WHERE and HAVING?',
          answer: 'WHERE filters rows before grouping. HAVING filters groups after the aggregation. Filter early with WHERE when you can, because less data reaches the GROUP BY.',
          lessons: ['sql-and-queries'],
        },
      ],
    },
    {
      topic: 'Modelling',
      items: [
        {
          q: 'A customer moves city. How do reports show the old city for old orders?',
          answer: 'A Type 2 dimension: a new row for each version, with valid_from, valid_to and a surrogate key. Each fact row stores the key of the version that was valid on its date.',
          lessons: ['scd'],
        },
        {
          q: 'Star schema or one wide table?',
          answer: 'A star schema keeps each fact once and makes dimensions easy to change. A wide table is fast and simple to query but repeats data. Many teams model a star and publish wide tables on top of it.',
          lessons: ['dimensional-modeling', 'modeling-styles'],
        },
      ],
    },
    {
      topic: 'Pipelines',
      items: [
        {
          q: 'A daily job failed for three days. How do you recover?',
          answer: 'Fix the cause, then rerun each missed day in order. This is safe only if the job is idempotent: a rerun replaces that day, it does not add to it. Say how you check the result.',
          lessons: ['idempotency', 'backfills'],
        },
        {
          q: 'Exactly-once delivery: is it possible?',
          answer: 'Delivery is at least once in practice. You get the effect of exactly once with idempotent writes or deduplication on a key. Say where the duplicate is removed.',
          lessons: ['delivery-semantics', 'idempotency'],
        },
        {
          q: 'A Spark job is slow. Where do you look first?',
          answer: 'The Spark UI: find the slow stage, then look for skew (one task much longer than the rest), large shuffles and spills to disk. Then partition sizes and the join strategy.',
          lessons: ['spark-job-anatomy', 'spark-tuning', 'worked-slow-query'],
        },
      ],
    },
  ],
  gotchas: [
    {
      title: 'A rerun doubles the data',
      why: 'The job appends rows. When it runs twice for the same day, every number for that day is twice too high, and nobody sees it at once.',
      instead: 'Write each run to its own partition and overwrite it, or merge on a key. Test by running the job twice.',
      lessons: ['idempotency'],
    },
    {
      title: 'Time zones and late data',
      why: 'Events arrive late or carry local time. Yesterday’s totals change after you published them, or rows fall into the wrong day.',
      instead: 'Store UTC. Decide how late data is handled, and reprocess a few days back on each run.',
      lessons: ['windows-and-time', 'incremental-loading'],
    },
    {
      title: 'A source changes without warning',
      why: 'A column is renamed upstream. The pipeline still runs, but a field is now empty in every report.',
      instead: 'Check the schema and the row counts at the start of the pipeline, and stop loudly when they change.',
      lessons: ['schema-evolution', 'data-quality'],
    },
    {
      title: 'A green pipeline with wrong numbers',
      why: 'Success only means the code did not crash. The data can still be empty, duplicated or stale.',
      instead: 'Add tests on the data: not null, unique keys, freshness, and totals that match the source.',
      lessons: ['data-quality', 'observability-lineage'],
    },
    {
      title: 'Build first, ask later',
      why: 'A table is built to a guess of what the business wants. It is correct, and nobody uses it.',
      instead: 'Ask which decision the data supports and who makes it. Agree on the definition of each metric before you build.',
      lessons: ['stakeholders-requirements', 'semantic-layer'],
    },
    {
      title: 'The surprise cloud bill',
      why: 'A query scans a full table each hour, or a cluster stays on all weekend.',
      instead: 'Partition and cluster large tables, set budgets and alerts, and look at the cost of a new job in its first week.',
      lessons: ['cost-performance', 'partitioning'],
    },
  ],
  practice: [
    ['DataLemur', 'https://datalemur.com/', 'SQL interview questions from real companies, with answers.'],
    ['LeetCode SQL 50', 'https://leetcode.com/studyplan/top-sql-50/', 'A short, ordered set of SQL problems.'],
    ['Data Engineering Zoomcamp', 'https://github.com/DataTalksClub/data-engineering-zoomcamp', 'A free course with a project to show in interviews.'],
    ['Designing Data-Intensive Applications', 'https://dataintensive.net/', 'The book behind most system design questions.'],
  ],
}

export const INTERVIEWS: Record<SubjectId, InterviewGuide> = {
  data: DATA_INTERVIEWS,
  software: SOFTWARE_INTERVIEWS,
  ai: AI_INTERVIEWS,
}
