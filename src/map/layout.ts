/**
 * Geometry of the lesson map on the home page. Pure numbers, so the build can check lesson positions too.
 *
 * Each line (track) has a band: the x position of each column, and the y position of its first row.
 * A lesson's `at: [column, row]` picks a column of its band and a row below the band's top.
 * Every lesson must sit below all of its prerequisites, so every line on the map runs downward.
 */
import type { DataTrackId } from '../data/tracks.ts'
import type { Lesson } from '../lessons/types.ts'

export const W = 1180
export const ROW = 100
export const WIDE = [200, 395, 590, 785, 980]
const TIER1 = 650
const TIER2 = 1430
const TIER3 = 2210
const TIER4 = 2600
export const BAND: Record<DataTrackId, { x: number[]; y: number }> = {
  foundations: { x: WIDE, y: 70 },
  storage: { x: [44, 232], y: TIER1 },
  modeling: { x: [434, 622], y: TIER1 },
  pipelines: { x: [824, 1012], y: TIER1 },
  processing: { x: [44, 232], y: TIER2 },
  architecture: { x: [434, 622], y: TIER2 },
  ops: { x: [824, 1012], y: TIER2 },
  designs: { x: WIDE, y: TIER3 },
  build: { x: WIDE, y: TIER4 },
}
export const H = TIER4 + 2 * ROW + 96

/** Place of a data engineering lesson on its map. */
export const pos = (l: Pick<Lesson, 'track' | 'at'>) => {
  const b = BAND[l.track as DataTrackId]
  return { x: b.x[l.at[0]], y: b.y + l.at[1] * ROW }
}

const BUS = 30
const R = 14

/** Lines inside a subject run down, across above the lower lesson's label, then down. Other lines curve. */
export function route(a: { x: number; y: number }, b: { x: number; y: number }, same: boolean) {
  if (same) {
    if (a.x === b.x) return `M${a.x} ${a.y} V${b.y}`
    const y = b.y - BUS
    const s = b.x > a.x ? 1 : -1
    return `M${a.x} ${a.y} V${y - R} Q${a.x} ${y} ${a.x + s * R} ${y} H${b.x - s * R} Q${b.x} ${y} ${b.x} ${y + R} V${b.y}`
  }
  if (Math.abs(a.x - b.x) < 1) {
    // Same column in another subject: bow out to the side, so the line does not lie on the column.
    const cx = a.x - 48
    return `M${a.x} ${a.y} C${cx} ${a.y + 70} ${cx} ${b.y - 70} ${b.x} ${b.y}`
  }
  const y0 = a.y + 52
  const ym = (y0 + b.y) / 2
  return `M${a.x} ${a.y} V${y0} C${a.x} ${ym} ${b.x} ${ym} ${b.x} ${b.y}`
}
