const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
)

export function Lifecycle() {
  return (
    <div>
      <div className="fx tight">
        <div className="box dash" style={{ flex: '0 0 132px' }}>
          <h4>Generation</h4>
          <p>Apps, devices and APIs create data. You do not control these.</p>
        </div>
        <Arrow />
        <div className="grow fcol">
          <div className="fx tight">
            <div className="box tint grow">
              <h4>Ingestion</h4>
              <p>Move data out of the source.</p>
            </div>
            <Arrow />
            <div className="box tint grow">
              <h4>Transformation</h4>
              <p>Clean, join and model it.</p>
            </div>
            <Arrow />
            <div className="box tint grow">
              <h4>Serving</h4>
              <p>Analytics, machine learning, reverse ETL.</p>
            </div>
          </div>
          <div className="box solid">
            <h4>Storage</h4>
            <p>Under every stage. Data is stored many times on its way through.</p>
          </div>
        </div>
      </div>
      <div className="under" aria-label="Undercurrents">
        <b style={{ fontSize: 13.5, alignSelf: 'center' }}>Undercurrents:</b>
        {['Security', 'Data management', 'DataOps', 'Data architecture', 'Orchestration', 'Software engineering'].map((u) => (
          <span key={u}>{u}</span>
        ))}
      </div>
    </div>
  )
}

export function Lakehouse() {
  return (
    <div className="fx">
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>Warehouse</h4>
        <div className="box solid">
          <h4>Query engine + storage</h4>
          <p>One product. Tables only. The vendor controls the file layout.</p>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)' }}>Snowflake, BigQuery, Redshift</p>
      </div>
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>Lake</h4>
        <div className="box tint">
          <h4>Any engine</h4>
          <p>Spark, Trino, Python</p>
        </div>
        <div className="box dash">
          <h4>Files in object storage</h4>
          <p>Parquet, JSON, images. No transactions.</p>
        </div>
      </div>
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>Lakehouse</h4>
        <div className="box tint">
          <h4>Any engine</h4>
          <p>Spark, Trino, warehouse engines</p>
        </div>
        <div className="box solid">
          <h4>Table format</h4>
          <p>Transactions, schema, history</p>
        </div>
        <div className="box dash">
          <h4>Parquet files in object storage</h4>
        </div>
      </div>
    </div>
  )
}

export function Star() {
  const dims = [
    { x: 20, y: 16, name: 'dim_date', cols: ['date_key', 'date', 'month', 'is_holiday'] },
    { x: 440, y: 16, name: 'dim_product', cols: ['product_key', 'name', 'category', 'brand'] },
    { x: 20, y: 236, name: 'dim_customer', cols: ['customer_key', 'name', 'city', 'segment'] },
    { x: 440, y: 236, name: 'dim_store', cols: ['store_key', 'name', 'region', 'format'] },
  ]
  return (
    <div className="star">
      <svg viewBox="0 0 620 350" role="img" aria-label="Star schema: fact_sales in the centre joined to four dimension tables">
        {dims.map((d) => (
          <line key={d.name} x1={d.x + 80} y1={d.y + 50} x2={310} y2={175} stroke="var(--ink-3)" strokeWidth="2" />
        ))}
        {dims.map((d) => (
          <g key={d.name}>
            <rect x={d.x} y={d.y} width="160" height="98" rx="4" fill="#fff" stroke="#9eaaa5" strokeWidth="1" />
            <text x={d.x + 10} y={d.y + 20} className="t">
              {d.name}
            </text>
            {d.cols.map((c, i) => (
              <text key={c} x={d.x + 10} y={d.y + 40 + i * 16} className="m">
                {c}
              </text>
            ))}
          </g>
        ))}
        <rect x="222" y="98" width="176" height="154" rx="4" fill="var(--line)" />
        <text x="234" y="120" className="t w">
          fact_sales
        </text>
        {['date_key', 'product_key', 'customer_key', 'store_key', 'quantity', 'amount'].map((c, i) => (
          <text key={c} x="234" y={142 + i * 17} className="m w" opacity={i < 4 ? 0.8 : 1} fontWeight={i < 4 ? 400 : 700}>
            {c}
            {i === 3 ? '' : ''}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function Cdc() {
  return (
    <div className="fx">
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>1. Application writes</h4>
        <div className="box">
          <p>
            <code>UPDATE customers SET city = 'Porto' WHERE id = 7</code>
          </p>
        </div>
        <h4 style={{ margin: '6px 0 0' }}>2. Database appends to its log</h4>
        <div className="fcol" style={{ gap: 3 }}>
          <span className="logline">lsn 4810 INSERT orders id=1004</span>
          <span className="logline" style={{ background: 'var(--line)', color: '#fff' }}>
            lsn 4811 UPDATE customers id=7
          </span>
          <span className="logline">lsn 4812 DELETE carts id=88</span>
        </div>
      </div>
      <Arrow />
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>3. Connector reads the log</h4>
        <div className="box tint">
          <p>Debezium or a managed service follows the log as a replica would. The source tables are not queried.</p>
        </div>
        <h4 style={{ margin: '6px 0 0' }}>4. One event for each change</h4>
        <pre style={{ margin: 0, fontSize: 12, fontFamily: 'var(--mono)', background: 'var(--paper)', color: 'var(--ink)', padding: 10, borderRadius: 8, lineHeight: 1.45 }}>
          {`{ "op": "u", "table": "customers",
  "before": { "id": 7, "city": "Lisbon" },
  "after":  { "id": 7, "city": "Porto" },
  "lsn": 4811 }`}
        </pre>
      </div>
    </div>
  )
}

export function Shuffle() {
  const Chip = ({ k }: { k: number }) => <span className={`chip k${k}`}>{['PT', 'ES', 'FR'][k]}</span>
  const input = [
    [0, 1, 0, 2],
    [1, 1, 2, 0],
    [2, 0, 1, 1],
  ]
  return (
    <div className="fx">
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>Input partitions</h4>
        {input.map((p, i) => (
          <div key={i} className="box">
            <p>Machine {i + 1}</p>
            <div className="chips">
              {p.map((k, j) => (
                <Chip key={j} k={k} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="fcol" style={{ justifyContent: 'center', textAlign: 'center', maxWidth: 110 }}>
        <span className="arrow" aria-hidden="true">
          ⇉
        </span>
        <b style={{ fontSize: 14 }}>Shuffle</b>
        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Rows cross the network by key</span>
      </div>
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>After the shuffle</h4>
        {[
          [0, 0, 0, 0],
          [1, 1, 1, 1, 1],
          [2, 2, 2],
        ].map((p, i) => (
          <div key={i} className="box tint">
            <p>
              Machine {i + 1}: count = {p.length}
            </p>
            <div className="chips">
              {p.map((k, j) => (
                <Chip key={j} k={k} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Medallion() {
  return (
    <div className="fx">
      <div className="box grow" style={{ borderColor: '#9a5b2c', background: '#f7ece3' }}>
        <h4>Bronze</h4>
        <p>Raw copies of the source, append-only. Never edited, so you can always rebuild from here.</p>
      </div>
      <Arrow />
      <div className="box grow" style={{ borderColor: '#7b8790', background: '#eef1f3' }}>
        <h4>Silver</h4>
        <p>Typed, de-duplicated, validated. One clean table for each business entity.</p>
      </div>
      <Arrow />
      <div className="box grow" style={{ borderColor: '#b08a00', background: '#fbf4d6' }}>
        <h4>Gold</h4>
        <p>Modeled for a use: star schemas, aggregates, feature tables. What users query.</p>
      </div>
    </div>
  )
}

export function LambdaKappa() {
  return (
    <div className="fcol" style={{ gap: 18 }}>
      <div>
        <h4 style={{ margin: '0 0 8px' }}>Lambda: two paths, one answer</h4>
        <div className="fx center">
          <div className="box">Events</div>
          <Arrow />
          <div className="grow fcol">
            <div className="box tint">
              <h4>Batch path</h4>
              <p>Complete and correct, hours late</p>
            </div>
            <div className="box tint">
              <h4>Speed path</h4>
              <p>Seconds late, approximate</p>
            </div>
          </div>
          <Arrow />
          <div className="box solid">Serving layer merges both</div>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px' }}>Kappa: one path</h4>
        <div className="fx center">
          <div className="box">Events</div>
          <Arrow />
          <div className="box dash">Log keeps history</div>
          <Arrow />
          <div className="box tint grow">
            <h4>Stream job</h4>
            <p>To reprocess, deploy new code and replay the log</p>
          </div>
          <Arrow />
          <div className="box solid">Serving layer</div>
        </div>
      </div>
    </div>
  )
}
