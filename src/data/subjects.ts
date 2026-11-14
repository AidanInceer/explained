/**
 * The subjects of the site. Data engineering is written: its lessons are the files in src/content.
 * The other subjects are plans: lines of lesson titles with no text yet. They show as skeleton maps, so readers
 * can see what is coming and contributors can pick a lesson to write.
 *
 * The plans are in src/data/plans/. To propose a lesson, open a "Lesson proposal" issue.
 */

import type { PlanLine } from '../map/plan-layout'
import { AI_PLAN } from './plans/ai'
import { SOFTWARE_PLAN } from './plans/software'

export type { PlanLine }
export type SubjectId = 'data' | 'software' | 'ai'

export interface Subject {
  id: SubjectId
  /** Full name, as in "Data engineering, explained". */
  name: string
  /** Short name for the subject switcher in the header. */
  short: string
  path: string
  status: 'written' | 'planned'
  headline: string
  lead: string
  /** Lines of planned lessons. Empty for a written subject: its map comes from the lesson files. */
  lines: PlanLine[]
}

export const SUBJECTS: Subject[] = [
  {
    id: 'data',
    name: 'Data engineering',
    short: 'Data',
    path: '/',
    status: 'written',
    headline: 'Data engineering, explained in small pieces.',
    lead: '',
    lines: [],
  },
  {
    id: 'software',
    name: 'Software engineering',
    short: 'Software',
    path: '/software',
    status: 'planned',
    headline: 'Software engineering, explained in small pieces.',
    lead: 'How software is written, shipped and kept running: the web, apps, back ends, design and the work of a team. One idea in each lesson, with a drawing and the reason behind each choice.',
    lines: SOFTWARE_PLAN,
  },
  {
    id: 'ai',
    name: 'AI',
    short: 'AI',
    path: '/ai',
    status: 'planned',
    headline: 'AI, explained in small pieces.',
    lead: 'From the maths and the chips underneath, through classic machine learning and neural networks, to how a large language model works, how to build with one, and how to check that it behaves.',
    lines: AI_PLAN,
  },
]

export const subjectById = Object.fromEntries(SUBJECTS.map((s) => [s.id, s])) as Record<SubjectId, Subject>

/** The subject that an address belongs to. Everything that is not a planned subject is data engineering. */
export const subjectOfPath = (path: string): Subject =>
  SUBJECTS.find((s) => s.status === 'planned' && (path === s.path || path.startsWith(s.path + '/'))) ?? subjectById.data
