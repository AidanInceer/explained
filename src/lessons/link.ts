/**
 * Marks words in a lesson's HTML that open a note at the side. Runs in the browser, after the lesson loads.
 *
 * - Technology: the first mention of each group in the lesson's `tech` list (see src/data/tech.ts).
 * - Terms: the first use of each glossary term that a lesson off this lesson's path explains.
 */
import { lessonById } from '../data/curriculum'
import { GLOSSARY } from '../data/glossary'
import { TECH } from '../data/tech'
import type { LessonContent } from './types'

/* Common words that are also glossary terms. They are not marked in lesson text. */
const PLAIN = new Set(['Requirement', 'Stakeholder', 'Metric', 'Compression', 'Clustering', 'Staging', 'Topic', 'Offset', 'Window', 'Skew', 'Region', 'Stage', 'Agent', 'Sensor', 'Partition'])

const TERMS = GLOSSARY.map((g, i) => {
  const base = g.term.replace(/\s*\(.*\)$/, '')
  const acronym = /^[A-Z/]{2,6}$/.test(base)
  const body = base.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&').replace(/[- ]/g, '[- ]')
  return { i, base, lesson: g.lesson, basic: !!g.basic, skip: PLAIN.has(base), re: new RegExp(`(?<![\\w-])${body}(?:s|es)?(?![\\w-])`, acronym ? '' : 'i') }
})
type TermRule = (typeof TERMS)[number]

/** Every lesson that comes before this one on the map: its prerequisites, and theirs. */
export function before(id: string): Set<string> {
  const seen = new Set<string>()
  const walk = (x: string) => lessonById[x]?.prereqs.forEach((p) => !seen.has(p) && (seen.add(p), walk(p)))
  walk(id)
  return seen
}

/** Glossary terms that need a definition in this lesson: all terms except those taught on its path, and common words. */
export function termsFor(id: string): TermRule[] {
  const known = before(id)
  known.add(id)
  const taught = new Set(TERMS.filter((t) => !t.basic && known.has(t.lesson)).map((t) => t.base.toLowerCase()))
  return TERMS.filter((t) => !t.skip && !taught.has(t.base.toLowerCase()))
}

/** Wrap the first text match of `re` under `root` in a button. Skips text inside the elements in `skip`. */
function wrapFirst(doc: Document, root: Element, re: RegExp, skip: string, set: (b: HTMLButtonElement) => void): boolean {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const n = walker.currentNode as Text
    if (!n.parentElement || n.parentElement.closest(skip)) continue
    const m = re.exec(n.data)
    if (!m) continue
    const range = doc.createRange()
    range.setStart(n, m.index)
    range.setEnd(n, m.index + m[0].length)
    const b = doc.createElement('button')
    b.type = 'button'
    set(b)
    range.surroundContents(b)
    return true
  }
  return false
}

/** Mark technology groups and terms in one block of HTML. `usedTech` and `usedTerms` carry across the blocks of a lesson. */
function linkBlock(html: string, tech: string[], usedTech: Set<string>, terms: TermRule[], usedTerms: Set<string>): string {
  const techTodo = tech.filter((k) => !usedTech.has(k))
  const termTodo = terms.filter((t) => !usedTerms.has(t.base.toLowerCase()))
  if ((!techTodo.length && !termTodo.length) || typeof DOMParser === 'undefined') return html
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild!
  for (const key of techTodo) {
    const hit = wrapFirst(doc, root, TECH[key].match, 'a,code,pre,h1,h2,h3,h4,th,button', (b) => {
      b.className = 'tech'
      b.dataset.tech = key
    })
    if (hit) usedTech.add(key)
  }
  for (const t of termTodo) {
    const key = t.base.toLowerCase()
    if (usedTerms.has(key)) continue
    const hit = wrapFirst(doc, root, t.re, 'a,code,pre,h1,h2,h3,h4,th,button,strong', (b) => {
      b.className = 'term'
      b.dataset.term = String(t.i)
    })
    if (hit) usedTerms.add(key)
  }
  return root.innerHTML
}

/** Return the lesson with technology groups and terms marked in its text blocks, in reading order. */
export function linkLesson(id: string, content: LessonContent): LessonContent {
  const tech = lessonById[id]?.tech ?? []
  const terms = termsFor(id)
  const usedTech = new Set<string>()
  const usedTerms = new Set<string>()
  return {
    segs: content.segs.map((s) => (s.type === 'md' ? { ...s, html: linkBlock(s.html, tech, usedTech, terms, usedTerms) } : s)),
    parts: content.parts,
  }
}
