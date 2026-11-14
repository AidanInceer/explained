/** The Toolkit page of software engineering. See toolkit.ts for the shape and the rules. */
import type { Toolkit } from './toolkit.ts'

export const SOFTWARE_TOOLKIT: Toolkit = {
  lead: 'The map explains ideas. This page lists what you need in your hands: the languages and tools that software engineers use, and the things that a useful colleague can do. Nobody knows all of it on the first day. One language, Git and SQL are enough to start.',
  langsTitle: 'Languages and tools',
  levelNotes: {
    Essential: 'You use these in almost every software job.',
    Important: 'Most jobs use most of these. Learn each one when a project needs it.',
    'For some roles': 'Depends on what you build. Know what they are for.',
  },
  langs: [
    {
      name: 'Python',
      level: 'Essential',
      use: 'Scripts, back ends, tests and tools. Easy to read, so a good first language.',
      first: ['Values, functions and modules', 'Lists, dictionaries and loops', 'Errors and exceptions', 'Virtual environments and packages', 'Tests with pytest'],
      links: [
        ['The Python tutorial', 'https://docs.python.org/3/tutorial/'],
        ['pytest documentation', 'https://docs.pytest.org'],
      ],
      lessons: ['values-types', 'functions', 'errors'],
    },
    {
      name: 'JavaScript and TypeScript',
      level: 'Essential',
      use: 'The language of the browser, and common on servers. TypeScript adds types that find mistakes before the code runs.',
      first: ['Values, functions and objects', 'The DOM and events', 'Promises and async/await', 'Modules and npm', 'Types and interfaces in TypeScript'],
      links: [
        ['MDN JavaScript guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'],
        ['The TypeScript handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'],
      ],
      lessons: ['js-browser', 'type-systems'],
    },
    {
      name: 'Git',
      level: 'Essential',
      use: 'Every change goes through it: branches, commits, pull requests, and going back to an earlier version.',
      first: ['Commit, branch, merge', 'Pull requests and review', 'How to undo: revert and reset', 'Resolve a merge conflict'],
      links: [
        ['Pro Git, the free book', 'https://git-scm.com/book/en/v2'],
        ['Learn Git Branching, interactive', 'https://learngitbranching.js.org'],
      ],
      lessons: ['git', 'branches-merges'],
    },
    {
      name: 'SQL',
      level: 'Essential',
      use: 'Almost every application stores its data in a database that speaks SQL.',
      first: ['SELECT, WHERE and JOIN', 'INSERT, UPDATE and DELETE', 'Indexes, and why they make reads fast', 'Transactions'],
      links: [
        ['PostgreSQL tutorial', 'https://www.postgresql.org/docs/current/tutorial.html'],
        ['SQLBolt, interactive lessons', 'https://sqlbolt.com'],
      ],
      lessons: ['app-databases', 'transactions'],
    },
    {
      name: 'HTML and CSS',
      level: 'Important',
      use: 'The structure and the look of every web page. Accessible HTML works for every reader.',
      first: ['Elements that say what content is', 'Forms and labels', 'The box model', 'Flexbox and grid'],
      links: [['MDN: Learn web development', 'https://developer.mozilla.org/en-US/docs/Learn_web_development']],
      lessons: ['html-css', 'accessibility'],
    },
    {
      name: 'The command line',
      level: 'Important',
      use: 'Servers, containers and CI jobs are run from a shell. You read logs, move files and join small tools.',
      first: ['Navigate and search files', 'Pipes and redirection', 'Environment variables', 'SSH and curl'],
      links: [['The Missing Semester (MIT)', 'https://missing.csail.mit.edu']],
      lessons: ['shell'],
    },
    {
      name: 'Docker',
      level: 'Important',
      use: 'Package a service with everything that it needs, so that it runs the same on a laptop and in production.',
      first: ['Images and containers', 'Write a Dockerfile', 'Ports, volumes and environment variables', 'Compose for several services'],
      links: [['Docker: get started', 'https://docs.docker.com/get-started/']],
      lessons: ['containers'],
    },
    {
      name: 'Java, C# or Go',
      level: 'For some roles',
      use: 'Large back ends and company systems. Each has static types and a large standard library.',
      first: ['Types, classes or structs', 'Packages and the build tool', 'Concurrency in the language'],
      links: [
        ['A Tour of Go', 'https://go.dev/tour/'],
        ['Dev.java: learn Java', 'https://dev.java/learn/'],
        ['C# documentation', 'https://learn.microsoft.com/en-us/dotnet/csharp/'],
      ],
      lessons: ['type-systems', 'concurrency'],
    },
    {
      name: 'Swift or Kotlin',
      level: 'For some roles',
      use: 'Native apps for iPhone (Swift) and Android (Kotlin).',
      first: ['The language basics', 'Screens and navigation', 'State and data flow'],
      links: [
        ['The Swift programming language', 'https://docs.swift.org/swift-book/'],
        ['Kotlin documentation', 'https://kotlinlang.org/docs/home.html'],
      ],
      lessons: ['app-choice', 'ui-state'],
    },
    {
      name: 'C or Rust',
      level: 'For some roles',
      use: 'Operating systems, devices and code where speed and memory matter most.',
      first: ['Pointers or references', 'The stack and the heap', 'Who owns memory, and who frees it'],
      links: [['The Rust programming language', 'https://doc.rust-lang.org/book/']],
      lessons: ['memory'],
    },
  ],
  skillsTitle: 'What a good software engineer can do',
  skillsNote: 'A list to measure yourself against, and to find the next lesson. Languages and frameworks change. These abilities do not.',
  skills: [
    {
      group: 'Build',
      lead: 'You can turn a need into working code.',
      items: [
        ['Turn a vague request into small pieces of work that you can test', ['planning', 'domain-modelling']],
        ['Write code that a colleague can read and change', ['functions', 'modules-interfaces', 'refactoring']],
        ['Choose a data structure for the operations that matter', ['hash-maps', 'big-o']],
        ['Design an API, and keep it stable for the people who use it', ['apis', 'coupling']],
        ['Store data safely, with transactions', ['app-databases', 'transactions']],
        ['Write tests that find real bugs, and keep them fast', ['unit-tests', 'integration-tests']],
      ],
    },
    {
      group: 'Operate',
      lead: 'You can keep it working after the first release.',
      items: [
        ['Find a bug by a method: reproduce, narrow, fix, test', ['debugging']],
        ['Ship small changes through a pipeline that you trust', ['ci', 'cd', 'feature-flags']],
        ['Know that the service is unhealthy before users tell you', ['observability']],
        ['Respond to an incident, then review it without blame', ['on-call', 'postmortems']],
        ['Keep secrets out of code, and give each part the least access', ['secrets', 'least-privilege']],
      ],
    },
    {
      group: 'Decide',
      lead: 'You can choose, and say what the choice gives up.',
      items: [
        ['One service or many, from the team and the load', ['architecture-styles']],
        ['Web, native or cross-platform for an app', ['app-choice']],
        ['Where to render a page, and why', ['rendering']],
        ['When to add a cache or a queue, and what it costs', ['caching', 'queues']],
      ],
    },
    {
      group: 'Work with people',
      lead: 'You are someone that a team wants to keep.',
      items: [
        ['Review code well, and take review well', ['code-review']],
        ['Write a design or a decision so that others can follow it', ['decision-records', 'writing']],
        ['Use AI assistants, and still check and explain every line', ['ai-assistants']],
        ['Read and change code that you did not write', ['reading-code']],
      ],
    },
  ],
}
