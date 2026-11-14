import { LESSONS, lessonById } from '../data/curriculum'
import { GLOSSARY } from '../data/glossary'
import { subjectById } from '../data/subjects'
import { trackById } from '../data/tracks'

export interface Hit {
  key: string
  to: string
  title: string
  sub: string
  color?: string
}

/** Lessons whose title or summary contains the text, then glossary terms. At most eight results. */
export function search(q: string): Hit[] {
  const s = q.trim().toLowerCase()
  if (s.length < 2) return []
  const lessons: Hit[] = LESSONS.filter((l) => (l.title + ' ' + l.summary).toLowerCase().includes(s)).map((l) => ({
    key: 'l' + l.id,
    to: `/lesson/${l.id}`,
    title: l.title,
    sub: `${subjectById[l.subject].name}: ${trackById[l.track].name} line`,
    color: trackById[l.track].color,
  }))
  const terms: Hit[] = GLOSSARY.filter((g) => g.term.toLowerCase().includes(s)).map((g) => ({
    key: 'g' + g.term,
    to: `/lesson/${g.lesson}`,
    title: g.term,
    sub: g.def,
    color: trackById[lessonById[g.lesson].track].color,
  }))
  return [...lessons, ...terms].slice(0, 8)
}
