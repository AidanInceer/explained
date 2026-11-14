import type { SystemPlan } from './types'

/* One invented online shop. Positions are in drawing units on a 1200 x 690 board, in the same columns as the
   data engineering drawing. Each part names the planned lessons that teach it. */
export const SOFTWARE_SYSTEM: SystemPlan = {
  title: 'What all of it builds',
  lead: 'One invented online shop, drawn whole. People use it on the left. Each request goes through the back end to the data on the right. Under it: how a change is tested and shipped, and who does the work.',
  W: 1200,
  H: 690,
  labels: [
    { x: 16, y: 44, text: 'who uses it' },
    { x: 212, y: 44, text: 'the edge' },
    { x: 584, y: 44, text: 'background jobs' },
    { x: 1030, y: 44, text: 'outside services' },
    { x: 846, y: 162, text: 'stored data' },
    { x: 16, y: 614, text: 'the people' },
  ],
  parts: [
    // who uses it
    { id: 'web', x: 16, y: 56, w: 150, h: 92, label: 'Web page', kind: 'screen', screen: 'browser', lessons: ['open-a-page', 'http', 'html-css', 'js-browser', 'frameworks', 'rendering', 'accessibility', 'web-performance'] },
    { id: 'phone', x: 16, y: 166, w: 150, h: 112, label: 'Phone app', sub: 'iOS + Android', kind: 'screen', screen: 'phone', lessons: ['app-choice', 'ui-state', 'offline-sync', 'background-work', 'app-performance', 'app-release'] },
    { id: 'desk', x: 16, y: 296, w: 150, label: 'Desktop app', sub: 'for staff', glyph: 'app', lessons: ['desktop-apps', 'offline-sync'] },
    // the edge
    { id: 'cdn', x: 212, y: 56, w: 130, label: 'CDN', sub: 'cached files', glyph: 'file', lessons: ['web-performance', 'caching'] },
    { id: 'lb', x: 212, y: 178, w: 130, h: 58, label: 'Load balancer', sub: 'HTTPS in', glyph: 'net', count: { start: 48210, unit: 'requests', per: [3, 12] }, lessons: ['networks', 'http', 'scaling', 'crypto-basics'] },
    // back end
    { id: 'be', x: 388, y: 150, w: 412, h: 216, label: 'Back end', kind: 'zone', lessons: ['apis', 'architecture-styles', 'modules-interfaces', 'domain-modelling', 'failure', 'coupling'] },
    { id: 'gw', x: 404, y: 184, w: 124, h: 150, label: 'API gateway', sub: 'auth, rate limits', glyph: 'lock', lessons: ['apis', 'auth', 'web-attacks'] },
    { id: 'orders', x: 568, y: 178, w: 216, h: 46, label: 'Orders', sub: 'stock, prices, status', glyph: 'server', count: { start: 1832, unit: 'orders', per: [1, 2] }, lessons: ['domain-modelling', 'transactions', 'errors', 'state'] },
    { id: 'accounts', x: 568, y: 236, w: 216, h: 46, label: 'Accounts', sub: 'sign-in, sessions', glyph: 'person', lessons: ['auth', 'crypto-basics'] },
    { id: 'pay', x: 568, y: 294, w: 216, h: 46, label: 'Payments', sub: 'charges, refunds', glyph: 'api', lessons: ['failure', 'apis', 'errors'] },
    // background jobs
    { id: 'queue', x: 584, y: 56, w: 124, label: 'Queue', sub: 'job messages', glyph: 'log', count: { start: 214, unit: 'jobs', per: [1, 1] }, lessons: ['queues'] },
    { id: 'worker', x: 760, y: 56, w: 124, label: 'Worker', sub: 'background tasks', glyph: 'cpu', lessons: ['queues', 'concurrency'] },
    // stored data
    { id: 'db', x: 846, y: 172, w: 130, h: 58, label: 'Database', sub: 'Postgres, ACID', glyph: 'db', count: { start: 392140, unit: 'rows', per: [2, 9] }, lessons: ['app-databases', 'transactions', 'trees-graphs', 'big-o'] },
    { id: 'cache', x: 846, y: 248, w: 130, h: 46, label: 'Cache', sub: 'Redis', glyph: 'bolt', lessons: ['caching', 'hash-maps'] },
    // outside services
    { id: 'email', x: 1030, y: 56, w: 156, label: 'Email', sub: 'receipts, resets', glyph: 'mail', count: { start: 9120, unit: 'sent', per: [1, 1] }, lessons: ['queues'] },
    { id: 'push', x: 1030, y: 122, w: 156, h: 46, label: 'Push messages', glyph: 'phone', lessons: ['background-work'] },
    { id: 'psp', x: 1030, y: 290, w: 156, label: 'Payment provider', sub: 'API + webhooks', glyph: 'api', lessons: ['apis', 'secrets', 'failure'] },
    // under it all
    { id: 'git', x: 16, y: 392, w: 170, h: 92, label: 'Git repository', sub: 'branches, reviews', glyph: 'git', lessons: ['git', 'branches-merges', 'code-review', 'reading-code'] },
    { id: 'config', x: 212, y: 392, w: 130, h: 92, label: 'Config + flags', sub: 'per environment', glyph: 'file', lessons: ['environments-config', 'feature-flags', 'secrets'] },
    { id: 'obs', x: 388, y: 392, w: 412, h: 92, label: 'Observability', kind: 'zone', chips: { names: ['logs', 'metrics', 'traces', 'alerts', 'on call'], y: 432, gate: 3 }, lessons: ['observability', 'on-call', 'postmortems'] },
    { id: 'tests', x: 846, y: 392, w: 130, h: 92, label: 'Tests', kind: 'zone', checks: [['412 unit', true], ['38 integration', true], ['9 end-to-end', true], ['1 flaky', false]], lessons: ['why-test', 'unit-tests', 'integration-tests', 'test-doubles', 'tdd'] },
    { id: 'sec', x: 1004, y: 392, w: 182, h: 92, label: 'Security', kind: 'zone', notes: ['HTTPS everywhere', 'passwords hashed', 'secrets in a vault', 'least access'], lessons: ['threat-model', 'web-attacks', 'secrets', 'crypto-basics', 'least-privilege', 'supply-chain'] },
    {
      id: 'ci', x: 16, y: 506, w: 1170, h: 84, label: 'CI/CD pipeline', kind: 'zone',
      chips: { names: ['pull request', 'lint + types', 'tests', 'build container', 'deploy to staging', 'canary: 5%', 'live'], y: 538, cycle: true },
      lessons: ['ci', 'cd', 'code-quality', 'containers', 'infrastructure-as-code', 'container-orchestration', 'feature-flags'],
    },
    // the people
    { id: 't1', x: 16, y: 626, w: 170, h: 50, label: 'Designers', sub: 'screens and flows', kind: 'who', lessons: ['accessibility', 'ui-state'] },
    { id: 't2', x: 208, y: 626, w: 226, h: 50, label: 'Web + app developers', sub: 'pages, apps, state', kind: 'who', lessons: ['frameworks', 'app-choice', 'js-browser'] },
    { id: 't3', x: 456, y: 626, w: 226, h: 50, label: 'Back-end developers', sub: 'APIs, data, jobs', kind: 'who', lessons: ['apis', 'app-databases', 'queues'] },
    { id: 't4', x: 704, y: 626, w: 210, h: 50, label: 'Platform + SRE', sub: 'deploys, on call', kind: 'who', lessons: ['cloud', 'on-call', 'cloud-cost'] },
    { id: 't5', x: 936, y: 626, w: 250, h: 50, label: 'Product + support', sub: 'what to build next', kind: 'who', lessons: ['planning', 'ways-of-working', 'writing'] },
  ],
  flows: [
    { from: 'web', to: 'cdn', dot: 1.7 },
    { from: 'web', to: 'lb', dot: 1.3 },
    { from: 'phone', to: 'lb', dot: 1.4 },
    { from: 'desk', to: 'lb', dot: 2.6 },
    { from: 'lb', to: 'gw', dot: 1.2 },
    { from: 'gw', to: 'orders', dot: 1.5 },
    { from: 'gw', to: 'accounts', dot: 1.8 },
    { from: 'gw', to: 'pay', dot: 2.4 },
    { from: 'orders', to: 'db', dot: 1.6 },
    { from: 'accounts', to: 'cache', dot: 1.4 },
    { from: 'orders', to: 'queue', dot: 2.8 },
    { from: 'queue', to: 'worker', dot: 2.8 },
    { from: 'worker', to: 'email', dot: 3 },
    { from: 'worker', to: 'push', dot: 3.4 },
    { from: 'pay', to: 'psp', dot: 2.6 },
    { from: 'git', to: 'ci', control: true },
    { from: 'config', to: 'be', control: true },
    { from: 'be', to: 'obs', control: true },
  ],
}
