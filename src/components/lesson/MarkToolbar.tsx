import type { MarkTool } from './useMarkTool'

export default function MarkToolbar({ tool, onMark, onUnmark }: { tool: MarkTool; onMark: (kind: 'hl' | 'ul') => void; onUnmark: (ids: string[]) => void }) {
  return (
    <div className="mark-tool" style={{ left: tool.x, top: tool.y }} onMouseDown={(e) => e.preventDefault()}>
      {tool.mode === 'add' ? (
        <>
          <button onClick={() => onMark('hl')}>
            <span className="swatch hl" /> Highlight
          </button>
          <button onClick={() => onMark('ul')}>
            <span className="swatch ul" /> Underline
          </button>
          {tool.over.length > 0 && (
            <button className="rm" onClick={() => onUnmark(tool.over)}>
              Remove {tool.over.length > 1 ? 'marks' : 'mark'}
            </button>
          )}
        </>
      ) : (
        <button className="rm" onClick={() => onUnmark([tool.id])}>
          Remove {tool.kind === 'ul' ? 'underline' : 'highlight'}
        </button>
      )}
    </div>
  )
}
