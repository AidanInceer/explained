import type { TechNote as Note, Tool } from '../../data/tech'
import { TOOL_URL } from '../../data/tool-urls'

/** Brand glyph on a white tile. Very light brand colours are drawn in ink so that they stay visible. */
function Logo({ tool }: { tool: Tool }) {
  if (!tool.icon) {
    const letters = tool.name
      .split(/[\s,(]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('')
    return <span className="tech-logo mono">{letters}</span>
  }
  const hex = tool.icon.hex
  const lum = (parseInt(hex.slice(0, 2), 16) * 299 + parseInt(hex.slice(2, 4), 16) * 587 + parseInt(hex.slice(4, 6), 16) * 114) / 255000
  return (
    <span className="tech-logo">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={tool.icon.path} fill={lum > 0.72 ? 'var(--ink)' : `#${hex}`} />
      </svg>
    </span>
  )
}

export default function TechNote({ note, top, pinned, onClose }: { note: Note; top: number; pinned: boolean; onClose: () => void }) {
  return (
    <div className={`tech-note ${pinned ? 'pinned' : ''}`} style={{ top }}>
      <h3>{note.title}</h3>
      <p>{note.note}</p>
      <ul>
        {note.tools.map((tool) => (
          <li key={tool.name}>
            <Logo tool={tool} />
            <span>
              <b>
                {TOOL_URL[tool.name] ? (
                  <a href={TOOL_URL[tool.name]} target="_blank" rel="noreferrer">
                    {tool.name}
                  </a>
                ) : (
                  tool.name
                )}
              </b>
              <small>{tool.what}</small>
            </span>
          </li>
        ))}
      </ul>
      {pinned ? (
        <button className="link-btn" onClick={onClose}>
          Close this note
        </button>
      ) : (
        <p className="tech-hint">Select the term to keep this note open and use the links.</p>
      )}
    </div>
  )
}
