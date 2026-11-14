import { createStore, readJSON as read, writeJSON as write } from './storage'

/** Saved quiz answers: lesson id, then quiz question number, then the option picked. Kept in this browser only. */
const KEY = 'dee.quiz.v1'
/** Saved quiz results per lesson, so the map and track lists can show them without loading the lesson text. */
const SCORE_KEY = 'dee.quizscore.v1'

type Store = Record<string, Record<string, number>>
export type QuizScore = { correct: number; total: number }
type Scores = Record<string, QuizScore>

export function savedPicks(lessonId: string): Record<string, number> {
  return read<Store>(KEY, {})[lessonId] ?? {}
}

export function savePick(lessonId: string, n: number, pick: number | null) {
  const all = read<Store>(KEY, {})
  const mine = { ...(all[lessonId] ?? {}) }
  if (pick === null) delete mine[n]
  else mine[n] = pick
  if (Object.keys(mine).length) all[lessonId] = mine
  else delete all[lessonId]
  write(KEY, all)
}

const scores = createStore(read<Scores>(SCORE_KEY, {}), (next) => write(SCORE_KEY, next))

/** Record the result once every question has an answer; remove it while some are open. */
export function saveScore(lessonId: string, score: QuizScore | null) {
  const old = scores.get()[lessonId]
  if (score && old && old.correct === score.correct && old.total === score.total) return
  if (!score && !old) return
  const next = { ...scores.get() }
  if (score) next[lessonId] = score
  else delete next[lessonId]
  scores.set(next)
}

export const useQuizScores = (): Scores => scores.use()

/** Short text for lists: "quiz 3 of 3". */
export function quizText(s: QuizScore | undefined): string {
  return s ? `quiz ${s.correct} of ${s.total}` : ''
}
