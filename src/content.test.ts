/** Checks across all content: lesson files, figures, glossary, technology notes and the Toolkit page. */
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { readLessonFiles } from '../build/vite-plugin-lessons.ts'
import { TECH } from './data/tech'
import { TOOL_URL } from './data/tool-urls'
import { LANGS, SKILLS } from './data/toolkit'
import { FIGURES } from './figures'
import { parseLessonBody } from './lessons/format'
import { checkGlossary, checkLessons } from './lessons/validate'

const files = readLessonFiles(resolve(__dirname, 'content'))
const ids = new Set(files.map((f) => f.id))

describe('content', () => {
  test('every lesson file is correct', () => {
    expect(checkLessons(files).errors).toEqual([])
  })

  test('every glossary term points to a lesson', () => {
    expect(checkGlossary(ids)).toEqual([])
  })

  test('every ::fig name is in src/figures/index.tsx', () => {
    const missing = files.flatMap((f) =>
      parseLessonBody(f.file.body).segs.flatMap((s) => (s.type === 'fig' && !FIGURES[s.name] ? [`${f.id}: ${s.name}`] : [])),
    )
    expect(missing).toEqual([])
  })

  test('every link in tool-urls.ts belongs to a tool in tech.ts', () => {
    const tools = new Set(Object.values(TECH).flatMap((t) => t.tools.map((x) => x.name)))
    expect(Object.keys(TOOL_URL).filter((n) => !tools.has(n))).toEqual([])
  })

  test('lessons named on the Toolkit page exist', () => {
    const named = [...LANGS.flatMap((l) => l.lessons ?? []), ...SKILLS.flatMap((g) => g.items.flatMap(([, ls]) => ls))]
    expect(named.filter((id) => !ids.has(id))).toEqual([])
  })
})
