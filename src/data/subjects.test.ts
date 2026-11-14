import { expect, test } from 'vitest'
import { SUBJECTS, subjectOfPath } from './subjects'

test('each planned subject has lines of lessons, with no title used twice', () => {
  for (const s of SUBJECTS.filter((s) => s.status === 'planned')) {
    expect(s.lines.length, s.id).toBeGreaterThan(0)
    const titles = s.lines.flatMap((l) => l.lessons.map((x) => x.title))
    expect(titles.filter((t, i) => titles.indexOf(t) !== i), s.id).toEqual([])
    for (const l of s.lines) expect(l.lessons.length, `${s.id} / ${l.name}`).toBeGreaterThan(0)
  }
})

test('addresses belong to the right subject', () => {
  expect(subjectOfPath('/').id).toBe('data')
  expect(subjectOfPath('/lesson/cdc').id).toBe('data')
  expect(subjectOfPath('/software').id).toBe('software')
  expect(subjectOfPath('/ai').id).toBe('ai')
  expect(subjectOfPath('/aim').id).toBe('data')
})
