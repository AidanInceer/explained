import { createStore, readJSON, writeJSON } from './storage'

/**
 * Light or dark colours. With no choice saved, the site follows the system setting.
 * index.html reads the same key before the first paint, so the page does not flash light first.
 */
export type Theme = 'light' | 'dark'
const KEY = 'dee.theme.v1'
const system = (): Theme => (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const store = createStore<Theme | null>(readJSON<Theme | null>(KEY, null), (v) => writeJSON(KEY, v))

function apply(t: Theme) {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0f171c' : '#132029')
}

if (typeof document !== 'undefined') {
  apply(store.get() ?? system())
  // Follow the system while the reader has not chosen.
  matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => store.get() === null && apply(system()))
}

export function useTheme(): [Theme, () => void] {
  const t = store.use() ?? system()
  return [
    t,
    () => {
      const next: Theme = t === 'dark' ? 'light' : 'dark'
      store.set(next)
      apply(next)
    },
  ]
}
