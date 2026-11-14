/**
 * The lesson file format. Runs at build time only (in the Vite plugin and the tests), so the site does not ship a
 * Markdown parser. See CONTRIBUTING.md for the format as a writer sees it.
 *
 * A lesson file is a block of YAML between `---` lines, then Markdown with three additions:
 *
 *   ::fig <name> | Caption           a figure from src/figures/index.tsx
 *   ::quiz ... ::end                 `?` question, `-` wrong option, `+` correct option, `!` explanation
 *   ::scenario ... ::end             `?` situation, then `+` best, `~` workable, `-` poor, each as `option | reason`
 */
import { marked } from 'marked'
import { parse as parseYaml } from 'yaml'
import type { LessonContent, QuizQuestion, ScenarioItem, Segment } from './types.ts'

export interface LessonFile {
  /** The YAML block, not yet checked. */
  meta: Record<string, unknown>
  body: string
}

/** Split a lesson file into its YAML block and its Markdown body. */
export function splitLessonFile(src: string): LessonFile {
  const text = src.replace(/\r\n/g, '\n')
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!m) return { meta: {}, body: text }
  const meta = parseYaml(m[1]) ?? {}
  if (typeof meta !== 'object' || Array.isArray(meta)) throw new Error('The block between the --- lines must be a list of `key: value` lines.')
  return { meta: meta as Record<string, unknown>, body: text.slice(m[0].length) }
}

const inline = (s: string) => marked.parseInline(s, { async: false }) as string

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

/** Turn the Markdown body of a lesson into parts and segments. Terms are linked later, in the browser (see `link.ts`). */
export function parseLessonBody(src: string): LessonContent {
  const out: Segment[] = []
  const parts: string[] = ['']
  let part = 0
  let buf: string[] = []
  const flush = () => {
    const text = buf.join('\n').trim()
    if (text) out.push({ type: 'md', part, html: marked.parse(text, { async: false }) as string })
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
