/**
 * Reader data kept in this browser (localStorage). No server sees it.
 * Every key starts with `dee.` and ends with a version. Change the version when the shape of the value changes.
 * If storage is not available (private mode, full disk), values last for the visit only.
 */
import { useState, useSyncExternalStore } from 'react'

export function readJSON<T>(key: string, empty: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : empty
  } catch {
    return empty
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the value lasts for this visit only */
  }
}

/** A value that React components can read with `use()`. `set()` saves it and redraws every reader. */
export function createStore<T>(initial: T, save: (value: T) => void) {
  let value = initial
  const listeners = new Set<() => void>()
  const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => void listeners.delete(cb)
  }
  return {
    get: () => value,
    set(next: T) {
      value = next
      save(next)
      listeners.forEach((l) => l())
    },
    /** React hook: the current value, kept up to date. */
    use: <R = T>(select?: (v: T) => R): R => useSyncExternalStore(subscribe, () => (select ? select(value) : value) as R),
  }
}

/** A choice between two values, saved as text under `key`, for example a reading preference. */
export function useStoredChoice(key: string, on: string, off: string): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) === on
    } catch {
      return false
    }
  })
  const choose = (v: boolean) => {
    setValue(v)
    try {
      localStorage.setItem(key, v ? on : off)
    } catch {
      /* not saved */
    }
  }
  return [value, choose]
}
