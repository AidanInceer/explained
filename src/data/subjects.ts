/**
 * The subjects of the site. Each has a map of lessons, and its own toolkit, glossary, sources and interviews pages.
 *
 * - Data engineering: lessons are the files in src/content, and each file sets its place on the map.
 * - Software engineering and AI: the map comes from the plans in src/data/plans/. A lesson file in
 *   src/content/<subject>/ gives a planned lesson its text. A planned lesson with no file shows as a dashed stop.
 */

import type { PlanLine } from '../map/plan-layout'
import { lessonById, lessonsIn } from './curriculum'
import { AI_SYSTEM } from './systems/ai'
import { SOFTWARE_SYSTEM } from './systems/software'
import type { SystemPlan } from './systems/types'
import { PLANS, type SubjectId } from './tracks'

export type { PlanLine, SubjectId }

export interface Subject {
  id: SubjectId
  /** Full name, as in "Data engineering". */
  name: string
  /** Short name for the subject switcher in the header. */
  short: string
  /** One or two sentences for the subject's card on the home page. */
  blurb: string
  /** The subject's colour on the home page. */
  color: string
  path: string
  /** 'written': the map comes from the lesson files. 'planned': the map comes from a plan in src/data/plans/. */
  status: 'written' | 'planned'
  headline: string
  lead: string
  /** Lines of planned lessons. Empty for data engineering: its map comes from the lesson files. */
  lines: PlanLine[]
  /** The whole system, drawn at the top of the subject's page. Data engineering has its own drawing. */
  system?: SystemPlan
}

export const SUBJECTS: Subject[] = [
  {
    id: 'data',
    name: 'Data engineering',
    short: 'Data',
    blurb: 'How data is stored, modeled, moved, processed and kept correct. From the first table to a whole platform, with worked designs and a project of your own.',
    color: '#2456D6',
    path: '/data',
    status: 'written',
    headline: 'Data engineering, explained in small pieces.',
    lead: '',
    lines: [],
  },
  {
    id: 'software',
    name: 'Software engineering',
    short: 'Software',
    blurb: 'How software is written, shipped and kept running: from the database and the server to the web page and the app on your phone.',
    color: '#0B8A78',
    path: '/software',
    status: 'planned',
    headline: 'Software engineering, explained in small pieces.',
    lead: 'How software is written, shipped and kept running: the web, apps, back ends, design and the work of a team. One idea in each lesson, with the reason behind each choice.',
    lines: PLANS.software,
    system: SOFTWARE_SYSTEM,
  },
  {
    id: 'ai',
    name: 'AI',
    short: 'AI',
    blurb: 'From the chips and the maths underneath, through neural networks, to how a large language model writes text, and how to build with one.',
    color: '#7A3FD1',
    path: '/ai',
    status: 'planned',
    headline: 'AI, explained in small pieces.',
    lead: 'From the maths and the chips underneath, through classic machine learning and neural networks, to how a large language model works, how to build with one, and how to check that it behaves.',
    lines: PLANS.ai,
    system: AI_SYSTEM,
  },
]

export const subjectById = Object.fromEntries(SUBJECTS.map((s) => [s.id, s])) as Record<SubjectId, Subject>

/** Pages that every subject has, after its path: "/data/toolkit". */
export const SUBJECT_PAGES = ['toolkit', 'glossary', 'sources', 'interviews'] as const

/**
 * The subject that an address belongs to. The home page ("/") belongs to none. A lesson belongs to its subject.
 * Old addresses from before the subjects ("/toolkit", "/glossary", "/sources") are data engineering.
 */
export function subjectOfPath(path: string): Subject | null {
  if (path === '/') return null
  const lesson = /^\/lesson\/([^/]+)/.exec(path)
  if (lesson) return subjectById[lessonById[lesson[1]]?.subject ?? 'data']
  return SUBJECTS.find((s) => path === s.path || path.startsWith(s.path + '/')) ?? subjectById.data
}

/** Lessons on the subject's map, written or not, and how many have text. */
export function countsOf(s: Subject) {
  const written = lessonsIn(s.id).length
  const total = s.status === 'written' ? written : s.lines.reduce((n, l) => n + l.lessons.length, 0)
  return { written, total, lines: s.status === 'written' ? new Set(lessonsIn(s.id).map((l) => l.track)).size : s.lines.length }
}
