/**
 * The subjects of the site. Data engineering is written: its lessons are the files in src/content.
 * The other subjects are plans: lines of lesson titles with no text yet. They show as skeleton maps, so readers
 * can see what is coming and contributors can pick a lesson to write.
 *
 * To change a plan, edit the lines and lessons below. To propose a lesson, open a "Lesson proposal" issue.
 */

export type SubjectId = 'data' | 'software' | 'ai'

export interface PlannedLesson {
  title: string
  summary: string
  /** 'deeper' for detail that a reader can skip. Default 'core'. */
  level?: 'core' | 'deeper'
}

export interface PlanLine {
  name: string
  blurb: string
  color: string
  lessons: PlannedLesson[]
}

export interface Subject {
  id: SubjectId
  /** Full name, as in "Data engineering, explained". */
  name: string
  /** Short name for the subject switcher in the header. */
  short: string
  path: string
  status: 'written' | 'planned'
  headline: string
  lead: string
  /** Lines of planned lessons. Empty for a written subject: its map comes from the lesson files. */
  lines: PlanLine[]
}

const software: PlanLine[] = [
  {
    name: 'Foundations',
    blurb: 'How a program runs, and the habits that keep code easy to change.',
    color: '#132029',
    lessons: [
      { title: 'What happens when code runs', summary: 'Source code, compilers and interpreters, processes and memory.' },
      { title: 'Version control with Git', summary: 'Commits, branches and merges, and why history is a safety net.' },
      { title: 'Code that others can change', summary: 'Names, small functions and clear boundaries.' },
      { title: 'Testing: why and what', summary: 'Unit, integration and end-to-end tests, and what each one proves.' },
      { title: 'Debugging as a method', summary: 'Reproduce, isolate, find the cause, then fix.' },
      { title: 'Cost of an algorithm', summary: 'Big O in plain words: how work grows with the size of the input.', level: 'deeper' },
    ],
  },
  {
    name: 'The web',
    blurb: 'What a browser does with a page, from the address bar to pixels.',
    color: '#2456D6',
    lessons: [
      { title: 'What happens when you open a page', summary: 'DNS, TCP, TLS, the request and the response.' },
      { title: 'HTTP', summary: 'Methods, status codes, headers and caching.' },
      { title: 'HTML, CSS and the DOM', summary: 'Structure, style, and the tree that scripts change.' },
      { title: 'JavaScript in the browser', summary: 'The event loop, and why one slow task freezes the page.' },
      { title: 'Server, client or static rendering', summary: 'Where the HTML is made, and what each choice costs.' },
      { title: 'Front-end frameworks and state', summary: 'Components, state and why the screen follows the data.' },
      { title: 'Accessibility', summary: 'Keyboard, screen readers and contrast, built in from the start.' },
      { title: 'Web performance', summary: 'What makes a page slow to show and slow to respond.', level: 'deeper' },
    ],
  },
  {
    name: 'Apps',
    blurb: 'Software on phones and desktops, and the problems that the web does not have.',
    color: '#7A3FD1',
    lessons: [
      { title: 'Native, cross-platform or web app', summary: 'What each choice gives, and what it costs a small team.' },
      { title: 'Screens, navigation and app state', summary: 'How an app remembers where the user is.' },
      { title: 'Offline first and sync', summary: 'Local data, conflicts, and what to do when the network is gone.' },
      { title: 'Background work and notifications', summary: 'What the operating system lets an app do when it is closed.', level: 'deeper' },
      { title: 'Releasing to the app stores', summary: 'Builds, signing, review and staged rollouts.' },
    ],
  },
  {
    name: 'Back end',
    blurb: 'The services behind the screen: data, identity and scale.',
    color: '#0B8A78',
    lessons: [
      { title: 'APIs: REST, GraphQL and RPC', summary: 'Three ways to ask a service for something, and when to use each.' },
      { title: 'Authentication and authorisation', summary: 'Who you are, what you may do, sessions and tokens.' },
      { title: 'Databases for applications', summary: 'Transactions, indexes and migrations without downtime.' },
      { title: 'Caching', summary: 'Where to keep a copy, and when the copy is wrong.' },
      { title: 'Queues and background jobs', summary: 'Do slow work later, and retry it safely.' },
      { title: 'Scaling a service', summary: 'Stateless servers, load balancers and the database underneath.', level: 'deeper' },
    ],
  },
  {
    name: 'Design',
    blurb: 'How to split a system into parts that can change on their own.',
    color: '#D0356F',
    lessons: [
      { title: 'Modules and interfaces', summary: 'Deep modules: a small interface over a lot of behaviour.' },
      { title: 'Coupling and cohesion', summary: 'Why a change in one place should not break another.' },
      { title: 'Errors and failure', summary: 'Fail early, fail loudly, and let the caller decide.' },
      { title: 'Refactoring safely', summary: 'Change the shape of code without changing what it does.' },
      { title: 'Monolith or services', summary: 'Where to draw service lines, and the cost of each line.', level: 'deeper' },
    ],
  },
  {
    name: 'Delivery',
    blurb: 'From a commit on a laptop to software that people use, and keeping it running.',
    color: '#B97700',
    lessons: [
      { title: 'CI and CD', summary: 'Every change built, tested and ready to release.' },
      { title: 'Environments and configuration', summary: 'Same code, different settings, no secrets in the repository.' },
      { title: 'Containers', summary: 'Ship the program with everything that it needs to run.' },
      { title: 'Cloud basics', summary: 'Compute, storage and networks that you rent by the hour.' },
      { title: 'Logs, metrics and traces', summary: 'How to see what a running system is doing.' },
      { title: 'Security basics', summary: 'The common attacks on web software, and the usual defences.' },
      { title: 'Incidents and postmortems', summary: 'Fix it now, then learn from it without blame.', level: 'deeper' },
    ],
  },
  {
    name: 'Working in a team',
    blurb: 'The parts of the job that are not code.',
    color: '#4D7C0F',
    lessons: [
      { title: 'Code review', summary: 'What to look for, and how to say it.' },
      { title: 'Planning and estimates', summary: 'Small steps, honest ranges, and when to say no.' },
      { title: 'Docs and decision records', summary: 'Write down why, so the next person does not guess.' },
      { title: 'Working with AI assistants', summary: 'Give good context, check the output, own the result.' },
    ],
  },
]

const ai: PlanLine[] = [
  {
    name: 'Maths',
    blurb: 'The small amount of maths under all of it, with pictures before symbols.',
    color: '#132029',
    lessons: [
      { title: 'Vectors and matrices', summary: 'Lists of numbers as points and arrows, and how a matrix moves them.' },
      { title: 'Derivatives and gradients', summary: 'Which way is downhill, and how steep.' },
      { title: 'Probability and distributions', summary: 'How likely each outcome is, and how to describe the spread.' },
      { title: 'Statistics from samples', summary: 'Mean, variance, and how sure you can be.' },
      { title: 'Entropy and cross-entropy', summary: 'How to measure surprise, and why models are trained to reduce it.', level: 'deeper' },
      { title: 'Gradient descent', summary: 'Take small steps downhill until the error stops falling.' },
    ],
  },
  {
    name: 'The physical layer',
    blurb: 'The chips, memory and power that AI runs on, and why they set the limits.',
    color: '#B4530A',
    lessons: [
      { title: 'Why GPUs', summary: 'Thousands of small units doing the same arithmetic at once.' },
      { title: 'Memory is the bottleneck', summary: 'Moving numbers costs more than multiplying them.' },
      { title: 'Numbers in hardware', summary: 'float32, bfloat16 and int8: less precision, more speed.' },
      { title: 'Training and inference compute', summary: 'Why a model costs a lot once, then a little each time.' },
      { title: 'Datacentres, power and cost', summary: 'Where the electricity goes, and what it costs.', level: 'deeper' },
      { title: 'Scaling laws', summary: 'More data, more parameters, more compute, and what each one buys.' },
    ],
  },
  {
    name: 'Machine learning',
    blurb: 'How a program learns a rule from examples instead of being told it.',
    color: '#0B8A78',
    lessons: [
      { title: 'What learning from data means', summary: 'A model, its parameters, and a measure of how wrong it is.' },
      { title: 'Supervised, unsupervised, reinforcement', summary: 'Three kinds of signal to learn from.' },
      { title: 'Loss functions', summary: 'One number that says how bad the answers are.' },
      { title: 'Train, validation and test', summary: 'Keep some data back, or you cannot know if the model works.' },
      { title: 'Overfitting, bias and variance', summary: 'A model that remembers is not a model that understands.' },
      { title: 'Classic models', summary: 'Linear models, decision trees and clustering, still in use every day.', level: 'deeper' },
      { title: 'Measuring a model', summary: 'Accuracy, precision, recall, and which one matters.' },
    ],
  },
  {
    name: 'Neural networks',
    blurb: 'Layers of simple units that, together, learn very complex rules.',
    color: '#7A3FD1',
    lessons: [
      { title: 'A neuron and a layer', summary: 'Weighted sums and a bend: the whole building block.' },
      { title: 'Backpropagation', summary: 'How the error flows back to correct every weight.' },
      { title: 'Activation functions', summary: 'Why a network needs bends, and which bends are used.', level: 'deeper' },
      { title: 'Convolutional networks', summary: 'The same small filter, moved across an image.' },
      { title: 'Recurrent networks and their limits', summary: 'Memory through time, and why it fades.', level: 'deeper' },
      { title: 'Regularisation and normalisation', summary: 'Tricks that make deep networks train at all.' },
    ],
  },
  {
    name: 'Language models',
    blurb: 'How an LLM turns text into numbers, predicts the next piece, and learns to be useful.',
    color: '#2456D6',
    lessons: [
      { title: 'Tokens and tokenisers', summary: 'Text cut into pieces that a model can count.' },
      { title: 'Embeddings', summary: 'Meaning as a position: similar words sit close together.' },
      { title: 'Attention', summary: 'Each word looks at the others and takes what it needs.' },
      { title: 'The transformer', summary: 'Attention and small networks, stacked many times.' },
      { title: 'Pretraining', summary: 'Predict the next token across a large part of the internet.' },
      { title: 'Fine-tuning and instructions', summary: 'From a text predictor to an assistant that follows requests.' },
      { title: 'Learning from preferences', summary: 'RLHF and its relatives: people rank answers, the model learns.', level: 'deeper' },
      { title: 'Sampling', summary: 'Temperature and top-p: how the next token is chosen.' },
      { title: 'Context windows', summary: 'What the model can see at once, and what it forgets.' },
      { title: 'Why models make things up', summary: 'Fluent is not the same as true.' },
    ],
  },
  {
    name: 'Using AI',
    blurb: 'How to build with models, and how to know if the result is good.',
    color: '#D8472B',
    lessons: [
      { title: 'Prompting', summary: 'Clear instructions, examples and context.' },
      { title: 'Retrieval-augmented generation', summary: 'Give the model the documents it needs, at the time it needs them.' },
      { title: 'Tools and agents', summary: 'A model that can call functions, and the loop around it.' },
      { title: 'Evaluating models', summary: 'Test sets for open-ended answers, and their limits.' },
      { title: 'Cost, speed and model choice', summary: 'Large or small, hosted or local, and the trade-offs.', level: 'deeper' },
      { title: 'Safety and alignment', summary: 'Making a model do what people intend, and not more.' },
    ],
  },
]

export const SUBJECTS: Subject[] = [
  {
    id: 'data',
    name: 'Data engineering',
    short: 'Data',
    path: '/',
    status: 'written',
    headline: 'Data engineering, explained in small pieces.',
    lead: '',
    lines: [],
  },
  {
    id: 'software',
    name: 'Software engineering',
    short: 'Software',
    path: '/software',
    status: 'planned',
    headline: 'Software engineering, explained in small pieces.',
    lead: 'How software is written, shipped and kept running: the web, apps, back ends, design and the work of a team. One idea in each lesson, with a drawing and the reason behind each choice.',
    lines: software,
  },
  {
    id: 'ai',
    name: 'AI',
    short: 'AI',
    path: '/ai',
    status: 'planned',
    headline: 'AI, explained in small pieces.',
    lead: 'From the maths and the chips underneath, through classic machine learning and neural networks, to how a large language model works and how to build with one.',
    lines: ai,
  },
]

export const subjectById = Object.fromEntries(SUBJECTS.map((s) => [s.id, s])) as Record<SubjectId, Subject>

/** The subject that an address belongs to. Everything that is not a planned subject is data engineering. */
export const subjectOfPath = (path: string): Subject =>
  SUBJECTS.find((s) => s.status === 'planned' && (path === s.path || path.startsWith(s.path + '/'))) ?? subjectById.data
