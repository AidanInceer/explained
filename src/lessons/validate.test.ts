import { describe, expect, test } from 'vitest'
import { splitLessonFile } from './format.ts'
import { checkLessons } from './validate.ts'

const NL = String.fromCharCode(10)
const file = (meta: string, body = 'Text') => splitLessonFile(`---\n${meta}\n---\n${body}`)
const good = 'title: T\nsummary: S\ntrack: foundations\nlevel: core\nminutes: 5\nat: [0, 0]\nprereqs: []\ntech: []\nrefs:\n  - fode: Ch. 1'

describe('checkLessons', () => {
  test('a correct lesson has no errors', () => {
    const r = checkLessons([{ id: 'a', file: file(good) }])
    expect(r.errors).toEqual([])
    expect(r.lessons[0]).toMatchObject({ id: 'a', subject: 'data', at: [0, 0], refs: [['fode', 'Ch. 1']] })
  })

  test('a lesson of a planned subject takes its title and line from the plan', () => {
    const r = checkLessons([{ id: 'vectors', subject: 'ai', file: file(['minutes: 6', 'tech: []', 'refs:', '  - mml: Ch. 2'].join(NL)) }])
    expect(r.errors).toEqual([])
    expect(r.lessons[0]).toMatchObject({ id: 'vectors', subject: 'ai', title: 'Vectors', track: 'ai-linear-algebra', prereqs: [] })
  })

  test('a lesson of a planned subject must be in the plan, with only its own keys', () => {
    const all = checkLessons([
      { id: 'not-planned', subject: 'ai', file: file(['minutes: 6', 'refs: []'].join(NL)) },
      { id: 'vectors', subject: 'software', file: file(['minutes: 6', 'title: X', 'refs: []'].join(NL)) },
    ]).errors.join(NL)
    expect(all).toContain('src/content/ai/not-planned.md: "not-planned" is not a lesson in src/data/plans/ai.ts')
    expect(all).toContain('src/content/software/vectors.md: Unknown key "title"')
  })

  test('lesson ids are unique across subjects', () => {
    const { errors } = checkLessons([
      { id: 'vectors', file: file(good) },
      { id: 'vectors', subject: 'ai', file: file(['minutes: 6', 'refs: []'].join(NL)) },
    ])
    expect(errors.some((e) => e.includes('Lesson ids must be unique across all subjects'))).toBe(true)
  })

  test('finds wrong values', () => {
    const meta = good.replace('track: foundations', 'track: nowhere').replace('fode', 'nobook').replace('tech: []', 'tech: [nothing]') + '\ncolour: red'
    const all = checkLessons([{ id: 'a', file: file(meta) }]).errors.join('\n')
    expect(all).toMatch(/"track" must be one of/)
    expect(all).toMatch(/"nobook", which is not a key/)
    expect(all).toMatch(/"nothing", which is not a key/)
    expect(all).toMatch(/Unknown key "colour"/)
  })

  test('prerequisites must exist and be higher on the map', () => {
    const { errors } = checkLessons([
      { id: 'a', file: file(good.replace('at: [0, 0]', 'at: [1, 0]')) },
      { id: 'b', file: file(good.replace('prereqs: []', 'prereqs: [a, missing]')) },
    ])
    expect(errors).toContain('src/content/b.md: Prerequisite "missing" is not a lesson. Use the file name without ".md".')
    expect(errors).toContain('src/content/b.md: Prerequisite "a" must be higher on the map. Give this lesson a larger row in "at".')
  })

  test('two lessons cannot share a place', () => {
    const { errors } = checkLessons([
      { id: 'a', file: file(good) },
      { id: 'b', file: file(good) },
    ])
    expect(errors.some((e) => e.includes('is the same place as "a"'))).toBe(true)
  })

  test('finds quiz, scenario and link mistakes', () => {
    const body = 'See [x](/lesson/nope).\n\n::quiz\n? Q\n+ A\n+ B\n::end\n\n::scenario\n? S\n+ No reason\n'
    const all = checkLessons([{ id: 'a', file: file(good, body) }]).errors.join('\n')
    expect(all).toMatch(/Link to "\/lesson\/nope"/)
    expect(all).toMatch(/exactly one "\+" \(correct\) option. It has 2/)
    expect(all).toMatch(/needs a "!" line/)
    expect(all).toMatch(/needs a reason after "\|"/)
    expect(all).toMatch(/"::scenario" has no "::end" line/)
  })
})
