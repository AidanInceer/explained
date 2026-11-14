/**
 * The planned software engineering map. Each lesson: id, title, one-line summary, prerequisites, and 'deeper' if a
 * reader can skip it. The map places lessons from their order and prerequisites (see src/map/plan-layout.ts).
 */
import type { PlanLesson, PlanLine } from '../../map/plan-layout'

const l = (id: string, title: string, summary: string, prereqs: string[] = [], level?: 'deeper'): PlanLesson => ({ id, title, summary, prereqs, level })

export const SOFTWARE_PLAN: PlanLine[] = [
  // ---------- Tier 0: how computers work ----------
  {
    name: 'Foundations',
    blurb: 'What is under every program: the machine, the operating system and the network.',
    color: 'var(--line-ink)',
    tier: 0,
    lessons: [
      l('how-computers-work', 'How computers work', 'CPU, memory, storage, and the connections between them.'),
      l('binary-data', 'Bits, bytes and encodings', 'Numbers, text and images, all stored as bits.'),
      l('operating-systems', 'Operating systems', 'Processes, files, and who gets the CPU next.', ['how-computers-work']),
      l('networks', 'Networks and the internet', 'Packets, addresses, and how they find their way.', ['how-computers-work']),
      l('programs-run', 'What happens when code runs', 'Compilers, interpreters and runtimes.', ['operating-systems']),
      l('shell', 'The command line', 'Programs that you run by name, joined by pipes.', ['operating-systems']),
      l('concurrency', 'Concurrency', 'Many things at once, and the bugs that come with it.', ['operating-systems']),
      l('memory', 'Stack, heap and garbage', 'Where values live, and who cleans up after them.', ['programs-run'], 'deeper'),
    ],
  },

  // ---------- Tier 1: programming, algorithms, tools ----------
  {
    name: 'Programming',
    blurb: 'The ideas that every language shares, in the order that you need them.',
    color: '#2456D6',
    tier: 1,
    lessons: [
      l('values-types', 'Values and types', 'Numbers, text and lists, and what you can do with each.', ['binary-data']),
      l('control-flow', 'Choices and loops', 'How a program decides, and how it repeats.', ['values-types']),
      l('functions', 'Functions', 'Name a piece of work, and use it again.', ['control-flow']),
      l('errors', 'Errors and exceptions', 'What a program does when something fails.', ['functions']),
      l('state', 'State and change', 'Values that change, and why that is hard to follow.', ['functions']),
      l('objects-modules', 'Objects and modules', 'Keep data together with the code that uses it.', ['state']),
      l('functional', 'Functional ideas', 'Pure functions, values that never change, map and filter.', ['state'], 'deeper'),
      l('type-systems', 'Static and dynamic types', 'Find mistakes before the program runs.', ['objects-modules'], 'deeper'),
    ],
  },
  {
    name: 'Data structures and algorithms',
    blurb: 'How to store things so that the work stays fast as the data grows.',
    color: '#7A3FD1',
    tier: 1,
    lessons: [
      l('arrays-lists', 'Arrays and lists', 'Values in a row, and the cost of each operation.', ['how-computers-work']),
      l('big-o', 'Cost of an algorithm', 'Big O in plain words: how work grows with the input.', ['arrays-lists']),
      l('hash-maps', 'Hash maps', 'Find anything by its key, fast.', ['arrays-lists']),
      l('searching-sorting', 'Searching and sorting', 'The classic algorithms, and why sorted data is easy to search.', ['big-o']),
      l('trees-graphs', 'Trees and graphs', 'Data with branches, and data with connections.', ['hash-maps']),
      l('recursion', 'Recursion', 'A function that solves a smaller copy of the same problem.', ['trees-graphs']),
      l('graph-algorithms', 'Graph algorithms', 'Shortest paths, and the order to run dependent tasks.', ['recursion'], 'deeper'),
      l('dynamic-programming', 'Dynamic programming', 'Solve each sub-problem once and remember the answer.', ['recursion'], 'deeper'),
    ],
  },
  {
    name: 'Tools of the trade',
    blurb: 'The tools that you use every day, and how to use them well.',
    color: '#0B8A78',
    tier: 1,
    lessons: [
      l('editors', 'Editors and IDEs', 'Where you write code, and what it can do for you.'),
      l('git', 'Version control with Git', 'Commits and history: a safety net for every change.', ['shell']),
      l('packages', 'Packages and dependencies', 'Code that other people wrote, and how to manage it.', ['editors']),
      l('branches-merges', 'Branches, merges and pull requests', 'Work in parallel, then bring the work together.', ['git']),
      l('debugging', 'Debugging as a method', 'Reproduce, isolate, find the cause, then fix.', ['editors']),
      l('build-tools', 'Build tools and scripts', 'Make the same steps run the same way every time.', ['packages']),
      l('reading-code', 'Reading code that you did not write', 'Find your way in a large, unfamiliar codebase.', ['debugging']),
    ],
  },

  // ---------- Tier 2: the web, back ends, apps ----------
  {
    name: 'The web',
    blurb: 'What a browser does with a page, from the address bar to pixels.',
    color: '#2456D6',
    tier: 2,
    lessons: [
      l('open-a-page', 'What happens when you open a page', 'DNS, TCP, TLS, the request and the response.', ['networks']),
      l('http', 'HTTP', 'Methods, status codes, headers and caching.', ['open-a-page']),
      l('html-css', 'HTML, CSS and the DOM', 'Structure, style, and the tree that scripts change.', ['open-a-page']),
      l('js-browser', 'JavaScript in the browser', 'The event loop, and why one slow task freezes the page.', ['html-css', 'functions']),
      l('accessibility', 'Accessibility', 'Keyboard, screen readers and contrast, built in from the start.', ['html-css']),
      l('browser-security', 'Cookies, CORS and the same-origin rule', 'What a page may read, and from where.', ['http'], 'deeper'),
      l('frameworks', 'Front-end frameworks and state', 'Components, state, and a screen that follows the data.', ['js-browser']),
      l('rendering', 'Server, client or static rendering', 'Where the HTML is made, and what each choice costs.', ['frameworks', 'http']),
      l('web-performance', 'Web performance', 'What makes a page slow to show and slow to respond.', ['rendering'], 'deeper'),
    ],
  },
  {
    name: 'Back end',
    blurb: 'The services behind the screen: data, identity and scale.',
    color: '#D8472B',
    tier: 2,
    lessons: [
      l('apis', 'APIs: REST, GraphQL and RPC', 'Three ways to ask a service for something.', ['networks', 'functions']),
      l('serialisation', 'Data formats and serialisation', 'JSON, binary formats, and changing a format without breaking readers.', ['apis']),
      l('auth', 'Authentication and authorisation', 'Who you are, what you may do, sessions and tokens.', ['apis']),
      l('app-databases', 'Databases for applications', 'Tables, indexes, and migrations without downtime.', ['apis']),
      l('queues', 'Queues and background jobs', 'Do slow work later, and retry it safely.', ['apis']),
      l('caching', 'Caching', 'Where to keep a copy, and when the copy is wrong.', ['app-databases']),
      l('transactions', 'Transactions and isolation', 'Many users, one database, and no lost updates.', ['app-databases'], 'deeper'),
      l('scaling', 'Scaling a service', 'Stateless servers, load balancers and the database underneath.', ['caching', 'queues']),
      l('distributed', 'Distributed systems basics', 'Clocks, retries and parts that fail on their own.', ['scaling'], 'deeper'),
    ],
  },
  {
    name: 'Apps',
    blurb: 'Software on phones and desktops, and the problems that the web does not have.',
    color: '#B4530A',
    tier: 2,
    lessons: [
      l('app-choice', 'Native, cross-platform or web app', 'What each choice gives, and what it costs a small team.', ['programs-run']),
      l('ui-state', 'Screens, navigation and app state', 'How an app remembers where the user is.', ['app-choice', 'state']),
      l('desktop-apps', 'Desktop apps', 'Windows, menus, files, and installers.', ['app-choice'], 'deeper'),
      l('offline-sync', 'Offline first and sync', 'Local data, conflicts, and no network.', ['ui-state']),
      l('background-work', 'Background work and notifications', 'What the system lets an app do when it is closed.', ['ui-state'], 'deeper'),
      l('app-performance', 'Battery, memory and smooth screens', 'Why an app feels slow, and how to measure it.', ['ui-state'], 'deeper'),
      l('app-release', 'Releasing to the app stores', 'Builds, signing, review and staged rollouts.', ['offline-sync']),
    ],
  },

  // ---------- Tier 3: quality, design, security ----------
  {
    name: 'Testing and quality',
    blurb: 'How to know that the code works, today and after the next change.',
    color: '#0B8A78',
    tier: 3,
    lessons: [
      l('why-test', 'Why test', 'Tests are how you change code without fear.', ['functions']),
      l('unit-tests', 'Unit tests', 'Small, fast checks of one piece at a time.', ['why-test']),
      l('code-quality', 'Linters, formatters and types', 'Let tools find the simple mistakes.', ['why-test']),
      l('integration-tests', 'Integration and end-to-end tests', 'Check that the pieces work together.', ['unit-tests']),
      l('test-doubles', 'Mocks, fakes and stubs', 'Replace slow or risky parts in a test, and the cost of it.', ['unit-tests'], 'deeper'),
      l('tdd', 'Test-driven development', 'Write the test first, then the code that passes it.', ['unit-tests'], 'deeper'),
      l('code-review', 'Code review', 'What to look for, and how to say it.', ['code-quality']),
    ],
  },
  {
    name: 'Design and architecture',
    blurb: 'How to split a system into parts that can change on their own.',
    color: '#7A3FD1',
    tier: 3,
    lessons: [
      l('modules-interfaces', 'Modules and interfaces', 'Deep modules: a small interface over a lot of behaviour.', ['objects-modules']),
      l('coupling', 'Coupling and cohesion', 'Why a change in one place should not break another.', ['modules-interfaces']),
      l('failure', 'Designing for failure', 'Fail early, fail loudly, and let the caller decide.', ['modules-interfaces', 'errors']),
      l('domain-modelling', 'Modelling the domain', 'Code that uses the words of the business.', ['modules-interfaces'], 'deeper'),
      l('patterns', 'Patterns worth knowing', 'A few shapes that solve common problems.', ['coupling']),
      l('refactoring', 'Refactoring safely', 'Change the shape of code without changing what it does.', ['coupling']),
      l('architecture-styles', 'Monolith or services', 'Where to draw service lines, and the cost of each line.', ['patterns', 'scaling']),
      l('decision-records', 'Docs and decision records', 'Write down why, so the next person does not guess.', ['architecture-styles']),
    ],
  },
  {
    name: 'Security',
    blurb: 'How software is attacked, and the habits that stop most attacks.',
    color: '#D0356F',
    tier: 3,
    lessons: [
      l('threat-model', 'Thinking like an attacker', 'What is valuable, who wants it, and how they get in.', ['networks']),
      l('web-attacks', 'Common web attacks', 'Injection, XSS and CSRF, and the usual defences.', ['threat-model', 'http']),
      l('secrets', 'Secrets and keys', 'Keep passwords and keys out of code and logs.', ['threat-model']),
      l('crypto-basics', 'Hashing, encryption and signatures', 'Three tools, and which job each one does.', ['threat-model']),
      l('least-privilege', 'Least privilege', 'Give each part only the access that it needs.', ['secrets']),
      l('supply-chain', 'Dependencies that you did not write', 'When a package that you trust turns bad.', ['secrets', 'packages'], 'deeper'),
    ],
  },

  // ---------- Tier 4: delivery and operations ----------
  {
    name: 'Delivery and operations',
    blurb: 'From a commit on a laptop to software that people use, and keeping it running.',
    color: '#B97700',
    tier: 4,
    lessons: [
      l('ci', 'Continuous integration', 'Every change built and tested before it is merged.', ['branches-merges', 'unit-tests']),
      l('environments-config', 'Environments and configuration', 'Same code, different settings, no secrets in the repository.', ['secrets']),
      l('containers', 'Containers', 'Ship the program with everything that it needs to run.', ['operating-systems']),
      l('cloud', 'Cloud basics', 'Compute, storage and networks that you rent by the hour.', ['networks']),
      l('cd', 'Continuous delivery and deployment', 'Every merged change ready to release, or released.', ['ci']),
      l('infrastructure-as-code', 'Infrastructure as code', 'Servers and networks described in files and reviewed like code.', ['cloud']),
      l('container-orchestration', 'Running containers at scale', 'What an orchestrator does, and when you need one.', ['containers'], 'deeper'),
      l('observability', 'Logs, metrics and traces', 'How to see what a running system is doing.', ['cd']),
      l('feature-flags', 'Feature flags and safe rollouts', 'Release to a few users first, and turn it off fast.', ['cd'], 'deeper'),
      l('cloud-cost', 'Cloud cost', 'Why the bill grows, and how to keep it small.', ['cloud'], 'deeper'),
      l('on-call', 'On call and incidents', 'Fix it now, and tell people what is happening.', ['observability']),
      l('postmortems', 'Postmortems without blame', 'Learn from a failure so it does not happen again.', ['on-call'], 'deeper'),
    ],
  },

  // ---------- Tier 5: people and practice ----------
  {
    name: 'Working in a team',
    blurb: 'The parts of the job that are not code.',
    color: '#4D7C0F',
    tier: 5,
    lessons: [
      l('planning', 'Planning and estimates', 'Small steps, honest ranges, and when to say no.'),
      l('writing', 'Writing for engineers', 'Clear messages, issues and docs.'),
      l('ai-assistants', 'Working with AI assistants', 'Give good context, check the output, own the result.', ['code-review']),
      l('open-source', 'Contributing to open source', 'Find a project, make a first change, and get it merged.', ['branches-merges']),
      l('ways-of-working', 'Agile, Scrum and Kanban', 'What the rituals are for, and what to keep.', ['planning']),
      l('tech-debt', 'Technical debt', 'Shortcuts that you pay for later, and when they are worth it.', ['planning', 'refactoring']),
      l('growing', 'Growing as an engineer', 'From doing tasks to owning problems.', ['writing'], 'deeper'),
      l('interviews', 'Technical interviews', 'What interviewers look for, and how to practise.', ['writing'], 'deeper'),
    ],
  },
]
