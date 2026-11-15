// @vitest-environment happy-dom
import { expect, test } from 'vitest'
import { linkLesson, termsFor } from './link'

test('marks the first mention of a technology group only', () => {
  const html = '<p>An orchestrator runs tasks. Another orchestrator.</p>'
  const out = linkLesson('idempotency', { parts: [[]], segs: [{ type: 'md', part: 0, html }] })
  const s = (out.segs[0] as { html: string }).html
  expect(s.match(/data-tech="orchestrators"/g)).toHaveLength(1)
})

test('terms taught on the path to a lesson are not defined again', () => {
  const rules = termsFor('idempotency').map((t) => t.base)
  expect(rules).not.toContain('OLTP') // taught in oltp-olap, which comes before
})
