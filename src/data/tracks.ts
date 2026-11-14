/**
 * The lines on the lesson map. Each lesson belongs to one line (its `track` in the lesson file).
 * The order here is the order on the map and in lists. Where each line sits on the map is set in `src/map/layout.ts`.
 */

export type TrackId =
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
  id: TrackId
  name: string
  blurb: string
  color: string
}

export const TRACKS: Track[] = [
  { id: 'foundations', name: 'Foundations', blurb: 'What the job is, who you do it for, and the engineering habits under all of it.', color: '#132029' },
  { id: 'storage', name: 'Storage', blurb: 'How bytes are laid out, and why layout decides speed and cost.', color: '#2456D6' },
  { id: 'modeling', name: 'Modeling', blurb: 'How to shape tables so people can ask questions of them.', color: '#7A3FD1' },
  { id: 'pipelines', name: 'Pipelines', blurb: 'How data moves from source systems, and how to make reruns safe.', color: '#0B8A78' },
  { id: 'processing', name: 'Processing', blurb: 'Many machines, and data that never stops arriving.', color: '#D0356F' },
  { id: 'architecture', name: 'Architecture', blurb: 'How the parts fit into a platform, and who owns what.', color: '#D8472B' },
  { id: 'ops', name: 'Operations', blurb: 'How to run pipelines on a schedule and trust the output.', color: '#B97700' },
  { id: 'designs', name: 'Worked designs', blurb: 'Six whole systems, each with a different shape, drawn step by step with the reasons for each choice.', color: '#4D7C0F' },
  { id: 'build', name: 'Build it yourself', blurb: 'How to practise with no employer and no budget: a small pipeline of your own, built in the right order.', color: '#B4530A' },
]

export const trackById = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<TrackId, Track>
