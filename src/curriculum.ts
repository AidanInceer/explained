export type TrackId =
  | 'foundations'
  | 'storage'
  | 'modeling'
  | 'pipelines'
  | 'processing'
  | 'ops'
  | 'architecture'

export interface Track {
  id: TrackId
  name: string
  blurb: string
  color: string
}

export interface Lesson {
  id: string
  track: TrackId
  title: string
  summary: string
  level: 'core' | 'deeper'
  minutes: number
  prereqs: string[]
  refs: [SourceId, string][]
}

export type SourceId =
  | 'fode'
  | 'ddia'
  | 'kimball'
  | 'streaming'
  | 'wiki'
  | 'reddit'
  | 'log'
  | 'functional'
  | 'lakehouse'
  | 'mesh'
  | 'dremel'
  | 'dataflow'

export const SOURCES: Record<SourceId, { title: string; by: string; kind: string; url?: string; why: string }> = {
  fode: {
    title: 'Fundamentals of Data Engineering',
    by: 'Joe Reis and Matt Housley, O’Reilly, 2022',
    kind: 'Book',
    why: 'The lifecycle framing used across this site comes from here. Tool-neutral, and the best single overview of the job.',
  },
  ddia: {
    title: 'Designing Data-Intensive Applications',
    by: 'Martin Kleppmann, O’Reilly, 2017',
    kind: 'Book',
    why: 'How storage engines, encodings, replication, batch and stream systems work underneath. Read it when you want the mechanism, not the product.',
  },
  kimball: {
    title: 'The Data Warehouse Toolkit, 3rd edition',
    by: 'Ralph Kimball and Margy Ross, Wiley, 2013',
    kind: 'Book',
    why: 'The reference for dimensional modeling: facts, dimensions, grain, slowly changing dimensions.',
  },
  streaming: {
    title: 'Streaming Systems',
    by: 'Tyler Akidau, Slava Chernyak and Reuven Lax, O’Reilly, 2018',
    kind: 'Book',
    why: 'Event time, windows, watermarks and exactly-once, from the people who built Google’s Dataflow.',
  },
  wiki: {
    title: 'Data Engineering Wiki',
    by: 'Community maintained',
    kind: 'Website',
    url: 'https://dataengineering.wiki',
    why: 'Short, practical concept pages and tool comparisons, kept current by working engineers.',
  },
  reddit: {
    title: 'r/dataengineering',
    by: 'Reddit community and its wiki',
    kind: 'Community',
    url: 'https://www.reddit.com/r/dataengineering/',
    why: 'Where to check how a concept is used in real teams, and to read the learning-resources wiki.',
  },
  log: {
    title: 'The Log: What every software engineer should know about real-time data’s unifying abstraction',
    by: 'Jay Kreps, LinkedIn Engineering, 2013',
    kind: 'Essay',
    url: 'https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying',
    why: 'The essay behind Kafka. Explains why an append-only log is the base of streaming and change data capture.',
  },
  functional: {
    title: 'Functional Data Engineering: a modern paradigm for batch data processing',
    by: 'Maxime Beauchemin, 2018',
    kind: 'Essay',
    url: 'https://maximebeauchemin.medium.com/functional-data-engineering-a-modern-paradigm-for-batch-data-processing-2327ec32c42a',
    why: 'The clearest argument for idempotent, partition-overwriting batch jobs, by the creator of Airflow.',
  },
  lakehouse: {
    title: 'Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics',
    by: 'Armbrust, Ghodsi, Xin and Zaharia, CIDR 2021',
    kind: 'Paper',
    url: 'https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf',
    why: 'Defines the lakehouse and the reasons for it.',
  },
  mesh: {
    title: 'How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh',
    by: 'Zhamak Dehghani, martinfowler.com, 2019',
    kind: 'Essay',
    url: 'https://martinfowler.com/articles/data-monolith-to-mesh.html',
    why: 'The original data mesh article. Shorter than the book and enough to judge the idea.',
  },
  dremel: {
    title: 'Dremel: Interactive Analysis of Web-Scale Datasets',
    by: 'Melnik et al., Google, VLDB 2010',
    kind: 'Paper',
    url: 'https://research.google/pubs/dremel-interactive-analysis-of-web-scale-datasets-2/',
    why: 'The paper behind BigQuery and the nested columnar layout that Parquet uses.',
  },
  dataflow: {
    title: 'The Dataflow Model',
    by: 'Akidau et al., Google, VLDB 2015',
    kind: 'Paper',
    url: 'https://research.google/pubs/the-dataflow-model-a-practical-approach-to-balancing-correctness-latency-and-cost-in-massive-scale-unbounded-out-of-order-data-processing/',
    why: 'The model of windows, triggers and watermarks that Beam, Flink and Spark Structured Streaming follow.',
  },
}

export const TRACKS: Track[] = [
  { id: 'foundations', name: 'Foundations', blurb: 'What the job is and the two kinds of database work.', color: '#132029' },
  { id: 'storage', name: 'Storage', blurb: 'How bytes are laid out, and why layout decides speed and cost.', color: '#2456D6' },
  { id: 'modeling', name: 'Modeling', blurb: 'How to shape tables so people can ask questions of them.', color: '#7A3FD1' },
  { id: 'pipelines', name: 'Pipelines', blurb: 'How data moves from source systems, and how to make reruns safe.', color: '#0B8A78' },
  { id: 'processing', name: 'Processing', blurb: 'Many machines, and data that never stops arriving.', color: '#D0356F' },
  { id: 'ops', name: 'Operations', blurb: 'How to run pipelines on a schedule and trust the output.', color: '#B97700' },
  { id: 'architecture', name: 'Architecture', blurb: 'How the parts fit into a platform, and who owns what.', color: '#D8472B' },
]

export const BRANCH_TRACKS = TRACKS.filter((t) => t.id !== 'foundations')

export const LESSONS: Lesson[] = [
  // Foundations
  {
    id: 'what-is-de', track: 'foundations', level: 'core', minutes: 6, prereqs: [],
    title: 'What data engineers do',
    summary: 'Data engineers move data from the systems that create it to the people and programs that use it, and keep it correct on the way.',
    refs: [['fode', 'Ch. 1, Data Engineering Described'], ['wiki', 'FAQ: What is Data Engineering?'], ['reddit', 'Community wiki, “Getting started”']],
  },
  {
    id: 'lifecycle', track: 'foundations', level: 'core', minutes: 7, prereqs: ['what-is-de'],
    title: 'The data engineering lifecycle',
    summary: 'Generation, ingestion, transformation and serving, with storage under all of them. Every tool fits one of these stages.',
    refs: [['fode', 'Ch. 2, The Data Engineering Lifecycle']],
  },
  {
    id: 'oltp-olap', track: 'foundations', level: 'core', minutes: 7, prereqs: ['lifecycle'],
    title: 'OLTP and OLAP',
    summary: 'Applications read and write a few rows at a time. Analysis reads millions of rows and a few columns. One database design cannot do both well.',
    refs: [['ddia', 'Ch. 3, “Transaction Processing or Analytics?”'], ['fode', 'Ch. 5, Data Generation in Source Systems']],
  },
  // Storage
  {
    id: 'row-vs-column', track: 'storage', level: 'core', minutes: 8, prereqs: ['oltp-olap'],
    title: 'Row and column storage',
    summary: 'A row store keeps each record together. A column store keeps each column together, so analytic queries read less and compress better.',
    refs: [['ddia', 'Ch. 3, “Column-Oriented Storage”'], ['dremel', 'Sections 4 and 5']],
  },
  {
    id: 'file-formats', track: 'storage', level: 'core', minutes: 8, prereqs: ['row-vs-column'],
    title: 'File formats',
    summary: 'CSV and JSON are for people and interchange. Avro is for rows in motion. Parquet is for analytics at rest.',
    refs: [['ddia', 'Ch. 4, Encoding and Evolution'], ['wiki', 'Concepts: Data serialization formats']],
  },
  {
    id: 'partitioning', track: 'storage', level: 'core', minutes: 8, prereqs: ['file-formats'],
    title: 'Partitioning and pruning',
    summary: 'Split a table into folders by a column such as date. A query with a filter on that column skips every other folder.',
    refs: [['fode', 'Ch. 6, Storage'], ['ddia', 'Ch. 6, Partitioning']],
  },
  {
    id: 'warehouse-lake-lakehouse', track: 'storage', level: 'core', minutes: 9, prereqs: ['partitioning'],
    title: 'Warehouse, lake, lakehouse',
    summary: 'A warehouse is a managed analytic database. A lake is files in object storage. A lakehouse puts warehouse guarantees on lake files.',
    refs: [['fode', 'Ch. 3, Designing Good Data Architecture'], ['lakehouse', 'Whole paper, 8 pages']],
  },
  {
    id: 'table-formats', track: 'storage', level: 'deeper', minutes: 9, prereqs: ['warehouse-lake-lakehouse'],
    title: 'Open table formats',
    summary: 'Iceberg, Delta Lake and Hudi add a metadata layer over Parquet files. That layer gives atomic commits, schema changes and time travel.',
    refs: [['lakehouse', 'Section 3, metadata layers'], ['wiki', 'Concepts: Open table formats']],
  },
  // Modeling
  {
    id: 'normalization', track: 'modeling', level: 'core', minutes: 8, prereqs: ['oltp-olap'],
    title: 'Normalization',
    summary: 'Store each fact once. Normal forms remove the duplicates that cause update errors, at the cost of more joins.',
    refs: [['ddia', 'Ch. 2, Data Models and Query Languages'], ['fode', 'Ch. 8, “Data Modeling”']],
  },
  {
    id: 'dimensional-modeling', track: 'modeling', level: 'core', minutes: 10, prereqs: ['normalization'],
    title: 'Dimensional modeling',
    summary: 'Put measurements in fact tables and context in dimension tables. Declare the grain first. The result is the star schema.',
    refs: [['kimball', 'Ch. 1 and 2'], ['fode', 'Ch. 8, “Kimball”']],
  },
  {
    id: 'scd', track: 'modeling', level: 'core', minutes: 8, prereqs: ['dimensional-modeling'],
    title: 'Slowly changing dimensions',
    summary: 'When a customer moves city, do old orders show the old city or the new one? Type 1 overwrites. Type 2 keeps history.',
    refs: [['kimball', 'Ch. 5, “Slowly Changing Dimension Basics”']],
  },
  {
    id: 'modeling-styles', track: 'modeling', level: 'deeper', minutes: 9, prereqs: ['scd'],
    title: 'Inmon, Data Vault and wide tables',
    summary: 'Kimball is not the only approach. Each alternative moves the cost between load time, query time and change.',
    refs: [['fode', 'Ch. 8, “Inmon”, “Data Vault”, “Wide Denormalized Tables”'], ['reddit', 'Recurring threads: “Is Kimball still relevant?”']],
  },
  // Pipelines
  {
    id: 'etl-vs-elt', track: 'pipelines', level: 'core', minutes: 7, prereqs: ['oltp-olap'],
    title: 'ETL and ELT',
    summary: 'Both extract, transform and load. The difference is where the transform runs: before the warehouse, or inside it.',
    refs: [['fode', 'Ch. 7 and Ch. 8'], ['wiki', 'Concepts: ETL vs ELT']],
  },
  {
    id: 'incremental-loading', track: 'pipelines', level: 'core', minutes: 9, prereqs: ['etl-vs-elt'],
    title: 'Full and incremental loads',
    summary: 'Copy everything each run, or copy only what changed. Incremental loads need a reliable way to find the changes.',
    refs: [['fode', 'Ch. 7, Ingestion'], ['kimball', 'Ch. 19 and 20, ETL subsystems']],
  },
  {
    id: 'idempotency', track: 'pipelines', level: 'core', minutes: 8, prereqs: ['incremental-loading'],
    title: 'Idempotent pipelines',
    summary: 'A job is idempotent when running it twice gives the same result as running it once. This makes retries and backfills safe.',
    refs: [['functional', 'Whole essay'], ['fode', 'Ch. 7, “Idempotency” in ingestion considerations']],
  },
  {
    id: 'cdc', track: 'pipelines', level: 'deeper', minutes: 8, prereqs: ['incremental-loading'],
    title: 'Change data capture',
    summary: 'Read the database’s own transaction log and emit every insert, update and delete as an event.',
    refs: [['ddia', 'Ch. 11, “Change Data Capture”'], ['log', 'Part two, data integration']],
  },
  // Processing
  {
    id: 'distributed-processing', track: 'processing', level: 'core', minutes: 9, prereqs: ['oltp-olap'],
    title: 'Distributed batch processing',
    summary: 'Split the data into partitions, process them on many machines, and move rows between machines only when a join or group needs it.',
    refs: [['ddia', 'Ch. 10, Batch Processing'], ['fode', 'Ch. 8, “Batch Transformations”']],
  },
  {
    id: 'streaming-basics', track: 'processing', level: 'core', minutes: 9, prereqs: ['distributed-processing'],
    title: 'Streams and logs',
    summary: 'A stream is a table that never ends. Kafka stores it as an append-only log, split into partitions that consumers read at their own pace.',
    refs: [['log', 'Part one'], ['ddia', 'Ch. 11, “Partitioned Logs”']],
  },
  {
    id: 'windows-and-time', track: 'processing', level: 'core', minutes: 9, prereqs: ['streaming-basics'],
    title: 'Windows, event time and watermarks',
    summary: 'To aggregate an endless stream you cut it into windows. Events arrive late, so you must choose which clock to trust and how long to wait.',
    refs: [['streaming', 'Ch. 1 to 3'], ['dataflow', 'Sections 1 and 2']],
  },
  {
    id: 'delivery-semantics', track: 'processing', level: 'deeper', minutes: 8, prereqs: ['windows-and-time', 'idempotency'],
    title: 'Delivery guarantees',
    summary: 'At-most-once can lose data. At-least-once can duplicate it. Exactly-once is at-least-once plus a way to remove the duplicates.',
    refs: [['streaming', 'Ch. 5, Exactly-Once and Side Effects'], ['ddia', 'Ch. 11, “Fault Tolerance”']],
  },
  // Operations
  {
    id: 'orchestration', track: 'ops', level: 'core', minutes: 8, prereqs: ['oltp-olap'],
    title: 'Orchestration and DAGs',
    summary: 'An orchestrator runs tasks in dependency order, retries failures and records what happened. The dependency graph is a DAG.',
    refs: [['fode', 'Ch. 2, “Orchestration” undercurrent'], ['wiki', 'Concepts: Orchestration']],
  },
  {
    id: 'data-quality', track: 'ops', level: 'core', minutes: 8, prereqs: ['orchestration'],
    title: 'Data quality and testing',
    summary: 'Code tests check the logic. Data tests check the rows that arrived today. You need both, and the data tests must be able to stop the pipeline.',
    refs: [['fode', 'Ch. 2, “DataOps” undercurrent'], ['wiki', 'Concepts: Data quality']],
  },
  {
    id: 'observability-lineage', track: 'ops', level: 'deeper', minutes: 8, prereqs: ['data-quality'],
    title: 'Observability, lineage and contracts',
    summary: 'Know when data is late or wrong before a user does, trace which tables are affected, and agree with producers on what will not change.',
    refs: [['fode', 'Ch. 2, “DataOps” and “Data Management”'], ['reddit', 'Recurring threads on data contracts']],
  },
  // Architecture
  {
    id: 'architecture-patterns', track: 'architecture', level: 'core', minutes: 9, prereqs: ['oltp-olap'],
    title: 'Medallion, Lambda and Kappa',
    summary: 'Three common shapes for a platform: layers of refinement, a batch path next to a stream path, or streams only.',
    refs: [['fode', 'Ch. 3, Designing Good Data Architecture'], ['ddia', 'Ch. 12, “The Lambda Architecture”']],
  },
  {
    id: 'governance-security', track: 'architecture', level: 'core', minutes: 8, prereqs: ['architecture-patterns'],
    title: 'Governance and security',
    summary: 'Know what data you hold, who can see it, and how long you keep it. Give each user and job the least access that works.',
    refs: [['fode', 'Ch. 10, Security and Privacy'], ['fode', 'Ch. 2, “Data Management” undercurrent']],
  },
  {
    id: 'data-mesh', track: 'architecture', level: 'deeper', minutes: 8, prereqs: ['governance-security'],
    title: 'Data mesh',
    summary: 'An organisation design, not a tool. The teams that produce data own it as a product, on a shared self-serve platform.',
    refs: [['mesh', 'Whole article'], ['fode', 'Ch. 3, “Data Mesh”']],
  },
]

export const lessonById = Object.fromEntries(LESSONS.map((l) => [l.id, l]))
export const trackById = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<TrackId, Track>
export const lessonsOf = (t: TrackId) => LESSONS.filter((l) => l.track === t)
export const dependents = (id: string) => LESSONS.filter((l) => l.prereqs.includes(id))
