import { useEffect, useRef } from 'react'
import { FIGURES } from '../../figures'
import Corners from '../Corners'

/** Parts of a figure that say what its current state is. When one changes because of the reader, it flashes once. */
const TELLS = '.stat, .kx-kpis > div, .sl b, .kx-nav > span'
/** A change this long after the reader's last input counts as an answer to it. Changes from a running timer do not flash. */
const ANSWER_MS = 500

/** Flash the parts of a figure that changed because of the reader. Same for every figure, so all figures answer alike. */
function useAnswerFlash() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root || typeof MutationObserver === 'undefined') return
    let last = 0
    const touched = () => (last = performance.now())
    const flash = (el: Element) => {
      el.classList.remove('answered')
      void (el as HTMLElement).offsetWidth // restart the animation
      el.classList.add('answered')
    }
    const mo = new MutationObserver((list) => {
      if (performance.now() - last > ANSWER_MS) return
      const seen = new Set<Element>()
      for (const m of list) {
        const node = m.target.nodeType === 1 ? (m.target as Element) : m.target.parentElement
        const el = node?.closest(TELLS)
        if (el && root.contains(el)) seen.add(el)
      }
      seen.forEach(flash)
    })
    mo.observe(root, { subtree: true, childList: true, characterData: true })
    root.addEventListener('pointerdown', touched)
    root.addEventListener('keydown', touched)
    root.addEventListener('input', touched)
    return () => {
      mo.disconnect()
      root.removeEventListener('pointerdown', touched)
      root.removeEventListener('keydown', touched)
      root.removeEventListener('input', touched)
    }
  }, [])
  return ref
}

/** A `::fig name | caption` line in a lesson. */
export default function LessonFigure({ name, caption }: { name: string; caption: string }) {
  const F = FIGURES[name]
  const body = useAnswerFlash()
  return (
    <figure className="fig">
      <div className="fig-frame">
        <Corners />
        <div className="fig-body" ref={body}>
          {F ? <F /> : <p>Figure “{name}” is missing.</p>}
        </div>
      </div>
      {caption && <figcaption dangerouslySetInnerHTML={{ __html: caption }} />}
    </figure>
  )
}
