export type TrackId =
  | 'foundations'
  | 'storage'
  | 'modeling'
  | 'pipelines'
  | 'processing'
  | 'ops'
  | 'architecture'
  | 'designs'
  | 'build'

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
  /** Place on the map: [column inside the line's band, row]. */
  at: [number, number]
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
  | 'sre'
  | 'accelerate'
  | 'dbt'
  | 'kafka'
  | 'spark'
  | 'beam'
  | 'dbinternals'
  | 'mlsys'

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
  sre: {
    title: 'Site Reliability Engineering',
    by: 'Beyer, Jones, Petoff and Murphy (editors), Google, O’Reilly, 2016',
    kind: 'Book',
    url: 'https://sre.google/sre-book/table-of-contents/',
    why: 'Service level objectives, alerting, on-call and blameless postmortems. Written for services, and it applies to data pipelines with few changes.',
  },
  accelerate: {
    title: 'Accelerate',
    by: 'Nicole Forsgren, Jez Humble and Gene Kim, IT Revolution, 2018',
    kind: 'Book',
    why: 'The research behind small changes, automated tests and frequent releases. The reason to treat pipelines as software.',
  },
  dbt: {
    title: 'dbt documentation: How we structure our dbt projects',
    by: 'dbt Labs',
    kind: 'Website',
    url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview',
    why: 'The staging, intermediate and marts layout that most SQL transformation projects follow.',
  },
  kafka: {
    title: 'Kafka: The Definitive Guide, 2nd edition',
    by: 'Shapira, Palino, Sivaram and Petty, O’Reilly, 2021',
    kind: 'Book',
    why: 'How topics, partitions, consumer groups and delivery guarantees work in the most common log broker.',
  },
  spark: {
    title: 'Spark: The Definitive Guide',
    by: 'Bill Chambers and Matei Zaharia, O’Reilly, 2018',
    kind: 'Book',
    why: 'How Spark plans and runs a job: stages, shuffles, joins and the settings that matter.',
  },
  beam: {
    title: 'Agile Data Warehouse Design',
    by: 'Lawrence Corr with Jim Stagnitto, DecisionOne Press, 2011',
    kind: 'Book',
    why: 'A method to collect requirements with business people by modelling events with who, what, when, where, why and how questions.',
  },
  dbinternals: {
    title: 'Database Internals',
    by: 'Alex Petrov, O’Reilly, 2019',
    kind: 'Book',
    why: 'Storage engines, indexes and distributed databases in more depth than Designing Data-Intensive Applications.',
  },
  mlsys: {
    title: 'Designing Machine Learning Systems',
    by: 'Chip Huyen, O’Reilly, 2022',
    kind: 'Book',
    why: 'What machine learning needs from data: training data, features, and the difference between training and serving.',
  },
}

export const TRACKS: Track[] = [
  { id: 'foundations', name: 'Foundations', blurb: 'What the job is, who you do it for, and the engineering habits under all of it.', color: '#132029' },
  { id: 'storage', name: 'Storage', blurb: 'How bytes are laid out, and why layout decides speed and cost.', color: '#2456D6' },
  { id: 'modeling', name: 'Modeling', blurb: 'How to shape tables so people can ask questions of them.', color: '#7A3FD1' },
  { id: 'pipelines', name: 'Pipelines', blurb: 'How data moves from source systems, and how to make reruns safe.', color: '#0B8A78' },
  { id: 'processing', name: 'Processing', blurb: 'Many machines, and data that never stops arriving.', color: '#D0356F' },
  { id: 'architecture', name: 'Architecture', blurb: 'How the parts fit into a platform, and who owns what.', color: '#D8472B' },
  { id: 'ops', name: 'Operations', blurb: 'How to run pipelines on a schedule and trust the output.', color: '#B97700' },
  { id: 'designs', name: 'Worked designs', blurb: 'Six whole systems, each with a different shape, drawn step by step with the reasons for each choice.', color: '#4D7C0F' },
  { id: 'build', name: 'Build it yourself', blurb: 'How to practise with no employer and no budget: a small pipeline of your own, built in the right order.', color: '#B4530A' },
]

export const BRANCH_TRACKS = TRACKS.filter((t) => t.id !== 'foundations')

export const LESSONS: Lesson[] = [
  // Foundations
  {
    id: 'what-is-de', track: 'foundations', level: 'core', minutes: 6, prereqs: [], at: [2, 0],
    title: 'What data engineers do',
    summary: 'Data engineers move data from the systems that create it to the people and programs that use it, and keep it correct on the way.',
    refs: [['fode', 'Ch. 1, Data Engineering Described'], ['wiki', 'FAQ: What is Data Engineering?'], ['reddit', 'Community wiki, “Getting started”']],
  },
  {
    id: 'lifecycle', track: 'foundations', level: 'core', minutes: 7, prereqs: ['what-is-de'], at: [2, 1],
    title: 'The data engineering lifecycle',
    summary: 'Generation, ingestion, transformation and serving, with storage under all of them. Every tool fits one of these stages.',
    refs: [['fode', 'Ch. 2, The Data Engineering Lifecycle']],
  },
  {
    id: 'stakeholders-requirements', track: 'foundations', level: 'core', minutes: 10, prereqs: ['lifecycle'], at: [0, 2],
    title: 'Stakeholders and requirements',
    summary: 'A request such as “I need a sales dashboard” is not a requirement. Find the decision behind it, then the grain, freshness and accuracy it needs.',
    refs: [['beam', 'Part 1, modelstorming with the 7Ws'], ['kimball', 'Ch. 17, Kimball DW/BI Lifecycle Overview'], ['fode', 'Ch. 1, “Data engineers and other technical roles”, “Business leadership”']],
  },
  {
    id: 'source-systems', track: 'foundations', level: 'core', minutes: 8, prereqs: ['lifecycle'], at: [2, 2],
    title: 'Source systems and data shapes',
    summary: 'Data starts in application databases, APIs, files and event streams. Each source has a shape, a rate of change and an owner who is not you.',
    refs: [['fode', 'Ch. 5, Data Generation in Source Systems']],
  },
  {
    id: 'sql-and-queries', track: 'foundations', level: 'core', minutes: 10, prereqs: ['source-systems'], at: [1, 3],
    title: 'SQL, the working language',
    summary: 'SQL says what result you want, not how to compute it. Joins, grouping and window functions cover most of the daily work.',
    refs: [['fode', 'Ch. 8, “Queries”'], ['ddia', 'Ch. 2, “Query Languages for Data”']],
  },
  {
    id: 'oltp-olap', track: 'foundations', level: 'core', minutes: 7, prereqs: ['source-systems'], at: [2, 3],
    title: 'OLTP and OLAP',
    summary: 'Applications read and write a few rows at a time. Analysis reads millions of rows and a few columns. One database design cannot do both well.',
    refs: [['ddia', 'Ch. 3, “Transaction Processing or Analytics?”'], ['fode', 'Ch. 5, Data Generation in Source Systems']],
  },
  {
    id: 'batch-vs-streaming', track: 'foundations', level: 'core', minutes: 8, prereqs: ['source-systems'], at: [3, 3],
    title: 'Batch and streaming',
    summary: 'Batch processes a bounded set of data on a schedule. Streaming processes each event as it arrives. The choice is about how fresh the answer must be.',
    refs: [['fode', 'Ch. 7, “Batch versus streaming”'], ['streaming', 'Ch. 1, Streaming 101'], ['ddia', 'Ch. 10 and Ch. 11']],
  },
  {
    id: 'software-engineering', track: 'foundations', level: 'core', minutes: 9, prereqs: ['lifecycle'], at: [4, 2],
    title: 'Software engineering habits',
    summary: 'A pipeline is software. Version control, code review, tests and small functions apply to SQL and Python in the same way as to an application.',
    refs: [['fode', 'Ch. 2, “Software Engineering” undercurrent'], ['accelerate', 'Part 1, the technical practices']],
  },
  {
    id: 'sdlc', track: 'foundations', level: 'core', minutes: 9, prereqs: ['software-engineering'], at: [4, 3],
    title: 'How work is delivered: the SDLC',
    summary: 'Plan, build, test, review, release, operate. Data work follows the same loop, with one addition: the data changes even when the code does not.',
    refs: [['accelerate', 'Ch. 2 and Ch. 4, delivery performance and technical practices'], ['fode', 'Ch. 2, “DataOps” undercurrent']],
  },
  // Storage
  {
    id: 'row-vs-column', track: 'storage', level: 'core', minutes: 8, prereqs: ['oltp-olap'], at: [0, 0],
    title: 'Row and column storage',
    summary: 'A row store keeps each record together. A column store keeps each column together, so analytic queries read less and compress better.',
    refs: [['ddia', 'Ch. 3, “Column-Oriented Storage”'], ['dremel', 'Sections 4 and 5']],
  },
  {
    id: 'operational-stores', track: 'storage', level: 'core', minutes: 9, prereqs: ['row-vs-column'], at: [1, 1],
    title: 'Key-value, document and other stores',
    summary: 'Relational is the default. Key-value, document, wide-column, search, time-series and vector stores each give up something to be fast at one access pattern.',
    refs: [['ddia', 'Ch. 2, Data Models and Query Languages'], ['fode', 'Ch. 5, “Source system practical details”'], ['dbinternals', 'Part I, Storage Engines']],
  },
  {
    id: 'file-formats', track: 'storage', level: 'core', minutes: 8, prereqs: ['row-vs-column'], at: [0, 1],
    title: 'File formats',
    summary: 'CSV and JSON are for people and interchange. Avro is for rows in motion. Parquet is for analytics at rest.',
    refs: [['ddia', 'Ch. 4, Encoding and Evolution'], ['wiki', 'Concepts: Data serialization formats']],
  },
  {
    id: 'partitioning', track: 'storage', level: 'core', minutes: 8, prereqs: ['file-formats'], at: [0, 2],
    title: 'Partitioning and pruning',
    summary: 'Split a table into folders by a column such as date. A query with a filter on that column skips every other folder.',
    refs: [['fode', 'Ch. 6, Storage'], ['ddia', 'Ch. 6, Partitioning']],
  },
  {
    id: 'clustering', track: 'storage', level: 'deeper', minutes: 8, prereqs: ['partitioning'], at: [1, 3],
    title: 'Sorting, clustering and indexes',
    summary: 'Inside a partition, sorted data lets the engine skip files by their minimum and maximum values. This is the analytic replacement for an index.',
    refs: [['ddia', 'Ch. 3, “Sort Order in Column Storage”'], ['dbinternals', 'Part I, B-Trees and LSM trees']],
  },
  {
    id: 'object-storage', track: 'storage', level: 'core', minutes: 7, prereqs: ['partitioning'], at: [0, 3],
    title: 'Object storage',
    summary: 'S3, GCS and Azure Blob store files under keys, at low cost and without a size limit. They are not file systems, and the differences matter.',
    refs: [['fode', 'Ch. 6, “Object storage”']],
  },
  {
    id: 'warehouse-lake-lakehouse', track: 'storage', level: 'core', minutes: 9, prereqs: ['object-storage'], at: [0, 4],
    title: 'Warehouse, lake, lakehouse',
    summary: 'A warehouse is a managed analytic database. A lake is files in object storage. A lakehouse puts warehouse guarantees on lake files.',
    refs: [['fode', 'Ch. 3, Designing Good Data Architecture'], ['lakehouse', 'Whole paper, 8 pages']],
  },
  {
    id: 'table-formats', track: 'storage', level: 'deeper', minutes: 9, prereqs: ['warehouse-lake-lakehouse'], at: [0, 5],
    title: 'Open table formats',
    summary: 'Iceberg, Delta Lake and Hudi add a metadata layer over Parquet files. That layer gives atomic commits, schema changes and time travel.',
    refs: [['lakehouse', 'Section 3, metadata layers'], ['wiki', 'Concepts: Open table formats']],
  },
  {
    id: 'choosing-engine', track: 'storage', level: 'core', minutes: 10, prereqs: ['warehouse-lake-lakehouse'], at: [1, 5],
    title: 'Choosing an analytic engine',
    summary: 'Postgres, DuckDB, BigQuery, Snowflake, Redshift, Databricks, ClickHouse. What each one is, and which fits which size of data and team.',
    refs: [['fode', 'Ch. 4, Choosing Technologies Across the Data Engineering Lifecycle'], ['reddit', 'Recurring threads: “Snowflake or BigQuery or Databricks?”']],
  },
  // Modeling
  {
    id: 'data-model-levels', track: 'modeling', level: 'core', minutes: 8, prereqs: ['stakeholders-requirements'], at: [1, 0],
    title: 'Conceptual, logical, physical',
    summary: 'Model in three steps: the business things and how they relate, then tables and keys, then types, partitions and engine details.',
    refs: [['fode', 'Ch. 8, “Conceptual, logical, and physical data models”'], ['beam', 'Part 1, modelling business events']],
  },
  {
    id: 'normalization', track: 'modeling', level: 'core', minutes: 8, prereqs: ['oltp-olap', 'sql-and-queries'], at: [0, 0],
    title: 'Normalization',
    summary: 'Store each fact once. Normal forms remove the duplicates that cause update errors, at the cost of more joins.',
    refs: [['ddia', 'Ch. 2, Data Models and Query Languages'], ['fode', 'Ch. 8, “Data Modeling”']],
  },
  {
    id: 'dimensional-modeling', track: 'modeling', level: 'core', minutes: 10, prereqs: ['normalization', 'data-model-levels'], at: [0, 1],
    title: 'Dimensional modeling',
    summary: 'Put measurements in fact tables and context in dimension tables. Declare the grain first. The result is the star schema.',
    refs: [['kimball', 'Ch. 1 and 2'], ['fode', 'Ch. 8, “Kimball”']],
  },
  {
    id: 'fact-table-types', track: 'modeling', level: 'core', minutes: 9, prereqs: ['dimensional-modeling'], at: [1, 2],
    title: 'Three kinds of fact table',
    summary: 'Transaction facts record events. Periodic snapshots record a level at regular times. Accumulating snapshots follow one thing through a process.',
    refs: [['kimball', 'Ch. 4, Inventory: the three fact table types'], ['kimball', 'Ch. 2, “Basic Fact Table Techniques”']],
  },
  {
    id: 'scd', track: 'modeling', level: 'core', minutes: 8, prereqs: ['dimensional-modeling'], at: [0, 2],
    title: 'Slowly changing dimensions',
    summary: 'When a customer moves city, do old orders show the old city or the new one? Type 1 overwrites. Type 2 keeps history.',
    refs: [['kimball', 'Ch. 5, “Slowly Changing Dimension Basics”']],
  },
  {
    id: 'semantic-layer', track: 'modeling', level: 'deeper', minutes: 8, prereqs: ['fact-table-types'], at: [1, 3],
    title: 'Metrics and the semantic layer',
    summary: 'Two dashboards show two revenue numbers. A semantic layer defines each metric once, and every tool reads that definition.',
    refs: [['fode', 'Ch. 9, “Semantic and metrics layers”'], ['reddit', 'Recurring threads on metrics layers']],
  },
  {
    id: 'modeling-styles', track: 'modeling', level: 'deeper', minutes: 9, prereqs: ['scd'], at: [0, 3],
    title: 'Inmon, Data Vault and wide tables',
    summary: 'Kimball is not the only approach. Each alternative moves the cost between load time, query time and change.',
    refs: [['fode', 'Ch. 8, “Inmon”, “Data Vault”, “Wide Denormalized Tables”'], ['reddit', 'Recurring threads: “Is Kimball still relevant?”']],
  },
  {
    id: 'schema-evolution', track: 'modeling', level: 'deeper', minutes: 9, prereqs: ['modeling-styles', 'file-formats'], at: [0, 4],
    title: 'Schema evolution',
    summary: 'Columns are added, renamed and removed while old data and old readers still exist. Some changes are safe and some break every consumer.',
    refs: [['ddia', 'Ch. 4, Encoding and Evolution'], ['fode', 'Ch. 7, “Schema evolution”']],
  },
  // Pipelines
  {
    id: 'etl-vs-elt', track: 'pipelines', level: 'core', minutes: 7, prereqs: ['oltp-olap'], at: [0, 0],
    title: 'ETL and ELT',
    summary: 'Both extract, transform and load. The difference is where the transform runs: before the warehouse, or inside it.',
    refs: [['fode', 'Ch. 7 and Ch. 8'], ['wiki', 'Concepts: ETL vs ELT']],
  },
  {
    id: 'ingestion-patterns', track: 'pipelines', level: 'core', minutes: 10, prereqs: ['etl-vs-elt'], at: [0, 1],
    title: 'Ways to ingest data',
    summary: 'Query the database, read its log, call an API, collect files, or receive events. Each source type has one method that fits it best.',
    refs: [['fode', 'Ch. 7, Ingestion'], ['wiki', 'Concepts: Data ingestion']],
  },
  {
    id: 'transformation-dbt', track: 'pipelines', level: 'core', minutes: 10, prereqs: ['etl-vs-elt'], at: [1, 1],
    title: 'SQL transformations and dbt',
    summary: 'Each model is one SELECT statement in a file. The tool works out the order, builds the tables, runs the tests and writes the documentation.',
    refs: [['dbt', 'Guide overview, staging, intermediate and marts'], ['fode', 'Ch. 8, “Transformations”']],
  },
  {
    id: 'serving-reverse-etl', track: 'pipelines', level: 'core', minutes: 8, prereqs: ['transformation-dbt'], at: [1, 2],
    title: 'Serving data and reverse ETL',
    summary: 'Data has value only when it is used. Dashboards, extracts, APIs, machine learning and writes back into business tools each need a different delivery.',
    refs: [['fode', 'Ch. 9, Serving Data for Analytics, Machine Learning, and Reverse ETL']],
  },
  {
    id: 'incremental-loading', track: 'pipelines', level: 'core', minutes: 9, prereqs: ['ingestion-patterns'], at: [0, 2],
    title: 'Full and incremental loads',
    summary: 'Copy everything each run, or copy only what changed. Incremental loads need a reliable way to find the changes.',
    refs: [['fode', 'Ch. 7, Ingestion'], ['kimball', 'Ch. 19 and 20, ETL subsystems']],
  },
  {
    id: 'idempotency', track: 'pipelines', level: 'core', minutes: 8, prereqs: ['incremental-loading'], at: [0, 3],
    title: 'Idempotent pipelines',
    summary: 'A job is idempotent when running it twice gives the same result as running it once. This makes retries and backfills safe.',
    refs: [['functional', 'Whole essay'], ['fode', 'Ch. 7, “Idempotency” in ingestion considerations']],
  },
  {
    id: 'cdc', track: 'pipelines', level: 'deeper', minutes: 8, prereqs: ['incremental-loading'], at: [1, 3],
    title: 'Change data capture',
    summary: 'Read the database’s own transaction log and emit every insert, update and delete as an event.',
    refs: [['ddia', 'Ch. 11, “Change Data Capture”'], ['log', 'Part two, data integration']],
  },
  {
    id: 'backfills', track: 'pipelines', level: 'deeper', minutes: 8, prereqs: ['idempotency'], at: [0, 4],
    title: 'Backfills and late data',
    summary: 'A backfill runs a pipeline again for past dates, after a defect or a logic change. Late data is the same problem, arriving every day.',
    refs: [['functional', 'Sections on immutable partitions and backfills'], ['fode', 'Ch. 7, “Late-arriving data”']],
  },
  // Processing
  {
    id: 'distributed-processing', track: 'processing', level: 'core', minutes: 9, prereqs: ['partitioning', 'sql-and-queries'], at: [0, 0],
    title: 'Distributed batch processing',
    summary: 'Split the data into partitions, process them on many machines, and move rows between machines only when a join or group needs it.',
    refs: [['ddia', 'Ch. 10, Batch Processing'], ['fode', 'Ch. 8, “Batch Transformations”']],
  },
  {
    id: 'query-engines', track: 'processing', level: 'deeper', minutes: 10, prereqs: ['spark-job-anatomy'], at: [0, 2],
    title: 'How an engine runs a query',
    summary: 'The engine parses the SQL, makes a plan, and chooses a join method from table sizes. Reading the plan tells you why a query is slow.',
    refs: [['fode', 'Ch. 8, “The life of a query”, “The query optimizer”'], ['spark', 'Part II, structured API execution'], ['ddia', 'Ch. 10, “Reduce-Side Joins”, “Map-Side Joins”']],
  },
  {
    id: 'spark-tuning', track: 'processing', level: 'deeper', minutes: 9, prereqs: ['worked-slow-query'], at: [0, 4],
    title: 'Skew, shuffles and small files',
    summary: 'Most slow distributed jobs have one of four causes: a skewed key, too much shuffle, too little memory for a partition, or too many small files.',
    refs: [['spark', 'Part IV, performance tuning'], ['ddia', 'Ch. 10, “Handling skew”']],
  },
  {
    id: 'streaming-basics', track: 'processing', level: 'core', minutes: 9, prereqs: ['batch-vs-streaming'], at: [1, 0],
    title: 'Streams and logs',
    summary: 'A stream is a table that never ends. Kafka stores it as an append-only log, split into partitions that consumers read at their own pace.',
    refs: [['log', 'Part one'], ['ddia', 'Ch. 11, “Partitioned Logs”']],
  },
  {
    id: 'message-brokers', track: 'processing', level: 'core', minutes: 9, prereqs: ['streaming-basics'], at: [1, 1],
    title: 'Queues, logs and brokers',
    summary: 'A queue gives each message to one worker and then deletes it. A log keeps every message for all readers. Kafka, Kinesis, Pub/Sub, SQS and RabbitMQ differ on this point.',
    refs: [['ddia', 'Ch. 11, “Messaging Systems”'], ['kafka', 'Ch. 1, Meet Kafka']],
  },
  {
    id: 'windows-and-time', track: 'processing', level: 'core', minutes: 9, prereqs: ['message-brokers'], at: [1, 2],
    title: 'Windows, event time and watermarks',
    summary: 'To aggregate an endless stream you cut it into windows. Events arrive late, so you must choose which clock to trust and how long to wait.',
    refs: [['streaming', 'Ch. 1 to 3'], ['dataflow', 'Sections 1 and 2']],
  },
  {
    id: 'delivery-semantics', track: 'processing', level: 'deeper', minutes: 8, prereqs: ['windows-and-time', 'idempotency'], at: [1, 3],
    title: 'Delivery guarantees',
    summary: 'At-most-once can lose data. At-least-once can duplicate it. Exactly-once is at-least-once plus a way to remove the duplicates.',
    refs: [['streaming', 'Ch. 5, Exactly-Once and Side Effects'], ['ddia', 'Ch. 11, “Fault Tolerance”']],
  },
  {
    id: 'stream-engines', track: 'processing', level: 'deeper', minutes: 9, prereqs: ['delivery-semantics'], at: [1, 4],
    title: 'Stream processing engines',
    summary: 'Flink, Spark Structured Streaming, Kafka Streams and streaming databases all keep state and checkpoint it. They differ in latency, operations work and language.',
    refs: [['streaming', 'Ch. 7, The Practicalities of Persistent State'], ['ddia', 'Ch. 11, “Stream Processing”']],
  },
  // Architecture
  {
    id: 'architecture-patterns', track: 'architecture', level: 'core', minutes: 9, prereqs: ['warehouse-lake-lakehouse', 'streaming-basics'], at: [0, 1],
    title: 'Medallion, Lambda and Kappa',
    summary: 'Three common shapes for a platform: layers of refinement, a batch path next to a stream path, or streams only.',
    refs: [['fode', 'Ch. 3, Designing Good Data Architecture'], ['ddia', 'Ch. 12, “The Lambda Architecture”']],
  },
  {
    id: 'choosing-a-stack', track: 'architecture', level: 'core', minutes: 10, prereqs: ['architecture-patterns'], at: [1, 2],
    title: 'Choosing a stack',
    summary: 'The correct platform for five people is wrong for five hundred. Choose for the team and the latency you have, and plan what you will change later.',
    refs: [['fode', 'Ch. 4, Choosing Technologies Across the Data Engineering Lifecycle'], ['reddit', 'Recurring threads: “What stack for a small team?”']],
  },
  {
    id: 'governance-security', track: 'architecture', level: 'core', minutes: 8, prereqs: ['designing-for-failure'], at: [0, 4],
    title: 'Governance and security',
    summary: 'Know what data you hold, who can see it, and how long you keep it. Give each user and job the least access that works.',
    refs: [['fode', 'Ch. 10, Security and Privacy'], ['fode', 'Ch. 2, “Data Management” undercurrent']],
  },
  {
    id: 'data-for-ml', track: 'architecture', level: 'deeper', minutes: 9, prereqs: ['privacy-in-practice'], at: [0, 6],
    title: 'Data for machine learning and AI',
    summary: 'Models need point-in-time correct training data, the same features at training and at serving, and for language models a search index over documents.',
    refs: [['mlsys', 'Ch. 4, Training Data, and Ch. 5, Feature Engineering'], ['fode', 'Ch. 9, “Machine learning”']],
  },
  {
    id: 'data-mesh', track: 'architecture', level: 'deeper', minutes: 8, prereqs: ['governance-security'], at: [1, 5],
    title: 'Data mesh',
    summary: 'An organisation design, not a tool. The teams that produce data own it as a product, on a shared self-serve platform.',
    refs: [['mesh', 'Whole article'], ['fode', 'Ch. 3, “Data Mesh”']],
  },
  // Operations
  {
    id: 'orchestration', track: 'ops', level: 'core', minutes: 8, prereqs: ['etl-vs-elt'], at: [0, 0],
    title: 'Orchestration and DAGs',
    summary: 'An orchestrator runs tasks in dependency order, retries failures and records what happened. The dependency graph is a DAG.',
    refs: [['fode', 'Ch. 2, “Orchestration” undercurrent'], ['wiki', 'Concepts: Orchestration']],
  },
  {
    id: 'environments-iac', track: 'ops', level: 'core', minutes: 8, prereqs: ['sdlc'], at: [1, 0],
    title: 'Environments and infrastructure as code',
    summary: 'Development, staging and production are separate copies of the platform. Describe them in code so that they stay the same and can be rebuilt.',
    refs: [['fode', 'Ch. 2, “Infrastructure as code”, “Pipelines as code”'], ['accelerate', 'Ch. 4, technical practices']],
  },
  {
    id: 'data-quality', track: 'ops', level: 'core', minutes: 8, prereqs: ['scheduling-in-detail'], at: [0, 2],
    title: 'Data quality and testing',
    summary: 'Code tests check the logic. Data tests check the rows that arrived today. You need both, and the data tests must be able to stop the pipeline.',
    refs: [['fode', 'Ch. 2, “DataOps” undercurrent'], ['wiki', 'Concepts: Data quality']],
  },
  {
    id: 'testing-ci-cd', track: 'ops', level: 'core', minutes: 9, prereqs: ['environments-iac', 'orchestration'], at: [1, 1],
    title: 'CI/CD for pipelines',
    summary: 'Every change runs through automated checks before it reaches production: lint, unit tests, a build against sample data, and a comparison with the current output.',
    refs: [['accelerate', 'Ch. 4, continuous delivery'], ['dbt', 'Best practices'], ['fode', 'Ch. 2, “DataOps” undercurrent']],
  },
  {
    id: 'observability-lineage', track: 'ops', level: 'deeper', minutes: 8, prereqs: ['data-quality'], at: [0, 3],
    title: 'Observability, lineage and contracts',
    summary: 'Know when data is late or wrong before a user does, trace which tables are affected, and agree with producers on what will not change.',
    refs: [['fode', 'Ch. 2, “DataOps” and “Data Management”'], ['reddit', 'Recurring threads on data contracts']],
  },
  {
    id: 'incidents-reliability', track: 'ops', level: 'deeper', minutes: 8, prereqs: ['debugging-pipelines'], at: [0, 5],
    title: 'SLAs, incidents and on-call',
    summary: 'Agree how fresh and how correct each dataset must be, measure it, and have a practised response for the day it fails.',
    refs: [['sre', 'Ch. 4, Service Level Objectives'], ['sre', 'Ch. 15, Postmortem Culture: Learning from Failure']],
  },
  {
    id: 'cost-performance', track: 'ops', level: 'deeper', minutes: 9, prereqs: ['observability-lineage', 'clustering'], at: [1, 4],
    title: 'Cost and performance',
    summary: 'Cloud platforms charge for bytes scanned or for compute time. A small number of queries and tables cause most of the bill, and they can be found.',
    refs: [['fode', 'Ch. 4, “Cost optimization and business value”, “FinOps”'], ['reddit', 'Recurring threads on warehouse cost']],
  },
  // Worked designs
  {
    id: 'design-method', track: 'designs', level: 'core', minutes: 10, prereqs: ['choosing-a-stack', 'data-quality'], at: [2, 0],
    title: 'How to design a pipeline',
    summary: 'Work from the right side to the left: who uses the data and how fresh it must be, then the model, then the sources, then the simplest path between them.',
    refs: [['fode', 'Ch. 3, “Principles of good data architecture”'], ['ddia', 'Ch. 12, “Data Integration”'], ['kimball', 'Ch. 18, Dimensional Modeling Process and Tasks']],
  },
  {
    id: 'case-online-shop', track: 'designs', level: 'core', minutes: 12, prereqs: ['design-method', 'transformation-dbt'], at: [0, 1],
    title: 'Worked design: an online shop',
    summary: 'Orders, payments and shipments for a company with two data people. A managed batch ELT design, and what to change when the company grows.',
    refs: [['kimball', 'Ch. 3, Retail Sales, and Ch. 6, Order Management'], ['fode', 'Ch. 4, “Build versus buy”']],
  },
  {
    id: 'case-flight-booking', track: 'designs', level: 'deeper', minutes: 14, prereqs: ['design-method', 'cdc', 'fact-table-types'], at: [2, 1],
    title: 'Worked design: a flight booking system',
    summary: 'Bookings change many times before the flight leaves. A design with change data capture, a lakehouse, and a fact table that follows each booking.',
    refs: [['kimball', 'Ch. 12, Transportation'], ['ddia', 'Ch. 11, “Change Data Capture”'], ['fode', 'Ch. 3, Designing Good Data Architecture']],
  },
  {
    id: 'case-fraud-stream', track: 'designs', level: 'deeper', minutes: 12, prereqs: ['design-method', 'stream-engines'], at: [4, 1],
    title: 'Worked design: payment fraud checks',
    summary: 'A card payment must be scored in less than a second. A streaming design with state for each card, and a batch path that trains the model.',
    refs: [['streaming', 'Ch. 2 and Ch. 7'], ['mlsys', 'Ch. 7, “Batch prediction versus online prediction”'], ['ddia', 'Ch. 11, Stream Processing']],
  },
  {
    id: 'cloud-basics', track: 'foundations', level: 'core', minutes: 9, prereqs: ['lifecycle'], at: [3, 2],
    title: "Cloud basics",
    summary: "A cloud is rented compute, storage and network, with an identity system in front. Four ideas explain most of the bill and most of the access errors.",
    refs: [["fode","Ch. 4, “Location”, “Cost optimization”"],["fode","Ch. 6, Storage"]],
  },
  {
    id: 'working-day', track: 'foundations', level: 'core', minutes: 9, prereqs: ['stakeholders-requirements'], at: [0, 3],
    title: "The day-to-day work",
    summary: "Most of the job is not new pipelines. It is requests, failed runs, backfills, reviews, small changes and the messages that explain them.",
    refs: [["fode","Ch. 1, “Whom data engineers work with”"],["reddit","Recurring threads: “What does your day look like?”"],["sre","Ch. 5, Eliminating Toil"]],
  },
  {
    id: 'ai-for-data-engineering', track: 'foundations', level: 'core', minutes: 10, prereqs: ['sdlc'], at: [4, 4],
    title: "AI in data engineering work",
    summary: "Language models write and explain SQL, draft tests and documentation, and read logs. They also make confident errors, so the review habits matter more, not less.",
    refs: [["fode","Ch. 11, The Future of Data Engineering"],["reddit","Recurring threads on AI tools in data engineering work"]],
  },
  {
    id: 'table-maintenance', track: 'storage', level: 'deeper', minutes: 8, prereqs: ['table-formats'], at: [0, 6],
    title: "Table maintenance",
    summary: "Tables in a lakehouse need regular care: compact small files, remove old snapshots, delete files that nothing refers to, and keep statistics current.",
    refs: [["lakehouse","Section 3, metadata layers"],["wiki","Concepts: Open table formats"]],
  },
  {
    id: 'modeling-worked', track: 'modeling', level: 'core', minutes: 11, prereqs: ['semantic-layer'], at: [1, 4],
    title: "Worked example: model a subscription business",
    summary: "From five source tables to facts, dimensions and three metrics: monthly recurring revenue, churn and retention. Each decision is shown with its reason.",
    refs: [["kimball","Ch. 2, Kimball Dimensional Modeling Techniques Overview"],["kimball","Ch. 18, Dimensional Modeling Process and Tasks"]],
  },
  {
    id: 'merge-patterns', track: 'pipelines', level: 'core', minutes: 9, prereqs: ['idempotency'], at: [1, 4],
    title: "Merge, upsert and deduplicate",
    summary: "Four SQL patterns do most of the loading work: overwrite a partition, delete and insert, merge by key, and keep the latest row for each key.",
    refs: [["functional","Sections on immutable partitions"],["kimball","Ch. 19, ETL Subsystems and Techniques"]],
  },
  {
    id: 'api-extract-worked', track: 'pipelines', level: 'deeper', minutes: 10, prereqs: ['merge-patterns'], at: [1, 5],
    title: "Worked example: an API extract that survives",
    summary: "A small Python extract with pagination, rate limits, retries, a saved cursor and an idempotent load. Each part exists because of one specific failure.",
    refs: [["fode","Ch. 7, “APIs”, “Ingestion considerations”"]],
  },
  {
    id: 'spark-job-anatomy', track: 'processing', level: 'core', minutes: 9, prereqs: ['distributed-processing'], at: [0, 1],
    title: "Anatomy of a Spark job",
    summary: "Transformations build a plan and do nothing. An action runs it as jobs, stages and tasks. A stage ends at each shuffle.",
    refs: [["spark","Part II, structured APIs, and Ch. 15, How Spark Runs on a Cluster"],["ddia","Ch. 10, “Beyond MapReduce”"]],
  },
  {
    id: 'worked-slow-query', track: 'processing', level: 'deeper', minutes: 10, prereqs: ['query-engines'], at: [0, 3],
    title: "Worked example: a slow query made fast",
    summary: "One report query, from 14 minutes to 20 seconds in four changes. Each change is read from the plan first, then made, then measured.",
    refs: [["fode","Ch. 8, “Improving query performance”"],["spark","Part IV, performance tuning"]],
  },
  {
    id: 'job-sizing', track: 'processing', level: 'deeper', minutes: 8, prereqs: ['spark-tuning'], at: [0, 5],
    title: "Sizing a job: partitions, memory, cores",
    summary: "Simple arithmetic gives a first cluster size: data volume to partitions, partitions to tasks, tasks to cores and memory. Then measure and adjust.",
    refs: [["spark","Part IV, production applications and tuning"]],
  },
  {
    id: 'worked-streaming-window', track: 'processing', level: 'deeper', minutes: 10, prereqs: ['stream-engines'], at: [1, 5],
    title: "Worked example: one window, event by event",
    summary: "Eight events, two of them late, go through a one-minute window. The state, the watermark and the output are shown after each event.",
    refs: [["streaming","Ch. 2, The What, Where, When, and How of Data Processing"],["dataflow","Section 2"]],
  },
  {
    id: 'event-driven', track: 'architecture', level: 'core', minutes: 9, prereqs: ['architecture-patterns'], at: [0, 2],
    title: "Events, CDC and the outbox",
    summary: "A service must change its database and tell other systems about it. Two separate writes can disagree. The outbox pattern and CDC make them one.",
    refs: [["ddia","Ch. 11, “Keeping Systems in Sync”, “Event Sourcing”"],["log","Part two, data integration"]],
  },
  {
    id: 'designing-for-failure', track: 'architecture', level: 'core', minutes: 10, prereqs: ['event-driven'], at: [0, 3],
    title: "Designing for failure",
    summary: "Every part will fail at some time. Retries with backoff, timeouts, dead-letter queues, replay and a recovery plan decide if a failure is an event or an incident.",
    refs: [["ddia","Ch. 8, The Trouble with Distributed Systems"],["sre","Ch. 22, Addressing Cascading Failures"],["fode","Ch. 3, “Plan for failure”"]],
  },
  {
    id: 'privacy-in-practice', track: 'architecture', level: 'deeper', minutes: 9, prereqs: ['governance-security'], at: [0, 5],
    title: "Privacy in practice",
    summary: "A person asks to be deleted. You must find their data in every layer, every backup and every export. The design decides if this takes an hour or a month.",
    refs: [["fode","Ch. 10, Security and Privacy"],["ddia","Ch. 12, “Privacy and Tracking”"]],
  },
  {
    id: 'lakehouse-or-warehouse', track: 'architecture', level: 'core', minutes: 10, prereqs: ['choosing-a-stack'], at: [1, 3],
    title: "Warehouse or lakehouse: the decision",
    summary: "The same six questions, answered for three companies, give three different platforms. The method matters more than the answer.",
    refs: [["fode","Ch. 3, “Data warehouse”, “Data lake”, “Convergence”"],["lakehouse","Sections 1 and 2"]],
  },
  {
    id: 'platform-evolution', track: 'architecture', level: 'deeper', minutes: 10, prereqs: ['lakehouse-or-warehouse'], at: [1, 4],
    title: "How a platform grows, and how to migrate",
    summary: "Platforms pass through four stages as a company grows. Moving between them is a migration, and migrations fail in known ways.",
    refs: [["fode","Ch. 3, “Architect for scalability”, “Always be architecting”"],["ddia","Ch. 4, “Dataflow Through Databases”, on rolling changes"]],
  },
  {
    id: 'scheduling-in-detail', track: 'ops', level: 'core', minutes: 9, prereqs: ['orchestration'], at: [0, 1],
    title: "Scheduling in detail",
    summary: "Logical dates, catch-up, sensors, dependencies between DAGs, pools and timeouts. These settings cause most of the confusion in an orchestrator.",
    refs: [["fode","Ch. 2, “Orchestration” undercurrent"],["functional","Sections on reproducible, partitioned tasks"]],
  },
  {
    id: 'debugging-pipelines', track: 'ops', level: 'core', minutes: 10, prereqs: ['observability-lineage'], at: [0, 4],
    title: "How to debug a pipeline",
    summary: "A number is wrong. Work backward along the lineage, halve the search at each step, and compare a good day with a bad day.",
    refs: [["sre","Ch. 12, Effective Troubleshooting"],["fode","Ch. 2, “DataOps” undercurrent"]],
  },
  {
    id: 'secrets-access', track: 'ops', level: 'core', minutes: 8, prereqs: ['testing-ci-cd'], at: [1, 2],
    title: "Secrets and access for pipelines",
    summary: "A pipeline needs credentials for every system it touches. Give each job its own identity, the least access that works, and no password in any file.",
    refs: [["fode","Ch. 10, Security and Privacy"]],
  },
  {
    id: 'case-clickstream', track: 'designs', level: 'core', minutes: 12, prereqs: ['design-method', 'streaming-basics'], at: [1, 1],
    title: "Worked design: product analytics from clicks",
    summary: "Events from a web and mobile application become sessions, funnels and a usage chart inside the product. One event stream serves batch and real-time users.",
    refs: [["kimball","Ch. 15, Electronic Commerce, on clickstream data"],["ddia","Ch. 11, Stream Processing"]],
  },
  {
    id: 'case-iot-telemetry', track: 'designs', level: 'deeper', minutes: 12, prereqs: ['design-method', 'windows-and-time'], at: [3, 1],
    title: "Worked design: sensor data from machines",
    summary: "Ten thousand machines send a reading each second, sometimes days late. A design with a gateway, a stream, downsampling and a time-series store.",
    refs: [["streaming","Ch. 2 and Ch. 3, windows and watermarks"],["fode","Ch. 5, “IoT devices and edge”"]],
  },
  {
    id: 'case-bank-reporting', track: 'designs', level: 'deeper', minutes: 12, prereqs: ['case-online-shop', 'scd'], at: [1, 2],
    title: "Worked design: a regulatory report at a bank",
    summary: "Nobody needs it fast. Everybody needs it exact, explained and repeatable two years later. A batch design built around audit, history and reconciliation.",
    refs: [["kimball","Ch. 10, Financial Services"],["fode","Ch. 10, Security and Privacy"]],
  },
  {
    id: 'first-project', track: 'build', level: 'core', minutes: 6, prereqs: ['case-online-shop'], at: [0, 0],
    title: 'Start from something that annoys you',
    summary: 'You cannot practise at company scale, and you do not need to. Choose a problem of your own that data could improve. You will keep it running.',
    refs: [['reddit', 'Community wiki and recurring threads on portfolio projects'], ['wiki', 'Learning resources']],
  },
  {
    id: 'project-stack', track: 'build', level: 'core', minutes: 5, prereqs: ['first-project'], at: [1, 1],
    title: 'A free stack, and the order to build in',
    summary: 'DuckDB, dbt, Python, Git and a free scheduler are a complete stack at no cost. Go from end to end in days, then improve one part at a time.',
    refs: [['wiki', 'Learning resources'], ['dbt', 'Project structure, as used in the example stack']],
  },
  {
    id: 'project-with-ai', track: 'build', level: 'core', minutes: 5, prereqs: ['project-stack'], at: [2, 2],
    title: 'Use AI, and still learn',
    summary: 'An assistant can write the whole project in an afternoon. How to use it so that the knowledge stays with you, and what the project shows an employer.',
    refs: [['functional', 'Whole essay, for the habits to practise'], ['reddit', 'Recurring threads on portfolio projects']],
  },
]

// Order inside each line: top of the map first.
const trackOrder = TRACKS.map((t) => t.id)
LESSONS.sort((a, b) => trackOrder.indexOf(a.track) - trackOrder.indexOf(b.track) || a.at[1] - b.at[1] || a.at[0] - b.at[0])

export const lessonById = Object.fromEntries(LESSONS.map((l) => [l.id, l]))
export const trackById = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<TrackId, Track>
export const lessonsOf = (t: TrackId) => LESSONS.filter((l) => l.track === t)
export const dependents = (id: string) => LESSONS.filter((l) => l.prereqs.includes(id))
