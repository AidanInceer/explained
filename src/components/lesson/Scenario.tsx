import { useState } from 'react'
import type { ScenarioItem } from '../../lessons/types'

const VERDICT = { best: 'Best fit', ok: 'Works, with a cost', poor: 'Poor fit' }

function Case({ item }: { item: ScenarioItem }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="case">
      <p className="case-q" dangerouslySetInnerHTML={{ __html: item.q }} />
      <div className="case-opts">
        {item.options.map((o, i) => (
          <button
            key={i}
            type="button"
            className={`case-opt ${picked === null ? '' : o.verdict} ${picked === i ? 'picked' : ''}`}
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
          >
            <span className="case-text" dangerouslySetInnerHTML={{ __html: o.text }} />
            {picked !== null && (
              <span className="case-why">
                <b>
                  {VERDICT[o.verdict]}
                  {picked === i ? ' (your choice)' : ''}.
                </b>{' '}
                <span dangerouslySetInnerHTML={{ __html: o.why }} />
              </span>
            )}
          </button>
        ))}
      </div>
      {picked === null && <p className="case-hint">Choose one. All the options are then compared.</p>}
    </div>
  )
}

export default function Scenario({ items }: { items: ScenarioItem[] }) {
  return (
    <section className="scenario" aria-label="Design decisions">
      <h2>What would you choose?</h2>
      {items.map((it, i) => (
        <Case key={i} item={it} />
      ))}
    </section>
  )
}
