---
name: add-lesson
description: Add, move or rewrite a lesson in this site. Use when asked to write a new lesson, change where a lesson sits on the map, change its prerequisites, or turn a planned lesson (software engineering or AI) into a written one.
---

# Add a lesson

Read `CONTRIBUTING.md` sections "Lessons" and "Writing style" first. They are the rules.

## Steps

1. **Branch.** `git switch develop && git pull && git switch -c lesson/<id>`.
2. **Choose the place.**
   - Pick the `track` from `src/data/tracks.ts`.
   - List the lessons on that track with their `at` values: `grep -l "track: <track>" src/content/*.md`, then
     read the `at:` lines. Pick a free `[column, row]`.
   - The new lesson must be lower (larger row, or a lower band) than every prerequisite.
3. **Write the file** `src/content/<id>.md`. The id is kebab-case and is the address `/lesson/<id>`.
   - YAML block: `title`, `summary`, `track`, `level`, `minutes`, `at`, `prereqs`, `tech`, `refs`.
   - Text: `##` headings make parts. End with a `::quiz` of one to three questions.
   - Every main idea needs a source in `refs`. Add new sources to `src/data/sources.ts` first.
   - New terms go in `src/data/glossary.ts` with this lesson as the lesson that explains them.
4. **Check.** `npm run check`. Fix each error; the message names the file and what to change.
5. **Look.** Start the dev server (`preview_start` with the `explained` configuration), open
   `/` and find the lesson on the map, then open `/lesson/<id>` and open each part. Check the quiz.
6. **Commit and open a pull request into `develop`**, with a screenshot of the map around the lesson.

## Software engineering and AI lessons

These subjects take their map from the plans in `src/data/plans/`. To write a planned lesson, follow "Write a planned
lesson" in `CONTRIBUTING.md`:

1. Find the lesson's id, title and prerequisites in `src/data/plans/<subject>.ts`. Read the lessons on its path that
   already have text, so the new one does not repeat them.
2. Write `src/content/<subject>/<id>.md` with only `minutes`, `tech` and `refs` in the YAML block.
3. Add sources to `src/data/sources-<subject>.ts` and terms to `src/data/glossary-<subject>.ts`.
4. Link only to lessons that have text. Name a planned lesson by its title in quotes.
5. `npm run check`, then open `/<subject>` and `/lesson/<id>` in the dev server.

Do not put these files in `src/content/` itself: that folder is the data engineering map.
