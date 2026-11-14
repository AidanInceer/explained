/**
 * Books, papers and websites that lessons cite. A lesson lists them under `refs` in its file,
 * as `- <source id>: <where in the source>`. The Sources page lists all of them.
 */

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


export interface Source {
  title: string
  by: string
  kind: 'Book' | 'Paper' | 'Essay' | 'Website' | 'Community'
  url?: string
  /** One or two sentences: why a reader would go to this source. */
  why: string
}

export const SOURCES: Record<SourceId, Source> = {
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
