import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { lessonById } from '../curriculum'
import { GLOSSARY } from '../glossary'
import { LESSON_TECH, TECH } from '../tech'

export interface QuizQuestion {
  q: string
  options: { text: string; correct: boolean }[]
  why: string
}

/** `part` is the section of the lesson: 0 is the opening, then one for each second-level heading. */
export type Segment = (
  | { type: 'md'; html: string }
  | { type: 'fig'; name: string; caption: string }
  | { type: 'quiz'; questions: QuizQuestion[] }
  | { type: 'scenario'; items: ScenarioItem[] }
) & { part: number }

export interface LessonContent {
  segs: Segment[]
  /** Title of each part. The opening has no heading of its own. */
  parts: string[]
}

export interface ScenarioItem {
  q: string
  options: { text: string; why: string; verdict: 'best' | 'ok' | 'poor' }[]
}

// Each lesson's text is its own small file, loaded when the lesson opens.
const raw = import.meta.glob('../content/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>

const inline = (s: string) => marked.parseInline(s, { async: false }) as string

/** Turn the first mention of each technology group into a term that opens its side note. */
function linkTech(html: string, keys: string[], used: Set<string>): string {
  const todo = keys.filter((k) => !used.has(k))
  if (!todo.length || typeof DOMParser === 'undefined') return html
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild!
  for (const key of todo) {
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const n = walker.currentNode as Text
      if (!n.parentElement || n.parentElement.closest('a,code,pre,h1,h2,h3,h4,th,button')) continue
      const m = TECH[key].match.exec(n.data)
      if (!m) continue
      const range = doc.createRange()
      range.setStart(n, m.index)
      range.setEnd(n, m.index + m[0].length)
      const b = doc.createElement('button')
      b.type = 'button'
      b.className = 'tech'
      b.dataset.tech = key
      range.surroundContents(b)
      used.add(key)
      break
    }
  }
  return root.innerHTML
}

/* ---- terms from other lessons ---- */

const PLAIN = new Set(['Requirement', 'Stakeholder', 'Metric', 'Compression', 'Clustering', 'Staging', 'Topic', 'Offset', 'Window', 'Skew', 'Region', 'Stage', 'Agent', 'Sensor', 'Partition'])
const TERMS = GLOSSARY.map((g, i) => {
  const base = g.term.replace(/\s*\(.*\)$/, '')
  const acronym = /^[A-Z/]{2,6}$/.test(base)
  const body = base.replace(/[.*+?^${}()|[\]\\/]/g, '\\function parse(src: string, id: string): Segment[] {').replace(/[- ]/g, '[- ]')
  return { i, base, lesson: g.lesson, basic: !!g.basic, skip: PLAIN.has(base), re: new RegExp(`(?<![\\w-])${body}(?:s|es)?(?![\\w-])`, acronym ? '' : 'i') }
})

/** Every lesson that comes before this one on the map: its prerequisites, and theirs. */
export function before(id: string): Set<string> {
  const seen = new Set<string>()
  const walk = (x: string) => lessonById[x]?.prereqs.forEach((p) => !seen.has(p) && (seen.add(p), walk(p)))
  walk(id)
  return seen
}

/** Glossary terms that this lesson may use without a definition: its own, and those of the lessons before it. */
export function termsFor(id: string) {
  const known = before(id)
  known.add(id)
  const taught = new Set(TERMS.filter((t) => !t.basic && known.has(t.lesson)).map((t) => t.base.toLowerCase()))
  return TERMS.filter((t) => !t.skip && !taught.has(t.base.toLowerCase()))
}

/** Give the first use of each term from an untaught lesson a definition that opens at the side. */
function linkTerms(html: string, todo: ReturnType<typeof termsFor>, used: Set<string>): string {
  if (!todo.length || typeof DOMParser === 'undefined') return html
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild!
  for (const t of todo) {
    const key = t.base.toLowerCase()
    if (used.has(key)) continue
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const n = walker.currentNode as Text
      if (!n.parentElement || n.parentElement.closest('a,code,pre,h1,h2,h3,h4,th,button,strong')) continue
      const m = t.re.exec(n.data)
      if (!m) continue
      const range = doc.createRange()
      range.setStart(n, m.index)
      range.setEnd(n, m.index + m[0].length)
      const b = doc.createElement('button')
      b.type = 'button'
      b.className = 'term'
      b.dataset.term = String(t.i)
      range.surroundContents(b)
      used.add(key)
      break
    }
  }
  return root.innerHTML
}

/** Lines that start a part: each second-level heading, and the third-level headings of a section that is too long to read in one go. */
function partStarts(lines: string[]): Set<number> {
  const starts = new Set<number>()
  let fence = false
  let h2 = -1
  let h3: number[] = []
  let words = 0
  const close = () => {
    if (h2 >= 0 && words > 260 && h3.length > 1) h3.forEach((i) => starts.add(i))
  }
  lines.forEach((line, i) => {
    if (line.startsWith('```')) fence = !fence
    if (fence) return
    if (line.startsWith('## ')) {
      close()
      starts.add(i)
      h2 = i
      h3 = []
      words = 0
    } else if (line.startsWith('### ')) h3.push(i)
    else words += line.split(/\s+/).filter(Boolean).length
  })
  close()
  return starts
}

function parse(src: string, id: string): LessonContent {
  const keys = LESSON_TECH[id] ?? []
  const used = new Set<string>()
  const terms = termsFor(id)
  const usedTerms = new Set<string>()
  const out: Segment[] = []
  const parts: string[] = ['']
  let part = 0
  let buf: string[] = []
  const flush = () => {
    const text = buf.join('\n').trim()
    if (text) {
      const html = linkTech(marked.parse(text, { async: false }) as string, keys, used)
      out.push({ type: 'md', part, html: linkTerms(html, terms, usedTerms) })
    }
    buf = []
  }
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const starts = partStarts(lines)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (starts.has(i)) {
            flush()
      part = parts.push(line.replace(/^#+\s*/, '').trim()) - 1
      buf.push(line)
    } else if (line.startsWith('::fig ')) {
      flush()
      const [name, ...cap] = line.slice(6).split('|')
      out.push({ type: 'fig', part, name: name.trim(), caption: inline(cap.join('|').trim()) })
    } else if (line.trim() === '::quiz') {
      flush()
      const questions: QuizQuestion[] = []
      let cur: QuizQuestion | null = null
      for (i++; i < lines.length && lines[i].trim() !== '::end'; i++) {
        const l = lines[i].trim()
        if (!l) continue
        const body = inline(l.slice(1).trim())
        if (l[0] === '?') {
          cur = { q: body, options: [], why: '' }
          questions.push(cur)
        } else if (cur && (l[0] === '-' || l[0] === '+')) {
          cur.options.push({ text: body, correct: l[0] === '+' })
        } else if (cur && l[0] === '!') {
          cur.why = body
        }
      }
      out.push({ type: 'quiz', part, questions })
    } else if (line.trim() === '::scenario') {
      flush()
      const items: ScenarioItem[] = []
      let cur: ScenarioItem | null = null
      for (i++; i < lines.length && lines[i].trim() !== '::end'; i++) {
        const l = lines[i].trim()
        if (!l) continue
        if (l[0] === '?') {
          cur = { q: inline(l.slice(1).trim()), options: [] }
          items.push(cur)
        } else if (cur && '+~-'.includes(l[0])) {
          const [text, ...why] = l.slice(1).split('|')
          cur.options.push({
            text: inline(text.trim()),
            why: inline(why.join('|').trim()),
            verdict: l[0] === '+' ? 'best' : l[0] === '~' ? 'ok' : 'poor',
          })
        }
      }
      out.push({ type: 'scenario', part, items })
    } else {
      buf.push(line)
    }
  }
  flush()
  return { segs: out, parts }
}

const cache = new Map<string, LessonContent>()

const keyOf = (id: string) => Object.keys(raw).find((k) => k.endsWith(`/${id}.md`))

/** Parsed lesson if it is loaded, null if the lesson has no text, undefined while it is not loaded yet. */
export function lessonContent(id: string): LessonContent | null | undefined {
  if (cache.has(id)) return cache.get(id)!
  return keyOf(id) ? undefined : null
}

export async function loadLessonContent(id: string): Promise<LessonContent | null> {
  if (cache.has(id)) return cache.get(id)!
  const key = keyOf(id)
  if (!key) return null
  const c = parse(await raw[key](), id)
  cache.set(id, c)
  return c
}

export function useLessonContent(id: string | undefined): LessonContent | null | undefined {
  const [, bump] = useState(0)
  const c = id ? lessonContent(id) : null
  useEffect(() => {
    if (!id || c !== undefined) return
    let live = true
    loadLessonContent(id).then(() => live && bump((n) => n + 1))
    return () => {
      live = false
    }
  }, [id, c])
  return c
}
