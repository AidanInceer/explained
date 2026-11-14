import { useState } from 'react'

interface Pick {
  use: string
  why: string
  avoid?: string
}
interface Config {
  a: { label: string; options: string[] }
  b: { label: string; options: string[] }
  /** grid[a][b] */
  grid: Pick[][]
}

function Chooser({ a, b, grid }: Config) {
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)
  const p = grid[i][j]
  return (
    <div className="chooser">
      <span className="ctl-label">{a.label}</span>
      <div className="seg">
        {a.options.map((o, k) => (
          <button key={o} aria-pressed={i === k} onClick={() => setI(k)}>
            {o}
          </button>
        ))}
      </div>
      <span className="ctl-label">{b.label}</span>
      <div className="seg">
        {b.options.map((o, k) => (
          <button key={o} aria-pressed={j === k} onClick={() => setJ(k)}>
            {o}
          </button>
        ))}
      </div>
      <div className="pick" role="status">
        <p className="pick-use">{p.use}</p>
        <p>{p.why}</p>
        {p.avoid && (
          <p className="pick-avoid">
            <b>Not recommended:</b> {p.avoid}
          </p>
        )}
      </div>
    </div>
  )
}

const make = (c: Config) => () => <Chooser {...c} />

export const ChooseIngestion = make({
  a: { label: 'Where the data is', options: ['Application database', 'SaaS tool', 'Files from a partner', 'Events from your app'] },
  b: { label: 'How fresh it must be', options: ['Daily', 'Hourly', 'Seconds'] },
  grid: [
    [
      { use: 'A scheduled query, on a read replica', why: 'Copy small tables in full. For large tables, select the rows where updated_at is later than the last run. It is simple, and one SQL statement is the whole extract.', avoid: 'CDC. It adds a connector and a broker to operate, and a daily need does not pay for them.' },
      { use: 'An incremental query each hour, then CDC if deletes matter', why: 'An hourly updated_at query is usually enough. It does not see deleted rows or values that changed twice in the hour. If you need those, move to log-based CDC.', avoid: 'A full copy each hour of a large table. It loads the source database at the times when users are active.' },
      { use: 'Log-based CDC', why: 'Debezium, or the managed CDC service of your cloud, reads the transaction log. Each change arrives in seconds, deletes are included, and no query runs on the source tables.', avoid: 'A query each few seconds. It loads the source and still does not see deletes.' },
    ],
    [
      { use: 'A managed connector', why: 'Fivetran, Airbyte and similar products maintain the API code for hundreds of tools. The vendor changes its API a few times a year, and you do not want to own that work.', avoid: 'Your own API client, unless no connector exists. Then use a small library such as dlt.' },
      { use: 'A managed connector on an hourly sync', why: 'Most connectors can run each hour. Check the rate limit of the API first: some tools permit only a few thousand calls a day.', avoid: 'A sync each few minutes. You will reach the rate limit, and the tool may block the account.' },
      { use: 'Webhooks into a queue, with a nightly API sync', why: 'The tool calls your endpoint when something changes. Webhooks are sometimes lost, so a nightly sync through the API finds and corrects the gaps.', avoid: 'Webhooks alone. You will not know which events you did not get.' },
    ],
    [
      { use: 'A drop folder in object storage and a scheduled load', why: 'The partner writes the file to a bucket or SFTP. Your job checks the columns and the row count, then loads the file. Keep every file: it is your record of what was sent.', avoid: 'A load with no checks. Partner files change format with no warning.' },
      { use: 'A load that starts when the file arrives', why: 'The bucket sends a notification for each new object, and that starts the load. You do not wait for the next schedule, and a late file is still loaded.', avoid: 'A tight schedule that looks for files. It runs many times for nothing and can read a file that is half written.' },
      { use: 'Not possible with files. Ask for an API or a stream', why: 'A file is a batch by nature. If the partner can only send files, the freshness of the data is the frequency of the files. Tell the stakeholder this limit before you design anything.', avoid: 'Very small files sent each few seconds. Thousands of small files are slow to list and slow to query.' },
    ],
    [
      { use: 'An event collector that writes to object storage', why: 'Send events to a collector or a managed stream and let it write Parquet files each few minutes. Load the files once a day. You get low cost now, and you can add a faster reader later.', avoid: 'Writes from the application directly into the warehouse. The application then fails when the warehouse is slow.' },
      { use: 'A stream, loaded in micro-batches', why: 'The stream holds the events. A loader such as Kafka Connect, Kinesis Firehose or Snowpipe writes them to the warehouse each few minutes.', avoid: 'A stream processor. You do not need state or windows only to load events.' },
      { use: 'A stream and a stream processor', why: 'Kafka, Kinesis or Pub/Sub holds the events. Flink, Spark Structured Streaming or a streaming database computes on them as they arrive.', avoid: 'This design for a dashboard that people read once a day. It costs several times more to build and to run.' },
    ],
  ],
})

export const ChooseEngine = make({
  a: { label: 'How much data', options: ['Less than 100 GB', '100 GB to 10 TB', 'More than 10 TB'] },
  b: { label: 'The main work', options: ['Dashboards and SQL analysis', 'Data science on files', 'Fast queries inside a product'] },
  grid: [
    [
      { use: 'PostgreSQL, or DuckDB', why: 'At this size one machine is enough. A Postgres replica with a few summary tables serves most dashboards. DuckDB (or MotherDuck, its hosted form) gives column-store speed with no cluster.', avoid: 'A Spark cluster. The time to start it is longer than the query.' },
      { use: 'DuckDB or Polars on Parquet files', why: 'Both read Parquet from a laptop or from object storage and use all the processor cores. 100 GB of Parquet is small for them.', avoid: 'A distributed engine. You pay shuffle and network cost and get nothing back at this size.' },
      { use: 'PostgreSQL with indexes and materialized views', why: 'If the product shows each customer their own numbers, an index on the customer key is enough. Add ClickHouse only when the aggregations become slow.', avoid: 'A cloud warehouse behind the product. Its queries take one to several seconds, and each one costs money.' },
    ],
    [
      { use: 'A cloud warehouse: BigQuery, Snowflake or Redshift', why: 'All three separate storage from compute and need little administration. Choose the one in the cloud you already use. The differences between them are smaller than the cost of data that moves between clouds.', avoid: 'A database you manage yourself. The work to operate it is larger than the saving.' },
      { use: 'A lakehouse: Databricks, or Spark and Trino on Iceberg', why: 'Data scientists want files, Python and GPUs. A lakehouse gives them direct access to Parquet and gives analysts SQL tables on the same data.', avoid: 'Exports from the warehouse to files for each experiment. The copies go out of date.' },
      { use: 'A real-time OLAP store: ClickHouse, Druid or Pinot', why: 'These engines answer aggregations in tens of milliseconds for many users at once. Feed them from the warehouse or from a stream.', avoid: 'The warehouse itself. It is built for tens of users with heavy queries, not thousands with light ones.' },
    ],
    [
      { use: 'Snowflake, BigQuery or Databricks SQL, with strict layout', why: 'All three work at this size. Cost now depends on you: partition and cluster the large tables, set limits for each team, and review the most expensive queries each month.', avoid: 'No cost controls. One query without a partition filter can cost more than a month of normal use.' },
      { use: 'A lakehouse on an open table format', why: 'Iceberg or Delta tables in object storage, with Spark for heavy jobs and Trino or a warehouse engine for SQL. The data is stored once and several engines read it.', avoid: 'One closed warehouse as the only copy. At this size the cost to leave it becomes a strategic problem.' },
      { use: 'A real-time OLAP store, with tables aggregated in advance', why: 'ClickHouse, Druid and Pinot can hold this volume, but only with rollups: store the count for each minute, not each event.', avoid: 'Raw events with no rollup. Query time then grows with the data.' },
    ],
  ],
})

export const ChooseLatency = make({
  a: { label: 'What uses the result', options: ['A person, on a dashboard', 'A report or month-end close', 'A program that must react'] },
  b: { label: 'How old the data can be', options: ['One day', 'One hour', 'A few minutes', 'Seconds'] },
  grid: [
    [
      { use: 'Daily batch', why: 'Most business decisions are made once a day or less. A nightly job is the lowest cost and the easiest to test and to rerun.' },
      { use: 'Hourly batch', why: 'The same jobs, on a tighter schedule. Each run must be incremental and must finish well inside the hour.' },
      { use: 'Micro-batch', why: 'Load changes continuously, and build the tables again each few minutes with incremental models. You keep SQL and batch tools.', avoid: 'A stream processor. A person does not see the difference between 5 minutes and 5 seconds on a chart.' },
      { use: 'Ask what decision needs seconds. Then, if it is real, streaming', why: 'An operations screen in a control room is a true case. A sales chart is not. If the need is real, stream into a real-time OLAP store.', avoid: 'Streaming because the request said “real-time”. People often mean “not yesterday”.' },
    ],
    [
      { use: 'Daily batch', why: 'A financial report needs complete and reconciled data. Completeness is more important than speed.' },
      { use: 'Hourly batch, with a final daily run', why: 'Give an early view each hour, marked as provisional. The run after the day is closed is the official one.' },
      { use: 'Batch. Minutes add no value here', why: 'A report that is signed off must not change while someone reads it. Fresh but incomplete numbers cause more questions than they answer.', avoid: 'Micro-batch or streaming.' },
      { use: 'Batch. This combination does not occur', why: 'No finance close uses data that is seconds old. If you get this request, go back to the stakeholder and find the real need.', avoid: 'Streaming.' },
    ],
    [
      { use: 'Batch scoring and reverse ETL', why: 'Compute the result each night and write it to the place where the program reads it: for example a customer segment in the CRM.' },
      { use: 'Hourly batch', why: 'Enough for stock replenishment or an email campaign. The program reads the last complete result.' },
      { use: 'Micro-batch, or a simple stream consumer', why: 'A small service that reads a queue and updates a table is often enough. It is a stream, but with no windows and no state.', avoid: 'A full stream processing cluster for one simple rule.' },
      { use: 'Streaming', why: 'Fraud checks, live prices and alerts must react to each event. This is the case that stream processors are built for.', avoid: 'A batch job that runs each minute. It is late most of the time and its runs start to overlap.' },
    ],
  ],
})

export const ChooseStack = make({
  a: { label: 'Size of the data team', options: ['1 to 3 people', '4 to 15 people', 'More than 15, in several teams'] },
  b: { label: 'Freshness the business needs', options: ['Daily or hourly', 'Minutes', 'Seconds'] },
  grid: [
    [
      { use: 'Managed connectors, a cloud warehouse, dbt, a BI tool', why: 'Buy everything that is not specific to your company. Fivetran or Airbyte loads the data. BigQuery or Snowflake stores it. dbt transforms it, on a schedule from dbt Cloud or a CI job.', avoid: 'Spark, Kafka, Kubernetes or your own Airflow. Each one needs a person, and you have three.' },
      { use: 'The same stack, with CDC connectors and incremental models', why: 'Most managed connectors can sync each few minutes from a database log. Run only the dbt models that need it, each 10 to 15 minutes.', avoid: 'A streaming platform. You get minutes without it.' },
      { use: 'Batch stack for analytics. Buy or delegate the real-time part', why: 'Keep analytics in batch. For the one feature that needs seconds, use a managed stream and a managed streaming SQL service, or let the product team build it in their service.', avoid: 'Your own Kafka and Flink. To operate them is a full-time job.' },
    ],
    [
      { use: 'Add an orchestrator, CI, tests and a staging environment', why: 'At this size the problems are coordination and trust. Airflow or Dagster shows all jobs in one place. CI and data tests stop bad changes. A lakehouse is worth it if machine learning is a large part of the work.', avoid: 'A full change of tools. Add process to the stack that works.' },
      { use: 'CDC into a log, micro-batch transformations', why: 'Debezium into Kafka, or the managed equivalent, gives one stream of changes that several consumers can read. Transform in incremental batches each few minutes.', avoid: 'A separate real-time copy of each model. Two definitions of one metric will not agree.' },
      { use: 'Managed Kafka and Flink for the few real-time cases', why: 'Run stream processing only where a program must react in seconds. Everything else stays in batch. Write the stream to the lake also, so the history can be processed again.', avoid: 'A move of all pipelines to streaming. Most of them do not need it.' },
    ],
    [
      { use: 'A platform team and a lakehouse with a catalogue', why: 'A central team supplies storage, orchestration, CI templates and access control. Domain teams build their own pipelines on it. Open table formats let different teams use different engines on the same data.', avoid: 'One central team that builds every pipeline. It becomes the queue that everyone waits in.' },
      { use: 'The same, with a shared CDC and streaming service', why: 'The platform team operates the log and the schema registry. Domain teams publish and read topics under data contracts.', avoid: 'A separate broker for each team.' },
      { use: 'A streaming platform as a product, with batch on the same data', why: 'Event-heavy domains can use a Kappa design: the log is the source of truth and tables are built from it. Other domains stay in batch. Both read the same governed data.', avoid: 'One architecture for every domain. Finance and fraud detection do not have the same needs.' },
    ],
  ],
})
