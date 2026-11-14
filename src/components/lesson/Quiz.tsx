import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { QuizQuestion } from '../../lessons/types'
import { savedPicks, savePick, saveScore } from '../../lib/quizStore'

function Question({
  item,
  n,
  initial,
  onResult,
}: {
  item: QuizQuestion
  n: number
  initial: number | null
  onResult: (n: number, v: boolean | null, pick: number | null) => void
}) {
  const [picked, setPicked] = useState<number | null>(initial)
  const right = picked !== null && item.options[picked].correct
  const pick = (i: number | null) => {
    setPicked(i)
    onResult(n, i === null ? null : item.options[i].correct, i)
  }
  return (
    <fieldset className="quiz-q">
      <legend>
        <span className="quiz-n">{n}.</span> <span dangerouslySetInnerHTML={{ __html: item.q }} />
      </legend>
      <div className="quiz-opts">
        {item.options.map((o, i) => {
          const state = picked === null ? '' : o.correct ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              type="button"
              className={`quiz-opt ${state}`}
              aria-pressed={picked === i}
              onClick={() => pick(i)}
            >
              <span dangerouslySetInnerHTML={{ __html: o.text }} />
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <p className={`quiz-why ${right ? 'right' : 'wrong'}`} role="status">
          <b>{right ? 'Correct.' : 'Not this one.'}</b> <span dangerouslySetInnerHTML={{ __html: item.why }} />
          {!right && (
            <>
              {' '}
              <button type="button" className="link-btn" onClick={() => pick(null)}>
                Try again
              </button>
            </>
          )}
        </p>
      )}
    </fieldset>
  )
}

export default function Quiz({
  questions,
  lessonId,
  next,
  understood,
  onUnderstood,
}: {
  questions: QuizQuestion[]
  lessonId: string
  next?: { id: string; title: string }
  understood?: boolean
  onUnderstood?: (v: boolean) => void
}) {
  // Answers are kept in this browser, so a returning reader sees the last result.
  const [saved] = useState(() => savedPicks(lessonId))
  const valid = (n: number) => (saved[n] !== undefined && questions[n - 1]?.options[saved[n]] ? saved[n] : null)
  const [results, setResults] = useState<Record<number, boolean | null>>(() => {
    const r: Record<number, boolean | null> = {}
    questions.forEach((q, i) => {
      const p = valid(i + 1)
      if (p !== null) r[i + 1] = q.options[p].correct
    })
    return r
  })
  const [fromSaved] = useState(() => Object.keys(results).length > 0)
  const onResult = (n: number, v: boolean | null, pick: number | null) => {
    setResults((r) => ({ ...r, [n]: v }))
    savePick(lessonId, n, pick)
  }
  const answered = Object.values(results).filter((v) => v !== null).length
  const correct = Object.values(results).filter((v) => v === true).length
  useEffect(() => {
    saveScore(lessonId, answered === questions.length ? { correct, total: questions.length } : null)
  }, [lessonId, answered, correct, questions.length])
  return (
    <section className="quiz" aria-label="Check your understanding">
      <h2>Check your understanding</h2>
      <p className="quiz-score" role="status">
        <span>
          <b>{correct}</b> of {questions.length} correct
        </span>
        {answered === questions.length && correct === questions.length && <span>All correct.</span>}
        {answered === questions.length && correct < questions.length && <span>Use “Try again” on the wrong ones.</span>}
        {answered < questions.length && <span>{answered} answered</span>}
        {fromSaved && answered > 0 && <span>Your answers are saved in this browser.</span>}
      </p>
      {questions.map((q, i) => (
        <Question key={i} item={q} n={i + 1} initial={valid(i + 1)} onResult={onResult} />
      ))}
      {answered === questions.length && correct === questions.length && (
        <div className="quiz-done" role="status">
          <p>
            <b>Quiz done.</b> {questions.length === 1 ? 'The answer is correct.' : `All ${questions.length} answers are correct.`}
          </p>
          <div>
            {onUnderstood && !understood && (
              <button type="button" className="btn primary" onClick={() => onUnderstood(true)}>
                Mark as understood
              </button>
            )}
            {onUnderstood && understood && (
              <span className="quiz-done-ok">
                Marked as understood ✓{' '}
                <button type="button" className="link-btn" onClick={() => onUnderstood(false)}>
                  Undo
                </button>
              </span>
            )}
            {next && (
              <Link to={`/lesson/${next.id}`} className="btn">
                Next: {next.title}
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
