import { describe, expect, test } from 'vitest'
import { groupSteps, parseLessonBody, splitLessonFile } from './format.ts'

describe('splitLessonFile', () => {
  test('reads the YAML block and returns the rest as the body', () => {
    const f = splitLessonFile('---\r\ntitle: A\r\nat: [1, 2]\r\n---\r\nText\r\n')
    expect(f.meta).toEqual({ title: 'A', at: [1, 2] })
    expect(f.body).toBe('Text\n')
  })
  test('a file with no YAML block is all body', () => {
    expect(splitLessonFile('Just text').meta).toEqual({})
  })
})

describe('groupSteps', () => {
  test('a step closes once it has enough words', () => {
    expect(groupSteps([100, 250, 100, 200, 200])).toEqual([0, 0, 1, 1, 1])
  })
  test('a short last step joins the one before', () => {
    expect(groupSteps([350, 100])).toEqual([0, 0])
  })
})

describe('parseLessonBody', () => {
  test('second-level headings start sections, and short sections share a step', () => {
    const c = parseLessonBody('Intro\n\n## First\n\nA\n\n## Second\n\nB\n')
    expect(c.parts).toEqual([['First', 'Second']])
    expect(c.segs.map((s) => [s.type, s.part])).toEqual([
      ['md', 0],
      ['md', 0],
      ['md', 0],
    ])
    expect((c.segs[1] as { html: string }).html).toMatch(/^<h2 data-sec="1">First/)
  })

  test('a long lesson opens in steps', () => {
    const words = Array(200).fill('word').join(' ')
    const c = parseLessonBody(`Intro

## A

${words}

## B

${words}

## C

${words}

## D

${words}
`)
    expect(c.parts).toEqual([['A', 'B'], ['C', 'D']])
  })

  test('long sections are split at their third-level headings', () => {
    const words = Array(300).fill('word').join(' ')
    const c = parseLessonBody(`## Long

### One

${words}

### Two

More
`)
    expect(c.parts.flat()).toEqual(['Long', 'One', 'Two'])
  })

  test('headings inside code blocks do not start sections', () => {
    const c = parseLessonBody('```\n## not a heading\n```\n')
    expect(c.parts).toEqual([[]])
  })

  test('figures', () => {
    const c = parseLessonBody('::fig partitions | Caption with *stress* | and a bar')
    expect(c.segs[0]).toEqual({ type: 'fig', part: 0, name: 'partitions', caption: 'Caption with <em>stress</em> | and a bar' })
  })

  test('quizzes', () => {
    const c = parseLessonBody('::quiz\n? Question\n- Wrong\n+ Right\n! Because\n::end\n')
    expect(c.segs[0]).toEqual({
      type: 'quiz',
      part: 0,
      questions: [
        {
          q: 'Question',
          why: 'Because',
          options: [
            { text: 'Wrong', correct: false },
            { text: 'Right', correct: true },
          ],
        },
      ],
    })
  })

  test('scenarios', () => {
    const c = parseLessonBody('::scenario\n? Situation\n+ Best | Reason\n~ Workable | Reason 2\n- Poor | Reason 3\n::end\n')
    expect(c.segs[0]).toMatchObject({
      type: 'scenario',
      items: [{ q: 'Situation', options: [{ verdict: 'best' }, { verdict: 'ok' }, { verdict: 'poor' }] }],
    })
  })
})
