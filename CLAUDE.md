# Explained

A static site (React, TypeScript, Vite) that teaches subjects as maps of short lessons: data engineering, software
engineering and AI. Each subject has a map, a toolkit, a glossary and sources (`/<subject>/toolkit` and so on).
Data engineering is complete. Software engineering and AI take their map from a plan; a planned lesson gets text
when its file is written.

## Commands

- `npm run dev` — dev server on http://localhost:5199
- `npm run check` — type check and all tests, including the checks of every lesson file. Run before each commit.
- `npm run build` — production build
- `npm run preview:pages` — the GitHub Pages build on http://localhost:5200/explained/

## Where things are

- `src/content/<id>.md` — one data engineering lesson per file: YAML block at the top, Markdown text below.
- `src/content/software/<id>.md`, `src/content/ai/<id>.md` — lessons of the planned subjects. Title, line and
  prerequisites come from `src/data/plans/`.
- `build/vite-plugin-lessons.ts` — reads, checks and parses lesson files at build time.
- `src/lessons/` — lesson format (`format.ts`), checks (`validate.ts`), term marking (`link.ts`), loading (`load.ts`).
- `src/data/` — tracks, sources, glossary, toolkit, technology notes, and `subjects.ts` (the list of subjects).
  Sources, glossary and toolkit have one file for each of software (`-software.ts`) and AI (`-ai.ts`).
- `src/data/systems/` — the system drawings at the top of the software and AI pages.
- `src/data/plans/` — planned lessons for software engineering and AI. `src/map/plan-layout.ts` places them on a map
  and checks them.
- `src/map/layout.ts` — where each line sits on the map.
- `src/components/` — pages. `lesson/` is the lesson page and its parts. `intro/` is the site home page (`/`). `system/` holds the
  system drawings (`PlanSystem.tsx` for software and AI). Data engineering's map is at `/data`.
- `CONTRIBUTING.md` — the full lesson format and the writing style. Read it before you write lesson text.

## Rules

- Writing style for lesson text: short sentences, active voice, British spelling, define each term, say why.
- Keep data in `src/data/`, not in components. No server, no new dependency for a few lines of code.
- Lesson ids are unique across all subjects (`/lesson/<id>`).
- Colours come from CSS variables in `src/styles.css`, so dark mode works. Do not add a hard-coded colour to a page;
  lesson figures in `.fig-frame` stay light in dark mode.
- Do not rename `localStorage` keys (`dee.*`). Readers would lose their progress. Change the version suffix only
  when the stored shape changes.
- Each lesson must be lower on the map than all of its prerequisites. The build stops if not.

## Branches

- Work on a branch from `develop`, and open the pull request into `develop`.
- A push to `develop` publishes a preview at https://aidaninceer.github.io/explained/develop/.
- Release: a pull request from `develop` into `main`. Use the `release` skill. Do not push to `main` directly.

## Skills

- `add-lesson` — add or move a data engineering lesson.
- `release` — move tested work from `develop` to `main`.
