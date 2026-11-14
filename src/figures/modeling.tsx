import { useState } from 'react'

const CITIES = ['Lisbon', 'Porto', 'Madrid']
const MOVE_DATES = ['2026-01-01', '2026-03-10', '2026-06-02']
const ORDERS = [
  { id: 501, date: '2026-02-14', amount: 100, era: 0 },
  { id: 502, date: '2026-04-03', amount: 80, era: 1 },
  { id: 503, date: '2026-07-21', amount: 50, era: 2 },
]

export function Scd() {
  const [type, setType] = useState<1 | 2>(1)
  const [moves, setMoves] = useState(0)
  const orders = ORDERS.filter((o) => o.era <= moves)
  const current = CITIES[moves]

  const byCity: Record<string, number> = {}
  for (const o of orders) {
    const city = type === 1 ? current : CITIES[o.era]
    byCity[city] = (byCity[city] ?? 0) + o.amount
  }

  return (
    <div>
      <div className="fx center" style={{ marginBottom: 4 }}>
        <div className="seg" style={{ marginBottom: 0 }}>
          <button aria-pressed={type === 1} onClick={() => setType(1)}>
            Type 1: overwrite
          </button>
          <button aria-pressed={type === 2} onClick={() => setType(2)}>
            Type 2: add a row
          </button>
        </div>
        <button className="act" disabled={moves >= 2} onClick={() => setMoves(moves + 1)}>
          {moves >= 2 ? 'Ana has moved twice' : `Ana moves to ${CITIES[moves + 1]}`}
        </button>
        <button className="act ghost" disabled={moves === 0} onClick={() => setMoves(0)}>
          Start again
        </button>
      </div>

      <div className="fcol" style={{ marginTop: 16, gap: 14 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <caption>dim_customer</caption>
            <thead>
              {type === 1 ? (
                <tr>
                  <th>customer_key</th>
                  <th>name</th>
                  <th>city</th>
                </tr>
              ) : (
                <tr>
                  <th>customer_key</th>
                  <th>name</th>
                  <th>city</th>
                  <th>valid_from</th>
                  <th>valid_to</th>
                  <th>is_current</th>
                </tr>
              )}
            </thead>
            <tbody>
              {type === 1 ? (
                <tr className="hl">
                  <td>1</td>
                  <td>Ana</td>
                  <td>{current}</td>
                </tr>
              ) : (
                CITIES.slice(0, moves + 1).map((c, i) => (
                  <tr key={c} className={i === moves ? 'hl' : ''}>
                    <td>{i + 1}</td>
                    <td>Ana</td>
                    <td>{c}</td>
                    <td>{MOVE_DATES[i]}</td>
                    <td>{i === moves ? '9999-12-31' : MOVE_DATES[i + 1]}</td>
                    <td>{i === moves ? 'true' : 'false'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <caption>fact_orders</caption>
            <thead>
              <tr>
                <th>order_id</th>
                <th>order_date</th>
                <th>customer_key</th>
                <th>amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.date}</td>
                  <td>{type === 1 ? 1 : o.era + 1}</td>
                  <td>{o.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="stat">
        <b>Report, sales by city:</b>{' '}
        {Object.entries(byCity)
          .map(([c, a]) => `${c} ${a}`)
          .join(', ')}
        .{' '}
        {moves === 0
          ? 'Both types agree until something changes. Select the button to make Ana move.'
          : type === 1
            ? `All of Ana’s past orders now count for ${current}. The fact that she lived in ${CITIES[0]} is gone.`
            : 'Each order points to the version of Ana that was current on the order date. History is kept.'}
      </p>
    </div>
  )
}
