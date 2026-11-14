/**
 * A whole system, drawn at the top of a planned subject in the style of the data engineering drawing.
 * Positions are in drawing units on a board of W x H. Each part names the planned lessons that teach it.
 */
import type { Glyph } from '../../components/system/SystemDrawing'

export type PartKind = 'tile' | 'zone' | 'who' | 'screen'

/** Drawn by hand in PlanSystem.tsx: a browser, a phone, a chip, a neural network, a chat. */
export type ScreenKind = 'browser' | 'phone' | 'chip' | 'network' | 'chat'

export interface SysPart {
  id: string
  x: number
  y: number
  w: number
  /** Default 54. A tile of 80 or more is tall: the icon sits above the label. */
  h?: number
  label: string
  sub?: string
  kind?: PartKind
  glyph?: Glyph
  screen?: ScreenKind
  /** A running total that goes up when data arrives. */
  count?: { start: number; unit: string; per: [number, number] }
  /** A row of small steps inside a zone. `cycle` makes them run one after the other, like the CI/CD steps. */
  chips?: { names: string[]; y: number; cycle?: boolean; gate?: number }
  /** Checks inside a zone: a name, and whether it passes. */
  checks?: [string, boolean][]
  /** Short lines of text inside a zone. */
  notes?: string[]
  /** Planned lesson ids. The test in systems.test.ts checks that each one is in the subject's plan. */
  lessons: string[]
}

export interface SysFlow {
  from: string
  to: string
  /** Seconds between packets. Below 2: a steady stream. 2 or more: a burst, then a wait. No value: no packets. */
  dot?: number
  /** A dashed line: one part controls or checks another. No data moves on it. */
  control?: boolean
}

export interface SystemPlan {
  /** Heading above the drawing. */
  title: string
  lead: string
  W: number
  H: number
  parts: SysPart[]
  flows: SysFlow[]
  /** Section names on the board, like "who uses it". */
  labels: { x: number; y: number; text: string }[]
}
