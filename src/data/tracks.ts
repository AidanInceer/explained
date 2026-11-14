/**
 * The lines on the lesson maps. Each lesson belongs to one line.
 *
 * - Data engineering: the lines are listed here, and each lesson file names its line in `track`. Where each line
 *   sits on the map is set in `src/map/layout.ts`.
 * - Software engineering and AI: the lines come from the plans in `src/data/plans/`. A lesson file there has no
 *   `track`: its line is the plan line that lists it.
 */
import { AI_PLAN } from './plans/ai.ts'
import { SOFTWARE_PLAN } from './plans/software.ts'
import type { PlanLine } from '../map/plan-layout.ts'

export type SubjectId = 'data' | 'software' | 'ai'
/** Subjects whose map comes from a plan: lessons are placed from their order and prerequisites. */
export type PlanSubjectId = Exclude<SubjectId, 'data'>

export type DataTrackId =
  | 'foundations'
  | 'storage'
  | 'modeling'
  | 'pipelines'
  | 'processing'
  | 'ops'
  | 'architecture'
  | 'designs'
  | 'build'

export interface Track {
  id: string
  subject: SubjectId
  name: string
  blurb: string
  color: string
}

export const DATA_TRACKS: (Track & { id: DataTrackId })[] = [
  { id: 'foundations', subject: 'data', name: 'Foundations', blurb: 'What the job is, who you do it for, and the engineering habits under all of it.', color: 'var(--line-ink)' },
  { id: 'storage', subject: 'data', name: 'Storage', blurb: 'How bytes are laid out, and why layout decides speed and cost.', color: '#2456D6' },
  { id: 'modeling', subject: 'data', name: 'Modeling', blurb: 'How to shape tables so people can ask questions of them.', color: '#7A3FD1' },
  { id: 'pipelines', subject: 'data', name: 'Pipelines', blurb: 'How data moves from source systems, and how to make reruns safe.', color: '#0B8A78' },
  { id: 'processing', subject: 'data', name: 'Processing', blurb: 'Many machines, and data that never stops arriving.', color: '#D0356F' },
  { id: 'architecture', subject: 'data', name: 'Architecture', blurb: 'How the parts fit into a platform, and who owns what.', color: '#D8472B' },
  { id: 'ops', subject: 'data', name: 'Operations', blurb: 'How to run pipelines on a schedule and trust the output.', color: '#B97700' },
  { id: 'designs', subject: 'data', name: 'Worked designs', blurb: 'Six whole systems, each with a different shape, drawn step by step with the reasons for each choice.', color: '#4D7C0F' },
  { id: 'build', subject: 'data', name: 'Build it yourself', blurb: 'How to practise with no employer and no budget: a small pipeline of your own, built in the right order.', color: '#B4530A' },
]

export const PLANS: Record<PlanSubjectId, PlanLine[]> = { software: SOFTWARE_PLAN, ai: AI_PLAN }

/** The track id of a plan line: the subject, then the line name in lower-case words. */
export const lineId = (subject: SubjectId, name: string) =>
  `${subject}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

const PLAN_TRACKS: Track[] = (Object.keys(PLANS) as PlanSubjectId[]).flatMap((subject) =>
  PLANS[subject].map((l) => ({ id: lineId(subject, l.name), subject, name: l.name, blurb: l.blurb, color: l.color })),
)

/** Every line of every subject. The order is the order on the maps and in lists. */
export const TRACKS: Track[] = [...DATA_TRACKS, ...PLAN_TRACKS]

export const trackById: Record<string, Track> = Object.fromEntries(TRACKS.map((t) => [t.id, t]))

/** Each planned lesson, with its line, by id. Lesson files of planned subjects take their place on the map from here. */
export const PLANNED = new Map(
  (Object.keys(PLANS) as PlanSubjectId[]).flatMap((subject) =>
    PLANS[subject].flatMap((line) => line.lessons.map((l, i) => [l.id, { subject, line, lesson: l, index: i, track: lineId(subject, line.name) }] as const)),
  ),
)
