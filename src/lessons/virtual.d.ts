declare module 'virtual:lessons' {
  import type { Lesson } from './types'
  /** Every lesson, read from the YAML block of each file in src/content. Made by build/vite-plugin-lessons.ts. */
  const lessons: Lesson[]
  export default lessons
}
