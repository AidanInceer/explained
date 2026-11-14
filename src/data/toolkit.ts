/**
 * Content of each subject's Toolkit page: languages and tools to know, and the abilities of a good practitioner.
 * Data engineering is here; software engineering and AI are in toolkit-software.ts and toolkit-ai.ts.
 * Lesson ids in `lessons` and in the skill items must be written or planned lessons (the tests check this).
 * A planned lesson with no text shows as its title, with no link.
 */
import type { SubjectId } from './tracks.ts'
import { SOFTWARE_TOOLKIT } from './toolkit-software.ts'
import { AI_TOOLKIT } from './toolkit-ai.ts'

export type Level = 'Essential' | 'Important' | 'For some roles'

export interface Lang {
  name: string
  level: Level
  use: string
  first: string[]
  links: [string, string][]
  lessons?: string[]
}

const LANGS: Lang[] = [
  {
    name: 'SQL',
    level: 'Essential',
    use: 'The language of every warehouse, of dbt, and of most transformation and analysis. If you learn one thing well, learn this.',
    first: ['Joins, and how a join can multiply rows', 'GROUP BY, and window functions', 'CTEs to keep a query readable', 'MERGE and other statements that change data', 'How to read a query plan'],
    links: [
      ['PostgreSQL tutorial', 'https://www.postgresql.org/docs/current/tutorial.html'],
      ['SQLBolt, interactive lessons', 'https://sqlbolt.com'],
      ['Mode SQL tutorial', 'https://mode.com/sql-tutorial'],
    ],
    lessons: ['sql-and-queries', 'merge-patterns', 'query-engines'],
  },
  {
    name: 'Python',
    level: 'Essential',
    use: 'Extraction code, orchestrator DAGs, tests, small tools, and everything that SQL does not fit.',
    first: ['Functions, modules and virtual environments', 'HTTP requests, JSON and files', 'Tests with pytest', 'Type hints', 'DataFrames with pandas or Polars'],
    links: [
      ['The Python tutorial', 'https://docs.python.org/3/tutorial/'],
      ['pytest documentation', 'https://docs.pytest.org'],
      ['Polars user guide', 'https://docs.pola.rs'],
    ],
    lessons: ['api-extract-worked', 'software-engineering'],
  },
  {
    name: 'Git',
    level: 'Essential',
    use: 'Every change to a pipeline goes through it: branches, commits, pull requests, and going back to an earlier version.',
    first: ['Commit, branch, merge', 'Pull requests and review', 'How to undo: revert and reset', 'Resolve a merge conflict', '.gitignore, and why secrets never go in'],
    links: [
      ['Pro Git, the free book', 'https://git-scm.com/book/en/v2'],
      ['Learn Git Branching, interactive', 'https://learngitbranching.js.org'],
    ],
    lessons: ['software-engineering', 'sdlc'],
  },
  {
    name: 'The command line and Bash',
    level: 'Important',
    use: 'Servers, containers and CI jobs are all operated from a shell. You read logs, move files and connect small tools.',
    first: ['Navigate, and read and search files: ls, cd, cat, grep, less', 'Pipes and redirection', 'Environment variables', 'SSH, curl, and jq for JSON', 'Read and write a short script'],
    links: [
      ['The Missing Semester (MIT)', 'https://missing.csail.mit.edu'],
      ['Bash manual', 'https://www.gnu.org/software/bash/manual/'],
    ],
  },
  {
    name: 'PySpark',
    level: 'Important',
    use: 'Spark from Python, for data that is too large for one machine, and for most work on a lakehouse.',
    first: ['DataFrames: select, filter, join, groupBy', 'Lazy evaluation, and actions', 'Partitions and shuffles', 'Spark SQL, and when to use it in place of the DataFrame API', 'Read the Spark UI'],
    links: [
      ['PySpark getting started', 'https://spark.apache.org/docs/latest/api/python/getting_started/index.html'],
      ['Spark SQL guide', 'https://spark.apache.org/docs/latest/sql-programming-guide.html'],
    ],
    lessons: ['spark-job-anatomy', 'spark-tuning', 'job-sizing'],
  },
  {
    name: 'YAML, JSON and Jinja',
    level: 'Important',
    use: 'Not programming languages, but you write them daily: configuration for dbt, CI, orchestrators and Kubernetes, and templates inside dbt SQL.',
    first: ['YAML indentation, lists and maps', 'JSON, and JSON Schema to validate it', 'Jinja variables, loops and macros in dbt'],
    links: [
      ['YAML specification and overview', 'https://yaml.org'],
      ['Jinja documentation', 'https://jinja.palletsprojects.com'],
      ['Jinja and macros in dbt', 'https://docs.getdbt.com/docs/build/jinja-macros'],
    ],
    lessons: ['transformation-dbt'],
  },
  {
    name: 'Terraform (HCL)',
    level: 'Important',
    use: 'Describes cloud resources, permissions and warehouses in files. The usual way to create and change infrastructure.',
    first: ['Providers, resources and variables', 'plan and apply', 'State, and why it must be shared and safe', 'Modules to reuse a definition', 'One definition for several environments'],
    links: [
      ['Terraform tutorials', 'https://developer.hashicorp.com/terraform/tutorials'],
      ['Terraform language reference', 'https://developer.hashicorp.com/terraform/language'],
    ],
    lessons: ['environments-iac', 'cloud-basics'],
  },
  {
    name: 'Docker',
    level: 'Important',
    use: 'Packs code with its libraries, so that it runs the same on a laptop, in CI and in production.',
    first: ['Images and containers', 'Write a Dockerfile', 'Volumes and environment variables', 'Docker Compose, to run a database and a tool together on your machine'],
    links: [['Docker get started', 'https://docs.docker.com/get-started/']],
    lessons: ['environments-iac'],
  },
  {
    name: 'Scala and Java',
    level: 'For some roles',
    use: 'Spark, Flink and Kafka are written in them. You need them for Kafka Streams, for Flink jobs in code, and to read the engines’ own source.',
    first: ['Enough to read a stack trace from the JVM', 'Case classes and collections in Scala', 'Build tools: Maven, Gradle or sbt'],
    links: [
      ['Tour of Scala', 'https://docs.scala-lang.org/tour/tour-of-scala.html'],
      ['Learn Java', 'https://dev.java/learn/'],
    ],
    lessons: ['stream-engines'],
  },
  {
    name: 'Go',
    level: 'For some roles',
    use: 'Platform and infrastructure tools: Kubernetes, Terraform and many data tools are written in it. Useful for platform engineers and for fast services such as an event collector.',
    first: ['The tour of the language', 'Goroutines and channels', 'Build one small command-line tool'],
    links: [
      ['A Tour of Go', 'https://go.dev/tour/'],
      ['Effective Go', 'https://go.dev/doc/effective_go'],
    ],
  },
  {
    name: 'Rust',
    level: 'For some roles',
    use: 'Newer engines such as Polars and DataFusion are written in it. Needed only if you work on engines or on very fast components.',
    first: ['Read the book to chapter 10', 'Ownership and borrowing'],
    links: [['The Rust Programming Language', 'https://doc.rust-lang.org/book/']],
  },
]

export type SkillGroup = { group: string; lead: string; items: [string, string[]][] }

const SKILLS: SkillGroup[] = [
  {
    group: 'Build',
    lead: 'You can take a question to a table that answers it.',
    items: [
      ['Find the requirement behind a request: the decision, the grain, the freshness', ['stakeholders-requirements']],
      ['Write SQL that is correct at the grain, with no rows multiplied by a join', ['sql-and-queries', 'dimensional-modeling']],
      ['Model facts and dimensions, and keep history where it is needed', ['fact-table-types', 'scd', 'modeling-worked']],
      ['Make a load incremental and safe to run twice', ['incremental-loading', 'merge-patterns', 'idempotency']],
      ['Schedule it by data interval, with retries and a timeout', ['orchestration', 'scheduling-in-detail']],
      ['Test the logic and the data, and put the change through CI', ['data-quality', 'testing-ci-cd']],
    ],
  },
  {
    group: 'Operate',
    lead: 'You can keep it correct after the first day.',
    items: [
      ['Find why a number is wrong, by a method and not by guesses', ['debugging-pipelines']],
      ['Backfill history after a change, and handle late data', ['backfills']],
      ['Read a query plan and make a slow query fast', ['query-engines', 'worked-slow-query']],
      ['Know what the platform costs, and why', ['cost-performance']],
      ['Respond to an incident: contain, tell, restore, review', ['incidents-reliability']],
      ['Give each job its own identity and the least access', ['secrets-access', 'privacy-in-practice']],
    ],
  },
  {
    group: 'Decide',
    lead: 'You can choose, and say what the choice gives up.',
    items: [
      ['Batch, micro-batch or streaming, from the real need', ['batch-vs-streaming', 'stream-engines']],
      ['Which store and which engine, for which data and team', ['choosing-engine', 'lakehouse-or-warehouse']],
      ['A stack that the team can operate', ['choosing-a-stack', 'platform-evolution']],
      ['A whole design, tested against the ways it can fail', ['design-method', 'designing-for-failure']],
    ],
  },
  {
    group: 'Work with people',
    lead: 'You are someone that a team wants to keep.',
    items: [
      ['Give status before you are asked, and bad news early', ['working-day']],
      ['Review code well, and take review well', ['software-engineering']],
      ['Use AI tools to go faster, and still be able to explain every line', ['ai-for-data-engineering']],
      ['Have built and run something of your own', ['first-project', 'project-stack']],
    ],
  },
]

export const ORDER: Level[] = ['Essential', 'Important', 'For some roles']

export interface Toolkit {
  /** Text under the page title. */
  lead: string
  /** Heading of the first section: languages, or languages and libraries. */
  langsTitle: string
  langs: Lang[]
  /** One line under each level heading. */
  levelNotes: Record<Level, string>
  skillsTitle: string
  skillsNote: string
  skills: SkillGroup[]
}

const DATA_TOOLKIT: Toolkit = {
  lead: 'The map explains ideas. This page lists what you need in your hands: the languages that data engineers write, and the things that a useful colleague can do. Nobody knows all of it on the first day. The first three languages and the “Build” list are enough to start.',
  langsTitle: 'Languages',
  langs: LANGS,
  levelNotes: {
    Essential: 'You use these every day, in every data engineering job.',
    Important: 'Most jobs use most of these. Learn each one when a project needs it.',
    'For some roles': 'Depends on the team. Know what they are for. Learn them if your role needs them.',
  },
  skillsTitle: 'What a good data engineer can do',
  skillsNote: 'A list to measure yourself against, and to find the next lesson. Tools change each few years. These abilities do not.',
  skills: SKILLS,
}

export const TOOLKITS: Record<SubjectId, Toolkit> = { data: DATA_TOOLKIT, software: SOFTWARE_TOOLKIT, ai: AI_TOOLKIT }
