---
minutes: 7
tech: []
refs:
  - seag: Ch. 20, “Static Analysis”, and Ch. 8, “Style Guides and Rules”
---
Some mistakes are so common and so simple that a person should never have to look for them: an unused variable, a misspelled name, inconsistent spacing, a missing `await`. Tools find these automatically, every time, in seconds. Let them, and keep human attention for what tools cannot judge.

## Formatters

A **formatter** rewrites code into one consistent layout: spacing, line breaks, quotes, order of imports. Prettier for JavaScript and TypeScript, Black or Ruff for Python, `gofmt` for Go, `rustfmt` for Rust.

The value is not that one style is best. It is that the team never argues about style again, and every diff shows only real changes. Run the formatter on save, and check in CI that all code is formatted.

## Linters

A **linter** reads code and warns about likely mistakes and bad habits:

- Variables that are defined and never used, or used and never defined.
- Code that can never run.
- A comparison that is always true.
- Patterns known to cause bugs, such as a mutable default argument in Python.
- Rules the team chose, such as "no `print` in production code".

Examples: ESLint for JavaScript and TypeScript, Ruff or Pylint for Python, Clippy for Rust. Many problems have an automatic fix.

## Type checkers

A **type checker** finds a whole class of errors before the code runs, as [Static and dynamic types](/lesson/type-systems) explained: wrong arguments, missing fields, possibly-null values used as if they were present. TypeScript's compiler, mypy and Pyright for Python.

## Put them in the pipeline

These tools only help if they always run:

1. **In the editor**, so problems show as you type.
2. **Before a commit**, with a pre-commit hook, for fast checks.
3. **In CI**, on every pull request, so nothing unchecked is merged. CI is the one place nobody can skip.

> **Rule of thumb.** Make the build fail on lint and type errors, not just warn. Warnings that do not fail anything grow into hundreds, and then nobody reads them.

## Adding tools to old code

Turning on strict rules in an old codebase can produce thousands of warnings. Do not fix them all at once:

- Turn rules on for new and changed files first.
- Record the existing warnings as a baseline, and fail only on new ones.
- Fix old warnings in small, separate changes.

## What tools cannot do

Tools check form, not meaning. They cannot tell whether the code does what the business needs, whether a design will be easy to change, or whether a name explains its purpose well. That is the job of [Code review](/lesson/code-review) by people, which is far more useful when the simple problems are already gone.

## Remember

- Formatters end style arguments. Run them on save and check in CI.
- Linters find likely mistakes. Type checkers find wrong types before the code runs.
- Run all of them in the editor, before commits, and in CI. Fail the build on errors.
- Tools check form; people review meaning.

::quiz
? A team spends review time commenting on spacing and quote style. What should they do?
+ Add a formatter and check it in CI, then review only what tools cannot
- Write a longer style guide
- Stop reviewing code
! Formatters settle style automatically, so reviewers can focus on logic and design.
? A project has 900 linter warnings that nobody reads. What is a practical next step?
+ Fail CI on new warnings, and reduce the old ones in small changes
- Turn the linter off
- Fix all 900 in one large change
! A baseline stops the count growing. Small clean-ups reduce it without risky giant changes.
::end
