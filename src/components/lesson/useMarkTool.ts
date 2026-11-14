import { useEffect, useState } from 'react'
import { addMark, removeMark, type Mark } from '../../lib/marks'

/** The small toolbar over selected text: add a highlight or underline, or remove marks. */
export type MarkTool =
  | { mode: 'add'; x: number; y: number; seg: number; start: number; end: number; text: string; over: string[] }
  | { mode: 'remove'; x: number; y: number; id: string; kind: 'hl' | 'ul' }

/** State and handlers for the mark toolbar of one lesson. Text positions count characters inside one `[data-seg]` block. */
export function useMarkTool(lessonId: string, marks: Mark[]) {
  const [tool, setTool] = useState<MarkTool | null>(null)

  useEffect(() => {
    if (!tool) return
    const hide = () => setTool(null)
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [tool])

  // After a selection inside one text block, offer to highlight or underline it.
  const onSelect = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return setTool((t) => (t?.mode === 'add' ? null : t))
    const range = sel.getRangeAt(0)
    const el = (n: Node) => (n.nodeType === 1 ? (n as HTMLElement) : n.parentElement)
    const a = el(range.startContainer)?.closest<HTMLElement>('[data-seg]')
    const b = el(range.endContainer)?.closest<HTMLElement>('[data-seg]')
    const text = range.toString()
    if (!a || a !== b || !text.trim()) return setTool(null)
    const before = document.createRange()
    before.selectNodeContents(a)
    before.setEnd(range.startContainer, range.startOffset)
    const start = before.toString().length
    const r = range.getBoundingClientRect()
    const seg = Number(a.dataset.seg)
    const end = start + text.length
    // Marks that the selection touches can be removed from the same toolbar.
    const over = marks.filter((m) => m.seg === seg && m.start < end && m.end > start).map((m) => m.id)
    setTool({ mode: 'add', x: r.left + r.width / 2, y: r.top, seg, start, end, text, over })
  }

  /** Offer to remove a mark that the reader selected. */
  const pickMark = (mark: HTMLElement) => {
    const r = mark.getBoundingClientRect()
    setTool({ mode: 'remove', x: r.left + r.width / 2, y: r.top, id: mark.dataset.mark!, kind: mark.classList.contains('ul') ? 'ul' : 'hl' })
  }

  const unmark = (ids: string[]) => {
    ids.forEach((m) => removeMark(lessonId, m))
    window.getSelection()?.removeAllRanges()
    setTool(null)
  }

  const mark = (kind: 'hl' | 'ul') => {
    if (tool?.mode !== 'add') return
    addMark(lessonId, { seg: tool.seg, start: tool.start, end: tool.end, kind, text: tool.text })
    window.getSelection()?.removeAllRanges()
    setTool(null)
  }

  return { tool, setTool, onSelect, pickMark, mark, unmark }
}
