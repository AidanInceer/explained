/**
 * Loads a lesson's text when it opens. Each lesson is its own small file, already parsed at build time
 * (see build/vite-plugin-lessons.ts). The browser only marks terms, then keeps the result for the visit.
 */
import { useEffect, useState } from 'react'
import { linkLesson } from './link'
import type { LessonContent } from './types'

const files = import.meta.glob<LessonContent>('../content/*.md', { query: '?lesson', import: 'default' })
const fileOf = Object.fromEntries(Object.entries(files).map(([path, load]) => [path.slice(path.lastIndexOf('/') + 1, -3), load]))

const cache = new Map<string, LessonContent>()

/** Parsed lesson if it is loaded, null if the lesson has no text, undefined while it is not loaded yet. */
export function lessonContent(id: string): LessonContent | null | undefined {
  if (cache.has(id)) return cache.get(id)!
  return fileOf[id] ? undefined : null
}

export async function loadLessonContent(id: string): Promise<LessonContent | null> {
  if (cache.has(id)) return cache.get(id)!
  const load = fileOf[id]
  if (!load) return null
  const c = linkLesson(id, await load())
  cache.set(id, c)
  return c
}

export function useLessonContent(id: string | undefined): LessonContent | null | undefined {
  const [, bump] = useState(0)
  const c = id ? lessonContent(id) : null
  useEffect(() => {
    if (!id || c !== undefined) return
    let live = true
    loadLessonContent(id).then(() => live && bump((n) => n + 1))
    return () => {
      live = false
    }
  }, [id, c])
  return c
}
