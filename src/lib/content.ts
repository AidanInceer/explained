import { marked } from 'marked'

export interface QuizQuestion {
  q: string
  options: { text: string; correct: boolean }[]
  why: string
}

export type Segment =
  | { type: 'md'; html: string }
  | { type: 'fig'; name: string; caption: string }
  | { type: 'quiz'; questions: QuizQuestion[] }

const raw = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

const inline = (s: string) => marked.parseInline(s, { async: false }) as string

function parse(src: string): Segment[] {
  const out: Segment[] = []
  let buf: string[] = []
  const flush = () => {
    const text = buf.join('\n').trim()
    if (text) out.push({ type: 'md', html: marked.parse(text, { async: false }) as string })
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
  const segs = parse(raw[key])
  cache.set(id, segs)
  return segs
}
