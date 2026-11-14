/**
 * The lessons and the links between them. Lesson data comes from the YAML block at the top of each file in
 * src/content (see build/vite-plugin-lessons.ts). To add or change a lesson, edit its file, not this one.
 */
import ALL from 'virtual:lessons'
import type { Lesson } from '../lessons/types'
import { TRACKS, type TrackId } from './tracks'

export type { Lesson }

// Order inside each line: top of the map first.
const trackOrder = TRACKS.map((t) => t.id)
export const LESSONS: Lesson[] = [...ALL].sort(
  (a, b) => trackOrder.indexOf(a.track) - trackOrder.indexOf(b.track) || a.at[1] - b.at[1] || a.at[0] - b.at[0],
)

export const lessonById: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]))

const byTrack = new Map<TrackId, Lesson[]>(TRACKS.map((t) => [t.id, LESSONS.filter((l) => l.track === t.id)]))
/** The lessons of one line, top of the map first. */
export const lessonsOf = (t: TrackId): Lesson[] => byTrack.get(t) ?? []

const leadsTo = new Map<string, Lesson[]>(LESSONS.map((l) => [l.id, LESSONS.filter((x) => x.prereqs.includes(l.id))]))
/** Lessons that have this lesson as a prerequisite. */
export const dependents = (id: string): Lesson[] => leadsTo.get(id) ?? []
