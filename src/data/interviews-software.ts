/** The Interviews page of software engineering. See interviews.ts for the shape and the rules. */
import type { InterviewGuide } from './interviews.ts'

export const SOFTWARE_INTERVIEWS: InterviewGuide = {
  lead: 'Software interviews test whether you can solve problems in code, design a system, and work well in a team. The formats are imperfect, and they are learnable. This page lists the usual stages, questions that come up often, and the mistakes that new engineers make on the job.',
  stages: [
    {
      name: 'Recruiter call',
      tests: 'Whether your experience fits the role, and your expectations for pay, level and location.',
      prepare: ['A two-minute story of what you built and your part in it', 'Why this company, in one or two specific sentences', 'Your salary range, said as a range'],
      lessons: ['interviews'],
    },
    {
      name: 'Online assessment',
      tests: 'One to three timed problems, scored by tests. It filters many applicants before a person reads anything.',
      prepare: ['Read the whole problem and its limits before you code', 'Test the edge cases: empty input, one item, duplicates', 'Know the cost of your solution in Big O'],
      lessons: ['big-o', 'arrays-lists', 'hash-maps'],
    },
    {
      name: 'Coding interview',
      tests: 'A problem solved live while you talk. They score how you think, test and communicate, not only whether the code runs.',
      prepare: ['Say a simple solution first, then improve it', 'Talk while you think, and ask about the input', 'Run your code by hand on a small example'],
      lessons: ['hash-maps', 'searching-sorting', 'trees-graphs', 'recursion', 'dynamic-programming'],
    },
    {
      name: 'System design',
      tests: 'Design a service such as a URL shortener or a chat app. Mid-level and senior roles weigh this round heavily.',
      prepare: ['Requirements and rough numbers first', 'Draw the parts, then follow one request through them', 'Say what breaks at ten times the load, and the trade-offs of your choices'],
      lessons: ['scaling', 'caching', 'queues', 'app-databases', 'distributed'],
    },
    {
      name: 'Behavioural',
      tests: 'How you work with others: conflict, feedback, a mistake, a decision under uncertainty.',
      prepare: ['Four or five stories, told as situation, action, result', 'A mistake you made and what you changed after it', 'A time you disagreed and how it ended'],
      lessons: ['ways-of-working', 'code-review', 'postmortems'],
    },
  ],
  questions: [
    {
      topic: 'Coding',
      items: [
        {
          q: 'Find two numbers in a list that add up to a target.',
          answer: 'The simple answer checks every pair: O(n²). Better: walk the list once and keep a hash map of the numbers seen. For each number, look up target minus it. O(n) time, O(n) space.',
          lessons: ['hash-maps', 'big-o'],
        },
        {
          q: 'When does recursion fail, and what do you use instead?',
          answer: 'Deep recursion fills the call stack. Repeated subproblems make it slow. Use a loop with your own stack, or memoisation, or build the answer bottom up.',
          lessons: ['recursion', 'dynamic-programming'],
        },
      ],
    },
    {
      topic: 'Systems',
      items: [
        {
          q: 'What happens when you type an address into a browser?',
          answer: 'DNS finds the server, TCP and TLS open a secure connection, the browser sends an HTTP request, the server answers, and the browser parses HTML, loads CSS and scripts, and draws the page. Go deep where the interviewer shows interest.',
          lessons: ['open-a-page', 'http', 'networks', 'rendering'],
        },
        {
          q: 'The database is slow under load. What do you do?',
          answer: 'Measure first: which queries, how often. Then add indexes, cache hot reads, add read replicas, and move slow work to a queue. Sharding comes last, because it is the hardest to undo.',
          lessons: ['app-databases', 'caching', 'scaling', 'queues'],
        },
        {
          q: 'How do you make a payment request safe to retry?',
          answer: 'The client sends an idempotency key with the request. The server stores the result by that key, and a retry with the same key returns the stored result instead of charging twice.',
          lessons: ['failure', 'apis'],
        },
      ],
    },
    {
      topic: 'Practice',
      items: [
        {
          q: 'How do you test code that calls an external service?',
          answer: 'Put the call behind an interface. Unit tests use a fake. A few integration tests run against a real or containerised service. Do not let unit tests call the network.',
          lessons: ['test-doubles', 'integration-tests'],
        },
        {
          q: 'What do you look for in a code review?',
          answer: 'First correctness and design, then tests, then names and readability. Ask questions rather than give orders, and keep style rules in an automatic formatter.',
          lessons: ['code-review', 'code-quality'],
        },
      ],
    },
  ],
  gotchas: [
    {
      title: 'Big pull requests',
      why: 'A change of a thousand lines waits days for review, and the review finds less.',
      instead: 'Send small changes that each do one thing. Hide unfinished work behind a feature flag.',
      lessons: ['code-review', 'feature-flags'],
    },
    {
      title: 'It works on my machine',
      why: 'Your machine has a different version, a setting or a file that production does not have.',
      instead: 'Pin versions, keep configuration in the environment, and run the same build in CI as in production.',
      lessons: ['environments-config', 'containers', 'ci'],
    },
    {
      title: 'A secret in the repository',
      why: 'A key committed once stays in the history, even after you delete the file.',
      instead: 'Use a secret store and scan commits. If a key leaks, rotate it at once.',
      lessons: ['secrets'],
    },
    {
      title: 'Stuck alone for days',
      why: 'New people often think a question shows weakness. A day of silence costs the team more than a question.',
      instead: 'Try for a fixed time, write down what you tried, then ask.',
      lessons: ['ways-of-working', 'reading-code'],
    },
    {
      title: 'Logs that do not help',
      why: 'An error at 3 a.m. with no request id and no context takes hours to find.',
      instead: 'Log with structure and a request id, and add metrics and alerts for what users feel.',
      lessons: ['observability', 'on-call'],
    },
  ],
  practice: [
    ['Tech Interview Handbook', 'https://www.techinterviewhandbook.org/', 'The whole process, from CV to offer, free.'],
    ['NeetCode', 'https://neetcode.io/', 'Coding problems grouped by pattern, with video answers.'],
    ['The System Design Primer', 'https://github.com/donnemartin/system-design-primer', 'Building blocks and worked designs for system design rounds.'],
  ],
}
