import { useSyncExternalStore } from 'react'

/** A highlight or underline that a reader made. Kept in this browser only. */
export interface Mark {
  id: string
  /** index of the text block in the lesson */
  seg: number
  start: number
  end: number
  kind: 'hl' | 'ul'
  /** the marked text, to detect that the lesson changed under the mark */
  text: string
}

const KEY = 'dee.marks.v1'
const listeners = new Set<() => void>()

function load(): Record<string, Mark[]> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Mark[]>
  } catch {
    return {}
  }
}

let all = load()

function commit(next: Record<string, Mark[]>) {
  all = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable: marks last for this visit only */
  }
  listeners.forEach((l) => l())
}

const NONE: Mark[] = []

export function useMarks(lesson: string): Mark[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => all[lesson] ?? NONE,
  )
}

export function addMark(lesson: string, m: Omit<Mark, 'id'>) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  commit({ ...all, [lesson]: [...(all[lesson] ?? []), { ...m, id }] })
}

export function removeMark(lesson: string, id: string) {
  commit({ ...all, [lesson]: (all[lesson] ?? []).filter((m) => m.id !== id) })
}

export function clearMarks(lesson: string) {
  const next = { ...all }
  delete next[lesson]
  commit(next)
}

/** Wrap the characters [start, end) of an element's text in <mark> elements. */
export function paint(root: HTMLElement, m: Mark) {
  if (root.textContent?.slice(m.start, m.end) !== m.text) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const hits: { node: Text; from: number; to: number }[] = []
  let at = 0
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const len = node.data.length
    const from = Math.max(m.start, at)
    const to = Math.min(m.end, at + len)
    if (from < to) hits.push({ node, from: from - at, to: to - at })
    at += len
    if (at >= m.end) break
  }
  for (const h of hits) {
    const range = document.createRange()
    range.setStart(h.node, h.from)
    range.setEnd(h.node, h.to)
    const el = document.createElement('mark')
    el.className = `um ${m.kind}`
    el.dataset.mark = m.id
    range.surroundContents(el)
  }
}
