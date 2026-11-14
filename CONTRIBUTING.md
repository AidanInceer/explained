# Contributing

Thank you for helping. Corrections, clearer explanations, better figures and new lessons are all welcome.

- **A typo or a wrong fact**: edit the lesson file and open a pull request. You do not need to open an issue first.
- **A new lesson or a big change to a lesson**: open an issue first with the "Lesson proposal" form. Say what the reader will understand after the lesson, and where it goes on the map.
- **A bug in the site**: open an issue with the "Bug report" form.

By taking part you agree to the [code of conduct](CODE_OF_CONDUCT.md).

## Set up

You need Node.js 20.19 or later.

```powershell
npm install
npm run dev
```

Open http://localhost:5199. The page updates when you save a file. If a lesson file has a problem, the page shows the file, the line and what to change.

Before you open a pull request, run:

```powershell
npm run check
```

This type-checks the code and runs the tests, which also check every lesson file, figure name, glossary term and link.

## Lessons

Each lesson is one file: `src/content/<id>.md`. The file name is the lesson's id and its address (`/lesson/<id>`). Use lower-case words joined by `-`.

### The data at the top

```yaml
---
title: Idempotent pipelines
summary: A job is idempotent when running it twice gives the same result as running it once. This makes retries and backfills safe.
track: pipelines
level: core
minutes: 8
at: [0, 3]
prereqs: [incremental-loading]
tech: [orchestrators, tableformats]
refs:
  - functional: Whole essay
  - fode: Ch. 7, “Idempotency” in ingestion considerations
---
```

| Key | Meaning |
|---|---|
| `title` | Short, and says what the reader learns |
| `summary` | One or two sentences. Shows on the map, in search and under the title |
| `track` | The line: `foundations`, `storage`, `modeling`, `pipelines`, `processing`, `architecture`, `ops`, `designs` or `build` (see `src/data/tracks.ts`) |
| `level` | `core` for the main path, `deeper` for detail that a reader can skip. Deeper lessons have a dashed box on the map |
| `minutes` | Time to read the lesson, with its figures and quiz |
| `at` | Place on the map: `[column, row]` inside the line's band. Columns start at 0. Most lines have 2 columns; Foundations, Worked designs and Build it yourself have 5 |
| `prereqs` | Ids of the lessons to read first. Use `[]` for none |
| `tech` | Technology notes to show at the side. Keys of `TECH` in `src/data/tech.ts`. Use `[]` for none |
| `refs` | Where the content comes from. One line for each source: `- <source id>: <chapter or section>`. Source ids are the keys of `SOURCES` in `src/data/sources.ts` |

If a value has a colon followed by a space, put it in quotes: `- wiki: "FAQ: What is Data Engineering?"`.

### Place on the map

Every lesson must be **lower on the map than all of its prerequisites**, so that every line on the map runs down. The build stops if this is not true. In practice:

- A prerequisite on the same line needs a smaller row.
- A prerequisite on another line must be in a band higher on the page. The bands from the top are: Foundations; then Storage, Modeling and Pipelines; then Processing, Architecture and Operations; then Worked designs; then Build it yourself.
- Two lessons on one line cannot have the same `at`.

After you add or move a lesson, look at the map on the home page. If a line needs more rows than its band has, change the band in `src/map/layout.ts`.

### The text

The text is Markdown. Use `##` headings to divide the lesson into parts: the reader opens one part at a time. A long `##` section with two or more `###` headings is divided at the `###` headings.

Link to another lesson with its address: `[partitioning](/lesson/partitioning)`. The build checks that the lesson exists.

A **callout** is a quote that starts with a bold label:

```markdown
> **Pitfall.** Appending in a job that can be retried duplicates rows.
```

Labels in use: `Pitfall.`, `In practice.`, `Rule of thumb.`, `For new readers.`, `For experienced readers.`, `From the community.`

A **figure**, by its name in `src/figures/index.tsx`:

```markdown
::fig idempotency | Choose a write method and run the job again.
```

A **quiz**. Each question has one correct option (`+`), one or more wrong options (`-`) and an explanation (`!`). Most lessons end with a quiz of one to three questions.

```markdown
::quiz
? A job appends rows and is retried after a timeout. What happens?
- Nothing, the database removes duplicates
+ The rows are loaded twice
- The job fails
! Append is not idempotent. Each run adds the rows again.
::end
```

A **scenario**: a situation, then options marked `+` (best), `~` (workable) or `-` (poor), each with the reason after `|`.

```markdown
::scenario
? A daily job must be rerun for last Tuesday.
+ Overwrite Tuesday's partition | The result depends only on Tuesday's input.
~ Delete and insert in one transaction | Correct, but more to get wrong.
- Append again | Duplicates every row.
::end
```

### Writing style

The site is for readers whose first language may not be English, and for new and experienced engineers.

- Use short sentences, one idea in each. Prefer simple, common words.
- Use the active voice and the present tense: "The job writes the file", not "The file is written by the job".
- Define a term the first time you use it, or link to the lesson that does.
- Say why, not only what. Give the reason for each choice, and the cost of the alternatives.
- Do not name a product as the answer unless the lesson is about choosing products. Teach the idea; the technology notes at the side list the tools.
- Tell the reader to "select" a control, not to "click" it.
- Spelling is British (behaviour, optimise), except the name of the field: "data modeling".
- Cite a source for each main idea in `refs`. Do not copy text from a source; explain it in your own words.

### Terms and technology notes

- **Glossary** (`src/data/glossary.ts`): each term has a short definition and the lesson that explains it. When a lesson uses a term from a lesson that is not on its path, the first use gets the definition at the side. Mark general computing terms that no lesson teaches with `basic: true`.
- **Technology notes** (`src/data/tech.ts`): groups of tools. `match` is the words in a lesson that open the note. Add the home page of each tool to `src/data/tool-urls.ts`. Logos come from the [simple-icons](https://simpleicons.org) package; a tool with no logo shows its initials.
- **Sources** (`src/data/sources.ts`): add a source here before a lesson cites it.

## Figures

A figure is a React component with no props, in a file in `src/figures/`. Register it with a name in `src/figures/index.tsx`, then use the name in a lesson with `::fig <name> | caption`.

- Draw with SVG and the classes in `src/figures/figures.css` and `figures-more.css`, so that the figure matches the others.
- Use `viewBox` and no fixed width, so the figure scales on small screens.
- If the figure moves, respect `prefers-reduced-motion` and give the reader a way to pause it. See `src/figures/motion.tsx`.
- Every control must work with a keyboard and have a visible label.
- Give a diagram a text equivalent: a `role="img"` and an `aria-label`, or a caption that says what the figure shows.

## Code

- TypeScript in strict mode. `npm run check` must pass.
- Keep a component to one job. Put data in `src/data/`, not in components.
- Do not add a dependency for something that a few lines of code can do. The site has no server and should stay that way.
- If you change the shape of data in `localStorage`, change the version in its key (for example `dee.marks.v2` to `dee.marks.v3`).
- Add a test for a change to the lesson format (`src/lessons/`) or the checks.

## Pull requests

- One change in each pull request. A new lesson and its figure can be one pull request.
- Say what you changed and why. For a new lesson, add a screenshot of its place on the map.
- CI runs `npm run check` and `npm run build`. Both must pass.
