/**
 * The lessons and the links between them, for every subject. Lesson data comes from the YAML block at the top of
 * each file in src/content (see build/vite-plugin-lessons.ts). For software engineering and AI, the title, line and
 * prerequisites come from the plan. To add or change a lesson, edit its file or plan, not this one.
 */
import ALL from 'virtual:lessons'
import type { Lesson } from '../lessons/types'
import { TRACKS, type SubjectId } from './tracks'

export type { Lesson }

// Order inside each line: top of the map first.
const trackOrder = TRACKS.map((t) => t.id)
export const LESSONS: Lesson[] = [...ALL].sort(
  (a, b) => trackOrder.indexOf(a.track) - trackOrder.indexOf(b.track) || a.at[1] - b.at[1] || a.at[0] - b.at[0],
)

export const lessonById: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]))

const bySubject = new Map<SubjectId, Lesson[]>((['data', 'software', 'ai'] as SubjectId[]).map((s) => [s, LESSONS.filter((l) => l.subject === s)]))
/** The written lessons of one subject, in map order. */
export const lessonsIn = (s: SubjectId): Lesson[] => bySubject.get(s) ?? []

const byTrack = new Map<string, Lesson[]>(TRACKS.map((t) => [t.id, LESSONS.filter((l) => l.track === t.id)]))
/** The written lessons of one line, top of the map first. */
export const lessonsOf = (t: string): Lesson[] => byTrack.get(t) ?? []

const leadsTo = new Map<string, Lesson[]>(LESSONS.map((l) => [l.id, LESSONS.filter((x) => x.prereqs.includes(l.id))]))
/** Lessons that have this lesson as a prerequisite. */
export const dependents = (id: string): Lesson[] => leadsTo.get(id) ?? []
