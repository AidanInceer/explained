import type { SourceId } from '../data/sources.ts'
import type { TrackId } from '../data/tracks.ts'

/** What a lesson file says about itself in the block between the `---` lines at the top. */
export interface Lesson {
  /** The file name without `.md`. Also the address: `/lesson/<id>`. */
  id: string
  track: TrackId
  title: string
  summary: string
  level: 'core' | 'deeper'
  minutes: number
  prereqs: string[]
  /** Technology groups shown at the side. Keys of `TECH` in `src/data/tech.ts`. */
  tech: string[]
  refs: [SourceId, string][]
  /** Place on the map: [column inside the line's band, row]. */
  at: [number, number]
}

export interface QuizQuestion {
  q: string
  options: { text: string; correct: boolean }[]
  why: string
}

export interface ScenarioItem {
  q: string
  options: { text: string; why: string; verdict: 'best' | 'ok' | 'poor' }[]
}

/** `part` is the section of the lesson: 0 is the opening, then one for each second-level heading. */
export type Segment = (
  | { type: 'md'; html: string }
  | { type: 'fig'; name: string; caption: string }
  | { type: 'quiz'; questions: QuizQuestion[] }
  | { type: 'scenario'; items: ScenarioItem[] }
) & { part: number }

export interface LessonContent {
  segs: Segment[]
  /** Title of each part. The opening has no heading of its own. */
  parts: string[]
}
