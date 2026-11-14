import { useSyncExternalStore } from 'react'
import { LESSONS } from '../curriculum'

const KEY = 'dee.progress.v1'
const listeners = new Set<() => void>()

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

let done = load()

function commit(next: Set<string>) {
  done = next
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]))
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
  listeners.forEach((l) => l())
}

export function setDone(id: string, value: boolean) {
  const next = new Set(done)
  if (value) next.add(id)
  else next.delete(id)
  commit(next)
}

export function resetProgress() {
  commit(new Set())
}

export function useProgress(): Set<string> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => done,
  )
}

/** First lesson not yet done whose prerequisites are all done. */
export function nextUp(doneSet: Set<string>) {
  return (
    LESSONS.find((l) => !doneSet.has(l.id) && l.prereqs.every((p) => doneSet.has(p))) ??
    LESSONS.find((l) => !doneSet.has(l.id))
  )
}
