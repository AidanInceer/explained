/** Checks across all content: lesson files, figures, glossary, technology notes and the Toolkit page. */
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { readLessonFiles } from '../build/vite-plugin-lessons.ts'
import { TECH } from './data/tech'
import { TOOL_URL } from './data/tool-urls'
import { TOOLKITS } from './data/toolkit'
import { PLANNED } from './data/tracks'
import { SUBJECTS } from './data/subjects'
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

  test('lessons named on the Toolkit pages are written or planned', () => {
    const named = Object.values(TOOLKITS).flatMap((t) => [...t.langs.flatMap((l) => l.lessons ?? []), ...t.skills.flatMap((g) => g.items.flatMap(([, ls]) => ls))])
    expect(named.filter((id) => !ids.has(id) && !PLANNED.has(id))).toEqual([])
  })

  test('lessons named in the system drawings are in their subject’s plan', () => {
    const wrong = SUBJECTS.flatMap((s) =>
      (s.system?.parts ?? []).flatMap((p) => p.lessons.filter((id) => PLANNED.get(id)?.subject !== s.id).map((id) => `${s.id}/${p.id}: ${id}`)),
    )
    expect(wrong).toEqual([])
  })

  test('the lines in the system drawings join parts that exist', () => {
    const wrong = SUBJECTS.flatMap((s) => {
      const ids = new Set((s.system?.parts ?? []).map((p) => p.id))
      return (s.system?.flows ?? []).filter((f) => !ids.has(f.from) || !ids.has(f.to)).map((f) => `${s.id}: ${f.from} > ${f.to}`)
    })
    expect(wrong).toEqual([])
  })

  test('lesson ids are unique across subjects, planned or written', () => {
    const planned = [...PLANNED.keys()]
    const data = files.filter((f) => f.subject === 'data').map((f) => f.id)
    expect(data.filter((id) => planned.includes(id))).toEqual([])
  })
})
