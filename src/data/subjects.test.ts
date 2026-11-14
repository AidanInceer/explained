import { describe, expect, test } from 'vitest'
import { checkPlan, layoutPlan, type PlanLine } from '../map/plan-layout.ts'
import { SUBJECTS, subjectOfPath } from './subjects'

describe('planned subjects', () => {
  for (const s of SUBJECTS.filter((s) => s.status === 'planned')) {
    test(`${s.id}: the plan can be drawn`, () => {
      expect(checkPlan(s.lines)).toEqual([])
    })
    test(`${s.id}: every lesson sits below its prerequisites, and no two lessons share a place`, () => {
      const map = layoutPlan(s.lines)
      for (const l of map.lessons) for (const p of l.prereqs ?? []) expect(map.byId[p].y, `${p} > ${l.id}`).toBeLessThan(l.y)
      const places = map.lessons.map((l) => `${l.x},${l.y}`)
      expect(new Set(places).size).toBe(places.length)
    })
  }
})

test('checkPlan finds mistakes', () => {
  const lines: PlanLine[] = [
    { name: 'A', blurb: '', color: '#000', tier: 0, lessons: [{ id: 'a1', title: '', summary: '', prereqs: ['a2'] }, { id: 'a2', title: '', summary: '' }] },
    { name: 'B', blurb: '', color: '#000', tier: 0, lessons: [{ id: 'b1', title: '', summary: '', prereqs: ['a2', 'nope'] }, { id: 'Bad id', title: '', summary: '' }] },
  ]
  const all = checkPlan(lines).join('\n')
  expect(all).toMatch(/"a1": prerequisite "a2" must be listed before it/)
  expect(all).toMatch(/"b1": prerequisite "a2" is on "A", which must be in a higher tier/)
  expect(all).toMatch(/"nope" is not a planned lesson/)
  expect(all).toMatch(/"Bad id": use lower-case words/)
})

test('addresses belong to the right subject', () => {
  expect(subjectOfPath('/').id).toBe('data')
  expect(subjectOfPath('/lesson/cdc').id).toBe('data')
  expect(subjectOfPath('/software').id).toBe('software')
  expect(subjectOfPath('/ai').id).toBe('ai')
  expect(subjectOfPath('/aim').id).toBe('data')
})
