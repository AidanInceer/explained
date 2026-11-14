# Explained

A website that teaches technical subjects as maps of short lessons. Each lesson is one idea, a drawing, and the reason behind each choice.

| Subject | State |
|---|---|
| Data engineering | Written: the map at `/` |
| Software engineering | Planned: a skeleton map of lesson titles at `/software` |
| AI (maths, hardware, machine learning, LLMs) | Planned: a skeleton map of lesson titles at `/ai` |

The plans are in `src/data/plans/`, drawn as maps by `src/map/plan-layout.ts`. Pick a lesson from one and propose it with the "Lesson proposal" issue form.

Data engineering has:

- **83 lessons on nine lines**: Foundations, Storage, Modeling, Pipelines, Processing, Architecture, Operations, Worked designs, Build it yourself.
- **40 figures**: diagrams, decision helpers, animations and step-by-step system designs.
- **Quizzes and scenarios** in the lessons, and a definition at the side for terms that a lesson off the reader's path explains.
- **A glossary, a toolkit page and a sources page.** Every lesson cites the books, papers and essays it summarises.
- **No account and no server.** Progress, quiz answers and highlights stay in the reader's browser.

## Run it

You need [Node.js](https://nodejs.org) 20.19 or later (the version in `.nvmrc` is the one CI uses).

```powershell
npm install
npm run dev
```

Open http://localhost:5199. Changes to lessons and code show at once.

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 5199 |
| `npm run check` | Type check and all tests. Run this before you open a pull request |
| `npm test` | Tests only. `npm run test:watch` runs them again on each change |
| `npm run build` | Type check, then a static site in `dist/` |
| `npm run preview` | Serve `dist/` on port 5199 |

## Contribute

Corrections, clearer explanations and new lessons are welcome. Most changes need only Markdown: each lesson is one file in `src/content/`. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the lesson format, the writing style, how to add a figure, and the `develop` → `main` branch flow. Claude Code users: see `CLAUDE.md` and the skills in `.claude/skills/`.

## How it is built

React, TypeScript and Vite. There is no back end.

| Path | Contents |
|---|---|
| `src/content/<id>.md` | One lesson: its data (title, line, place on the map, prerequisites, sources) and its text |
| `src/data/` | Lines (`tracks.ts`), sources, glossary, technology notes, tool links, Toolkit page |
| `src/figures/` | Diagrams and interactive figures. `index.tsx` gives each one the name that lessons use |
| `src/lessons/` | The lesson format: types, parser, checks, and term marking in the browser |
| `src/map/layout.ts` | Where each line and lesson sits on the map |
| `src/components/` | Pages and parts of pages. `lesson/` has the lesson page |
| `src/lib/` | Reader data in the browser (progress, quiz answers, highlights) and search |
| `build/vite-plugin-lessons.ts` | Reads and checks the lesson files at build time |

How a lesson gets to the screen:

1. At build time, `build/vite-plugin-lessons.ts` reads every file in `src/content/`. It checks the data at the top of each file and stops with a clear message if something is wrong.
2. The data of all lessons becomes one small module (`virtual:lessons`). The map, the lists and the search use it.
3. The text of each lesson becomes HTML parts in its own small file. The browser loads it when the lesson opens, so there is no Markdown parser in the site.
4. In the browser, `src/lessons/link.ts` marks technology names and terms that open a note at the side.

### Data in the browser

All keys are in `localStorage` and start with `dee.`. Change a key's version if you change the shape of its value.

| Key | Contents |
|---|---|
| `dee.progress.v1` | Lessons marked as understood |
| `dee.quiz.v1`, `dee.quizscore.v1` | Quiz answers and results |
| `dee.marks.v2` | Highlights and underlines, as text positions in each block of a lesson |
| `dee.wide.v1`, `dee.read.v1` | Reading preferences: wide view, all parts open |

## Deploy

| Branch | Address |
|---|---|
| `main` | https://aidaninceer.github.io/explained/ (the live site) |
| `develop` | https://aidaninceer.github.io/explained/develop/ (a preview, to test changes before they go live) |

A push to either branch runs `.github/workflows/deploy.yml`. It checks and builds both branches, then publishes them together as one GitHub Pages site. If `develop` fails to build on a push to `main`, the live site still deploys, without the preview. CI (`.github/workflows/ci.yml`) runs on every pull request and on each push to `main` and `develop`.

To release, open a pull request from `develop` into `main` (see "Branches and releases" in [CONTRIBUTING.md](CONTRIBUTING.md)).

To see the GitHub Pages build on your machine, run `npm run preview:pages` and open http://localhost:5200/explained/.

How the build works under a sub-path:

- `vite build --base=/<path>/` sets the path. The router (`src/main.tsx`) and the links in lesson text (`build/vite-plugin-lessons.ts`) take it from there. Development uses `/`.
- GitHub Pages cannot send `index.html` for every address, so the workflow copies it to `404.html`. Addresses such as `/lesson/cdc` then open directly. A small script in `index.html` sends unknown addresses under `develop/` on to the preview build.

Other static hosts also work: build with `npm run build` and serve `dist/`. The host must send `index.html` for any address that is not a file (Netlify or Cloudflare Pages: a `_redirects` file with `/* /index.html 200`; Vercel: a rewrite of `/(.*)` to `/index.html`). With a custom domain, the site is at the root and no `--base` is needed.

Files in `dist/assets/` have a content hash in their names, so they can be cached for a long time. Do not cache `index.html` for long.

## Sources

Lessons summarise *Fundamentals of Data Engineering* (Reis, Housley), *Designing Data-Intensive Applications* (Kleppmann), *The Data Warehouse Toolkit* (Kimball, Ross), *Streaming Systems* (Akidau, Chernyak, Lax), the Data Engineering Wiki, r/dataengineering, and the papers and essays on the Sources page (`src/data/sources.ts`).
