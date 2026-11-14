/**
 * Map layout for planned subjects (software engineering, AI). Planned lessons have no `at`: the layout places
 * them from their order and prerequisites, so a contributor only lists lessons and what comes first.
 *
 * - Lines are grouped in tiers, top to bottom. A tier holds one wide line (5 columns) or two or three lines
 *   side by side.
 * - In a line, a lesson goes in the first free column of the first row below all its prerequisites on that line.
 * - A prerequisite on another line must be in a higher tier, so every line on the map runs downward.
 */
import { ROW, W, WIDE, route } from './layout.ts'

export interface PlanLesson {
  id: string
  title: string
  summary: string
  level?: 'core' | 'deeper'
  /** Ids of lessons that help to know first. On the same line: listed earlier. On another line: a higher tier. */
  prereqs?: string[]
}

export interface PlanLine {
  name: string
  blurb: string
  color: string
  /** Row of lines on the map, from 0 at the top. */
  tier: number
  lessons: PlanLesson[]
}

/** Column x positions for a tier with 1, 2 or 3 lines. */
const COLUMNS: Record<number, number[][]> = {
  1: [WIDE],
  2: [
    [44, 232, 420],
    [624, 812, 1000],
  ],
  3: [
    [44, 232],
    [434, 622],
    [824, 1012],
  ],
}
const TOP = 70
/** Space between the last row of a tier and the first row of the next: room for the line names. */
const TIER_GAP = 190

export interface PlacedLesson extends PlanLesson {
  x: number
  y: number
  line: PlanLine
  wide: boolean
}

export interface PlanMapLayout {
  W: number
  H: number
  lessons: PlacedLesson[]
  byId: Record<string, PlacedLesson>
  pills: { line: PlanLine; x: number; y: number }[]
  edges: { key: string; from: string; to: string; same: boolean; color: string; d: string }[]
}

export const tiersOf = (lines: PlanLine[]) =>
  [...new Set(lines.map((l) => l.tier))].sort((a, b) => a - b).map((t) => lines.filter((l) => l.tier === t))

/** Problems in a plan, as sentences. An empty list means the plan can be drawn. */
export function checkPlan(lines: PlanLine[]): string[] {
  const errors: string[] = []
  const tierOf = new Map<string, number>()
  const lineOf = new Map<string, PlanLine>()
  for (const tier of tiersOf(lines)) {
    if (!COLUMNS[tier.length]) errors.push(`Tier ${tier[0].tier} has ${tier.length} lines. A tier can have 1, 2 or 3.`)
  }
  for (const line of lines) {
    for (const l of line.lessons) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.id)) errors.push(`"${l.id}": use lower-case words joined by "-".`)
      if (lineOf.has(l.id)) errors.push(`"${l.id}" is used twice.`)
      tierOf.set(l.id, line.tier)
      lineOf.set(l.id, line)
    }
  }
  for (const line of lines) {
    const seen = new Set<string>()
    for (const l of line.lessons) {
      for (const p of l.prereqs ?? []) {
        const pl = lineOf.get(p)
        if (!pl) errors.push(`"${l.id}": prerequisite "${p}" is not a planned lesson.`)
        else if (pl === line && !seen.has(p)) errors.push(`"${l.id}": prerequisite "${p}" must be listed before it on "${line.name}".`)
        else if (pl !== line && tierOf.get(p)! >= line.tier)
          errors.push(`"${l.id}": prerequisite "${p}" is on "${pl.name}", which must be in a higher tier than "${line.name}".`)
      }
      seen.add(l.id)
    }
  }
  return errors
}

export function layoutPlan(lines: PlanLine[]): PlanMapLayout {
  const placed: PlacedLesson[] = []
  const byId: Record<string, PlacedLesson> = {}
  const pills: PlanMapLayout['pills'] = []
  let y = TOP
  for (const tier of tiersOf(lines)) {
    const xs = COLUMNS[tier.length] ?? COLUMNS[3]
    let rows = 1
    tier.forEach((line, i) => {
      const cols = xs[i] ?? xs[xs.length - 1]
      const taken: boolean[][] = []
      const rowOf = new Map<string, number>()
      for (const l of line.lessons) {
        const same = (l.prereqs ?? []).filter((p) => rowOf.has(p))
        let r = same.length ? Math.max(...same.map((p) => rowOf.get(p)!)) + 1 : 0
        let c = -1
        while (c < 0) {
          taken[r] ??= []
          c = cols.findIndex((_, k) => !taken[r][k])
          if (c < 0) r++
        }
        taken[r][c] = true
        rowOf.set(l.id, r)
        const p: PlacedLesson = { ...l, x: cols[c], y: y + r * ROW, line, wide: cols === WIDE }
        placed.push(p)
        byId[l.id] = p
        rows = Math.max(rows, r + 1)
      }
      const first = placed.find((p) => p.line === line)
      pills.push({ line, x: cols === WIDE && first ? first.x : cols[0], y: y - 54 })
    })
    y += (rows - 1) * ROW + TIER_GAP
  }
  const edges = placed.flatMap((l) =>
    (l.prereqs ?? [])
      .filter((p) => byId[p])
      .map((p) => {
        const from = byId[p]
        const same = from.line === l.line
        return { key: `${p}>${l.id}`, from: p, to: l.id, same, color: from.line.color, d: route(from, l, same) }
      }),
  )
  return { W, H: y - TIER_GAP + 96, lessons: placed, byId, pills, edges }
}
