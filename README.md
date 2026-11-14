# Data Engineering Explained

A local website that teaches the core concepts of data engineering as a map of lessons. Eight lines (Foundations, Storage, Modeling, Pipelines, Processing, Architecture, Operations, Worked designs), 58 lessons and 37 figures. The figures include decision helpers, an animated batch and streaming comparison, and four step-by-step whiteboard designs. Lessons can also contain `::scenario` blocks (`?` situation, then `+` best, `~` workable, `-` poor options, each as `option | reason`). Each lesson has a place on the map (`at: [column, row]` in `src/curriculum.ts`) and must be below all of its prerequisites. No login. Progress is saved in the browser.

## Run

```powershell
npm install
npm run dev
```

Open http://localhost:5199.

`npm run build` type-checks and writes a static site to `dist`. `npm run preview` serves it.

## Structure

| Path | Contents |
|---|---|
| `src/curriculum.ts` | Lines, lessons, prerequisites, sources. The map is drawn from this file |
| `src/content/<lesson-id>.md` | Lesson text |
| `src/figures/` | Diagrams and interactive explainers |
| `src/glossary.ts` | Glossary terms, each linked to a lesson |
| `src/components/` | Map, lesson page, quiz, search, glossary, sources |

## Add a lesson

1. Add an entry to `LESSONS` in `src/curriculum.ts`. The `id` is the file name and the URL.
2. Write `src/content/<id>.md`.

Lesson files are Markdown with three additions:

```
::fig partitions | Caption text.

::quiz
? Question
- Wrong option
+ Correct option
! Explanation shown after an answer.
::end
```

A callout is a blockquote that starts with a bold label: `> **Pitfall.** ...`

To add a figure, export a React component from a file in `src/figures/` and register its name in `src/figures/index.tsx`.

## Sources

Lessons summarise *Fundamentals of Data Engineering* (Reis, Housley), *Designing Data-Intensive Applications* (Kleppmann), *The Data Warehouse Toolkit* (Kimball, Ross), *Streaming Systems* (Akidau, Chernyak, Lax), the Data Engineering Wiki, r/dataengineering, and the papers and essays listed on the Sources page.
