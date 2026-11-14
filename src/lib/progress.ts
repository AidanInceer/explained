import { LESSONS, dependents, type Lesson } from '../data/curriculum'
import { createStore, readJSON, writeJSON } from './storage'

/** Lessons that the reader marked as understood. */
const KEY = 'dee.progress.v1'
const store = createStore(new Set(readJSON<string[]>(KEY, [])), (next) => writeJSON(KEY, [...next]))

export function setDone(id: string, value: boolean) {
  const next = new Set(store.get())
  if (value) next.add(id)
  else next.delete(id)
  store.set(next)
}

export function resetProgress() {
  store.set(new Set())
}

export const useProgress = (): Set<string> => store.use()

/** First lesson not yet done whose prerequisites are all done. */
export function nextUp(doneSet: Set<string>) {
  return (
    LESSONS.find((l) => !doneSet.has(l.id) && l.prereqs.every((p) => doneSet.has(p))) ??
    LESSONS.find((l) => !doneSet.has(l.id))
  )
}

/**
 * Where to go after a lesson: the next lesson on the same line, other lessons that it leads to,
 * and at the end of a line with no branches, up to three open lessons elsewhere. `next` is the first of these.
 */
export function onwardFrom(lesson: Lesson, doneSet: Set<string>) {
  const leads = dependents(lesson.id)
  const onward = leads.find((l) => l.track === lesson.track)
  const branches = leads.filter((l) => l.id !== onward?.id)
  const elsewhere =
    !onward && branches.length === 0
      ? LESSONS.filter((l) => !doneSet.has(l.id) && l.id !== lesson.id && l.prereqs.every((p) => doneSet.has(p) || p === lesson.id)).slice(0, 3)
      : []
  return { onward, branches, elsewhere, next: onward ?? branches[0] ?? elsewhere[0] }
}
