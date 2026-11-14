import type { ReactNode } from 'react'
import Logos from './Logos'

/* Name and logo options for the site. A working page for the owner, linked from the footer only. */

/** The site logo: the initials on an ink tile, with one dot in the blue of the first line of the map. */
export function MarkTile({ size = 30 }: { size?: number }) {
  return (
    <span className="logo-tile" style={{ width: size, height: size, fontSize: size * 0.53, borderRadius: size * 0.26 }} aria-hidden="true">
      de<i />
    </span>
  )
}

function MarkRawToMart({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <circle cx="5" cy="8" r="2.2" fill="currentColor" />
      <circle cx="9" cy="17" r="2.2" fill="currentColor" />
      <circle cx="4.5" cy="25" r="2.2" fill="currentColor" />
      <path d="M13 16h5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="20" y="8" width="10" height="16" rx="2.5" fill="#2456D6" />
      <path d="M20 13.5h10M20 18.5h10" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

function MarkSmallPipe({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M4 10h12a7 7 0 0 1 7 7v11" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="butt" />
      <path d="M4 10h12a7 7 0 0 1 7 7v11" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="0.1 6" strokeLinecap="round" />
      <rect x="1" y="5" width="4" height="10" rx="1.5" fill="#0B8A78" />
      <rect x="18" y="26" width="10" height="4" rx="1.5" fill="#0B8A78" />
    </svg>
  )
}

function MarkLayers({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect x="3" y="20" width="26" height="7" rx="2" fill="#B4530A" />
      <rect x="7" y="12" width="18" height="7" rx="2" fill="#8E9BA1" />
      <rect x="11" y="4" width="10" height="7" rx="2" fill="#D9A400" />
    </svg>
  )
}

interface Option {
  name: string
  line: string
  why: string
  against: string
  mark: (p: { size?: number }) => ReactNode
  free: string[]
  taken: string[]
  pick?: boolean
}

const OPTIONS: Option[] = [
  {
    name: 'Data Engineering Explained',
    line: 'in small pieces',
    why: 'It says exactly what the site is, and people search for these three words. The matching .com has no registration.',
    against: 'Long. It is a description more than a name.',
    mark: MarkTile,
    free: ['dataengineeringexplained.com', 'dataengineeringexplained.dev', 'deexplained.dev'],
    taken: ['deexplained.com'],
    pick: true,
  },
  {
    name: 'Raw to Mart',
    line: 'data engineering, explained',
    why: 'Names the whole journey of the data in three words that every data engineer knows. Short, and the .com has no registration.',
    against: 'A beginner does not know yet what a mart is.',
    mark: MarkRawToMart,
    free: ['rawtomart.com', 'rawtomart.dev'],
    taken: [],
  },
  {
    name: 'Small Pipelines',
    line: 'data engineering, explained',
    why: 'Fits the two ideas of the site: small lessons, and a small pipeline of your own.',
    against: 'Can sound as if the site covers only small systems.',
    mark: MarkSmallPipe,
    free: ['smallpipelines.com', 'smallpipelines.dev'],
    taken: [],
  },
  {
    name: 'Bronze to Gold',
    line: 'data engineering, explained',
    why: 'The three layers are a known picture in the field, and they make a clear logo.',
    against: 'Reads like a sport or a jewellery name out of context.',
    mark: MarkLayers,
    free: ['bronzetogold.com', 'bronzetogold.dev'],
    taken: [],
  },
]

const SHORT_FREE = ['de-explain.dev', 'deexplain.dev', 'explainde.dev', 'explain-de.dev', 'de-explained.dev', 'de-explained.com', 'de-explain.com', 'deexplain.com', 'de-explained.org', 'dataengexplained.com', 'dataengexplained.dev', 'dataeng-explained.dev', 'deexplained.io', 'de-explained.io']
const OTHERS_FREE = ['plainpipelines.com', 'plainpipelines.dev', 'firstpipeline.dev', 'sourcetosink.dev', 'pipelineprimer.dev', 'grainwise.dev', 'thedataline.dev', 'learnupstream.dev', 'upstream.school']
const OTHERS_TAKEN = ['firstpipeline.com', 'sourcetosink.com', 'pipelineprimer.com', 'pipewise.dev']

export default function Brand() {
  return (
    <main className="page brand">
      <h1>Name and logo options</h1>
      <p className="lead">
        Twenty logos for the current name in two rounds, then four names with the domains that were looked up for each. The header uses
        the “de.” tile until you choose.
      </p>
      <Logos />
      <h2>Four names</h2>
      <div className="brand-grid">
        {OPTIONS.map((o) => (
          <article key={o.name} className="brand-card">
            <div className="brand-show">
              <div className="brand-tile">
                <o.mark size={72} />
              </div>
              <div className={o.mark === MarkTile ? 'brand-tile' : 'brand-tile dark'}>
                <o.mark size={o.mark === MarkTile ? 44 : 72} />
              </div>
              <div className="brand-tile small">
                <o.mark size={20} />
              </div>
            </div>
            <p className="brand-word">
              <o.mark size={28} />
              <b>{o.name}</b>
            </p>
            <p className="brand-line">
              {o.name}: {o.line}
              {o.pick && <span className="pill">Recommended</span>}
            </p>
            <dl>
              <dt>For</dt>
              <dd>{o.why}</dd>
              <dt>Against</dt>
              <dd>{o.against}</dd>
              <dt>Domains with no registration</dt>
              <dd>
                {o.free.map((d) => (
                  <code key={d}>{d}</code>
                ))}
              </dd>
              {o.taken.length > 0 && (
                <>
                  <dt>Already registered</dt>
                  <dd>
                    {o.taken.map((d) => (
                      <code key={d} className="taken">
                        {d}
                      </code>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </article>
        ))}
      </div>

      <h2>Short forms of the current name</h2>
      <p className="brand-more">
        No registration:{' '}
        {SHORT_FREE.map((d) => (
          <code key={d}>{d}</code>
        ))}
      </p>
      <p className="brand-more">Already registered: <code className="taken">deexplained.com</code></p>

      <h2>Other names that were looked up</h2>
      <p className="brand-more">
        No registration:{' '}
        {OTHERS_FREE.map((d) => (
          <code key={d}>{d}</code>
        ))}
      </p>
      <p className="brand-more">
        Already registered:{' '}
        {OTHERS_TAKEN.map((d) => (
          <code key={d} className="taken">
            {d}
          </code>
        ))}
      </p>

      <h2>About the domains</h2>
      <ul className="brand-notes">
        <li>
          The lookup was a registration query (RDAP) on 14 November 2026. “No registration” means that no record was
          found on that day. A registrar can still list a name as premium, so confirm the price before you buy.
        </li>
        <li>
          A .com or a .dev normally costs between 10 and 15 US dollars a year at a registrar that sells at cost. Check
          the renewal price, not only the price of the first year.
        </li>
        <li>A .dev domain works only over HTTPS. Static hosts such as GitHub Pages, Cloudflare Pages and Netlify give that at no cost.</li>
        <li>This site is static files after a build, so hosting can be free. The domain is the only cost.</li>
      </ul>
    </main>
  )
}
