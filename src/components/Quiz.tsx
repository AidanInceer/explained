import { useState } from 'react'
import type { QuizQuestion } from '../lib/content'

function Question({ item, n }: { item: QuizQuestion; n: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked !== null && item.options[picked].correct
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
              onClick={() => setPicked(i)}
            >
              <span dangerouslySetInnerHTML={{ __html: o.text }} />
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <p className={`quiz-why ${right ? 'right' : 'wrong'}`} role="status">
          <b>{right ? 'Correct.' : 'Not this one.'}</b> <span dangerouslySetInnerHTML={{ __html: item.why }} />
        </p>
      )}
    </fieldset>
  )
}

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  return (
    <section className="quiz" aria-label="Check your understanding">
      <h2>Check your understanding</h2>
      {questions.map((q, i) => (
        <Question key={i} item={q} n={i + 1} />
      ))}
    </section>
  )
}
