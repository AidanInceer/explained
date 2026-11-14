import type { ComponentType } from 'react'
import { SwBigO, SwBits, SwFib, SwGraph, SwHash, SwSearch, SwSort } from './algorithms'
import { SwEncode } from './encode'
import { SwBackoff, SwCache, SwEventLoop, SwGit, SwHashFn, SwLoad, SwPageLoad, SwRace } from './systems'

/**
 * Figures for software engineering lessons. Use a name that starts with "sw-", so it cannot clash with another
 * subject. Put each figure component in a file in this folder, and add it here.
 */
export const SOFTWARE_FIGURES: Record<string, ComponentType> = {
  'sw-bits': SwBits,
  'sw-big-o': SwBigO,
  'sw-search': SwSearch,
  'sw-sort': SwSort,
  'sw-hash': SwHash,
  'sw-fib': SwFib,
  'sw-graph': SwGraph,
  'sw-race': SwRace,
  'sw-event-loop': SwEventLoop,
  'sw-page-load': SwPageLoad,
  'sw-cache': SwCache,
  'sw-backoff': SwBackoff,
  'sw-load': SwLoad,
  'sw-git': SwGit,
  'sw-hash-fn': SwHashFn,
  'sw-encode': SwEncode,
}
