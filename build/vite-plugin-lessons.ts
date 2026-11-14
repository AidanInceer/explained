/**
 * Reads the lesson files in src/content at build time.
 *
 * - `virtual:lessons` is the list of lessons, from the YAML block of each file. The map and the lists use it, so it
 *   is small and in the first download.
 * - `src/content/<id>.md?lesson` is one lesson's text, already turned into HTML parts. Each lesson is its own small
 *   file that the browser loads when the lesson opens.
 *
 * Every start and build checks all lesson files. A problem stops the build and shows on the page in development.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { normalizePath, type Plugin, type ViteDevServer } from 'vite'
import { parseLessonBody, splitLessonFile } from '../src/lessons/format.ts'
import { checkGlossary, checkLessons } from '../src/lessons/validate.ts'

const VIRTUAL = 'virtual:lessons'
const RESOLVED = '\0' + VIRTUAL
const QUERY = '?lesson'

export function readLessonFiles(dir: string) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const id = basename(f, '.md')
      const path = join(dir, f)
      try {
        return { id, path, file: splitLessonFile(readFileSync(path, 'utf8')) }
      } catch (e) {
        throw new Error(`src/content/${f}: ${(e as Error).message}`)
      }
    })
}

export default function lessons(): Plugin {
  let dir = ''
  let server: ViteDevServer | undefined

  const reload = (file: string) => {
    if (!server || !normalizePath(file).startsWith(dir) || !file.endsWith('.md')) return
    const mod = server.moduleGraph.getModuleById(RESOLVED)
    if (mod) server.moduleGraph.invalidateModule(mod)
    server.ws.send({ type: 'full-reload' })
  }

  return {
    name: 'dee-lessons',
    configResolved(config) {
      dir = normalizePath(resolve(config.root, 'src/content'))
    },
    configureServer(s) {
      server = s
      s.watcher.on('add', reload)
      s.watcher.on('unlink', reload)
      s.watcher.on('change', reload)
    },
    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED
    },
    load(id) {
      if (id === RESOLVED) {
        const files = readLessonFiles(dir)
        files.forEach((f) => this.addWatchFile(f.path))
        const { lessons, errors } = checkLessons(files)
        errors.push(...checkGlossary(new Set(files.map((f) => f.id))))
        if (errors.length) throw new Error(`Lesson files have ${errors.length} problem(s):\n  ${errors.join('\n  ')}`)
        return `export default ${JSON.stringify(lessons)}`
      }
      if (id.endsWith(QUERY)) {
        const path = id.slice(0, -QUERY.length)
        const { body } = splitLessonFile(readFileSync(path, 'utf8'))
        return `export default ${JSON.stringify(parseLessonBody(body))}`
      }
    },
  }
}
