/**
 * Checks for lesson files. The Vite plugin runs them on every start and build, and the tests run them in CI.
 * Each message names the file and says what to change.
 */
import { GLOSSARY } from '../data/glossary.ts'
import { SOURCES, type SourceId } from '../data/sources.ts'
import { TECH } from '../data/tech.ts'
import { DATA_TRACKS, PLANNED, type DataTrackId, type SubjectId } from '../data/tracks.ts'
import { BAND, pos } from '../map/layout.ts'
import type { LessonFile } from './format.ts'
import type { Lesson } from './types.ts'

const KEYS = ['title', 'summary', 'track', 'level', 'minutes', 'at', 'prereqs', 'tech', 'refs'] as const
const TRACK_IDS = new Set<string>(DATA_TRACKS.map((t) => t.id))
/** Keys of a lesson file in a planned subject. Title, summary, line, level and prerequisites come from the plan. */
const PLAN_KEYS = ['minutes', 'tech', 'refs'] as const

/** Where a lesson file is, for messages. */
export const fileOf = (id: string, subject: SubjectId = 'data') => (subject === 'data' ? `src/content/${id}.md` : `src/content/${subject}/${id}.md`)

export interface LessonCheck {
  lessons: Lesson[]
  errors: string[]
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)
const list = (v: unknown) => (Array.isArray(v) ? v : null)

/** Read `minutes`, `tech` and `refs`, which every lesson file has. */
function readCommon(meta: Record<string, unknown>, bad: (msg: string) => void) {
  if (!isInt(meta.minutes) || (meta.minutes as number) < 1) bad('"minutes" must be a whole number of minutes to read the lesson.')
  const techList = list(meta.tech ?? [])
  if (!techList || !techList.every((t) => typeof t === 'string')) bad('"tech" must be a list of keys from src/data/tech.ts.')
  else for (const t of techList) if (!(t in TECH)) bad(`"tech" has "${t}", which is not a key in src/data/tech.ts.`)
  const refList = list(meta.refs)
  const outRefs: [SourceId, string][] = []
  if (!refList) bad('"refs" must be a list of "- <source id>: <where in the source>" lines.')
  else
    for (const r of refList) {
      const entries = r && typeof r === 'object' && !Array.isArray(r) ? Object.entries(r) : []
      if (entries.length !== 1 || typeof entries[0][1] !== 'string') {
        bad('Each item in "refs" must be one line: "- <source id>: <where in the source>".')
        continue
      }
      const [src, place] = entries[0] as [string, string]
      if (!(src in SOURCES)) bad(`"refs" has "${src}", which is not a key in src/data/sources.ts.`)
      outRefs.push([src as SourceId, place])
    }
  return { tech: (techList ?? []) as string[], refs: outRefs, minutes: meta.minutes as number }
}

/** Read the YAML block of a lesson file in a planned subject. Its place on the map comes from the plan. */
function readPlanMeta(id: string, subject: SubjectId, meta: Record<string, unknown>, errors: string[]): Lesson | null {
  const where = fileOf(id, subject)
  const bad = (msg: string) => errors.push(`${where}: ${msg}`)
  const start = errors.length
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) bad('The file name must be lower-case words joined by "-", for example "my-lesson.md".')
  for (const k of Object.keys(meta))
    if (!(PLAN_KEYS as readonly string[]).includes(k))
      bad(`Unknown key "${k}". Allowed keys: ${PLAN_KEYS.join(', ')}. Title, summary, line and prerequisites come from src/data/plans/${subject}.ts.`)
  const planned = PLANNED.get(id)
  if (!planned || planned.subject !== subject) bad(`"${id}" is not a lesson in src/data/plans/${subject}.ts. Add it to the plan first, or use a planned id as the file name.`)
  const common = readCommon(meta, bad)
  if (errors.length > start || !planned) return null
  const l = planned.lesson
  return {
    id,
    subject,
    title: l.title,
    summary: l.summary,
    track: planned.track,
    level: l.level ?? 'core',
    minutes: common.minutes,
    at: [0, planned.index],
    prereqs: l.prereqs ?? [],
    tech: common.tech,
    refs: common.refs,
  }
}

/** Read the YAML block of one data engineering lesson file into a `Lesson`. Problems are added to `errors`. */
function readMeta(id: string, meta: Record<string, unknown>, errors: string[]): Lesson | null {
  const where = fileOf(id)
  const bad = (msg: string) => errors.push(`${where}: ${msg}`)
  const start = errors.length

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) bad('The file name must be lower-case words joined by "-", for example "my-lesson.md".')
  for (const k of Object.keys(meta)) if (!(KEYS as readonly string[]).includes(k)) bad(`Unknown key "${k}". Allowed keys: ${KEYS.join(', ')}.`)

  const { title, summary, track, level, at, prereqs } = meta
  if (typeof title !== 'string' || !title.trim()) bad('"title" is missing.')
  if (typeof summary !== 'string' || !summary.trim()) bad('"summary" is missing. Write one or two sentences.')
  if (typeof track !== 'string' || !TRACK_IDS.has(track)) bad(`"track" must be one of: ${[...TRACK_IDS].join(', ')}.`)
  if (level !== 'core' && level !== 'deeper') bad('"level" must be "core" or "deeper".')

  const atList = list(at)
  if (!atList || atList.length !== 2 || !atList.every(isInt) || atList.some((n) => (n as number) < 0)) {
    bad('"at" must be [column, row], for example [0, 2].')
  } else if (typeof track === 'string' && TRACK_IDS.has(track)) {
    const cols = BAND[track as DataTrackId].x.length
    if ((atList[0] as number) >= cols) bad(`"at" column must be less than ${cols} on the ${track} line.`)
  }

  const pre = list(prereqs)
  if (!pre || !pre.every((p) => typeof p === 'string')) bad('"prereqs" must be a list of lesson ids, for example [lifecycle, oltp-olap]. Use [] for none.')
  const common = readCommon(meta, bad)

  if (errors.length > start) return null
  return {
    id,
    subject: 'data',
    title: title as string,
    summary: summary as string,
    track: track as string,
    level: level as Lesson['level'],
    minutes: common.minutes,
    at: atList as [number, number],
    prereqs: pre as string[],
    tech: common.tech,
    refs: common.refs,
  }
}

/** Problems in the Markdown body that the parser would accept without a word. */
function checkBody(where: string, body: string, ids: Set<string>, errors: string[]) {
  const lines = body.split('\n')
  let fence = false
  let block: { kind: string; line: number } | null = null
  let q: { line: number; right: number; options: number; why: boolean } | null = null
  const closeQuestion = () => {
    if (!q || block?.kind !== 'quiz') return
    if (q.options < 2) errors.push(`${where}:${q.line}: A quiz question needs two or more options.`)
    if (q.right !== 1) errors.push(`${where}:${q.line}: A quiz question needs exactly one "+" (correct) option. It has ${q.right}.`)
    if (!q.why) errors.push(`${where}:${q.line}: A quiz question needs a "!" line that explains the answer.`)
  }
  lines.forEach((raw, i) => {
    const n = i + 1
    const line = raw.trim()
    if (!block && raw.startsWith('```')) fence = !fence
    if (fence) return
    if (block) {
      if (line === '::end') {
        closeQuestion()
        block = null
        q = null
        return
      }
      if (!line) return
      if (line[0] === '?') {
        closeQuestion()
        q = { line: n, right: 0, options: 0, why: false }
      } else if (block.kind === 'quiz' && q && (line[0] === '+' || line[0] === '-')) {
        q.options++
        if (line[0] === '+') q.right++
      } else if (block.kind === 'quiz' && q && line[0] === '!') q.why = true
      else if (block.kind === 'scenario' && q && '+~-'.includes(line[0])) {
        q.options++
        if (!line.includes('|')) errors.push(`${where}:${n}: A scenario option needs a reason after "|".`)
      } else errors.push(`${where}:${n}: This line is not read inside ::${block.kind}. Lines start with ? + - ${block.kind === 'quiz' ? '!' : '~'}.`)
      return
    }
    if (line === '::quiz' || line === '::scenario') block = { kind: line.slice(2), line: n }
    else if (raw.startsWith('::fig ') && !raw.slice(6).split('|')[0].trim()) errors.push(`${where}:${n}: "::fig" needs a figure name.`)
    else if (line.startsWith('::') && !raw.startsWith('::fig ')) errors.push(`${where}:${n}: Unknown block "${line}". Use ::fig, ::quiz or ::scenario.`)
    for (const m of raw.matchAll(/\]\(\/lesson\/([^)#\s]+)/g)) if (!ids.has(m[1])) errors.push(`${where}:${n}: Link to "/lesson/${m[1]}", which is not a lesson.`)
  })
  if (block) errors.push(`${where}:${(block as { line: number }).line}: "::${(block as { kind: string }).kind}" has no "::end" line.`)
}

/** Check every lesson file and the links between them. */
export function checkLessons(files: { id: string; file: LessonFile; subject?: SubjectId }[]): LessonCheck {
  const errors: string[] = []
  const lessons: Lesson[] = []
  const seen = new Map<string, SubjectId>()
  for (const { id, file, subject = 'data' } of files) {
    const other = seen.get(id)
    if (other) errors.push(`${fileOf(id, subject)}: The id "${id}" is also used by ${fileOf(id, other)}. Lesson ids must be unique across all subjects.`)
    seen.set(id, subject)
    const l = subject === 'data' ? readMeta(id, file.meta, errors) : readPlanMeta(id, subject, file.meta, errors)
    if (l) lessons.push(l)
  }
  const ids = new Set(files.map((f) => f.id))
  for (const { id, file, subject = 'data' } of files) checkBody(fileOf(id, subject), file.body, ids, errors)

  // Places on the data engineering map. Planned subjects are placed by src/map/plan-layout.ts, which has its own checks.
  const byId = new Map(lessons.map((l) => [l.id, l]))
  const seat = new Map<string, string>()
  for (const l of lessons.filter((x) => x.subject === 'data')) {
    const where = fileOf(l.id)
    const key = `${l.track}:${l.at.join(',')}`
    if (seat.has(key)) errors.push(`${where}: "at: [${l.at.join(', ')}]" is the same place as "${seat.get(key)}" on the ${l.track} line.`)
    else seat.set(key, l.id)
    for (const p of l.prereqs) {
      const pl = byId.get(p)
      if (p === l.id) errors.push(`${where}: A lesson cannot be its own prerequisite.`)
      else if (!ids.has(p)) errors.push(`${where}: Prerequisite "${p}" is not a lesson. Use the file name without ".md".`)
      else if (pl && pos(pl).y >= pos(l).y) errors.push(`${where}: Prerequisite "${p}" must be higher on the map. Give this lesson a larger row in "at".`)
    }
  }
  return { lessons, errors }
}

/** Glossary terms must point to a lesson that exists. */
export function checkGlossary(ids: Set<string>): string[] {
  return GLOSSARY.filter((g) => !ids.has(g.lesson)).map((g) => `src/data/glossary.ts: "${g.term}" points to lesson "${g.lesson}", which does not exist.`)
}
