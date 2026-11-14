import { marked } from 'marked'
import { LESSON_TECH, TECH } from '../tech'

export interface QuizQuestion {
  q: string
  options: { text: string; correct: boolean }[]
  why: string
}

export type Segment =
  | { type: 'md'; html: string }
  | { type: 'fig'; name: string; caption: string }
  | { type: 'quiz'; questions: QuizQuestion[] }
  | { type: 'scenario'; items: ScenarioItem[] }

export interface ScenarioItem {
  q: string
  options: { text: string; why: string; verdict: 'best' | 'ok' | 'poor' }[]
}

const raw = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
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

function parse(src: string, id: string): Segment[] {
  const keys = LESSON_TECH[id] ?? []
  const used = new Set<string>()
  const out: Segment[] = []
  let buf: string[] = []
  const flush = () => {
    const text = buf.join('\n').trim()
    if (text) out.push({ type: 'md', html: linkTech(marked.parse(text, { async: false }) as string, keys, used) })
    buf = []
  }
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('::fig ')) {
      flush()
      const [name, ...cap] = line.slice(6).split('|')
      out.push({ type: 'fig', name: name.trim(), caption: inline(cap.join('|').trim()) })
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
      out.push({ type: 'quiz', questions })
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
      out.push({ type: 'scenario', items })
    } else {
      buf.push(line)
    }
  }
  flush()
  return out
}

const cache = new Map<string, Segment[]>()

export function lessonContent(id: string): Segment[] | null {
  if (cache.has(id)) return cache.get(id)!
  const key = Object.keys(raw).find((k) => k.endsWith(`/${id}.md`))
  if (!key) return null
  const segs = parse(raw[key], id)
  cache.set(id, segs)
  return segs
}
