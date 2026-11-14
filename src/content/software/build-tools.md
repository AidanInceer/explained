---
minutes: 7
tech: []
refs:
  - seag: Ch. 18, “Build Systems and Build Philosophy”
  - pragprog: Topic 51, “Pragmatic Starter Kit”, on automation
---
Turning source code into something that runs takes many steps: install packages, generate code, compile, bundle, run checks, run tests. When people do these steps by hand, they do them in different orders, skip some, and get different results. **Build tools** and scripts make the same steps run the same way every time, on every machine.

## What a build does

Depending on the language, a build may:

- Install the exact package versions from the lock file.
- Compile code, or **transpile** it, for example TypeScript to JavaScript.
- **Bundle** many files into a few, and make them smaller, for a web page.
- Run the linter, the type checker and the tests.
- Produce an **artefact**: an executable, a package, a container image.

## Build tools

Each ecosystem has its own:

| Language | Common tools |
|---|---|
| JavaScript, TypeScript | npm scripts, Vite, esbuild, webpack |
| Python | pip or uv, with `pyproject.toml`; tox or nox for checks |
| Java, Kotlin | Gradle, Maven |
| Go, Rust | `go build`, Cargo, built into the language |
| Large, many-language codebases | Bazel |

The tool reads a file that describes the project: what it needs, what to build, and how.

## Only rebuild what changed

A good build tool tracks **dependencies between steps**: this file is compiled from those sources; this bundle is made from these files. When you change one file, it rebuilds only what depends on it, and reuses everything else. On a large project this is the difference between seconds and many minutes.

This is the same idea as the topological sort in [Graph algorithms](/lesson/graph-algorithms): the steps form a graph, and the tool runs them in an order where each step comes after what it needs.

## Scripts as the project's commands

Put the common tasks behind short, named commands in the project itself:

```json
"scripts": {
  "dev": "vite",
  "test": "vitest run",
  "check": "tsc --noEmit && vitest run"
}
```

Now every developer and the CI system run `npm run check` and get the same thing. A new team member reads one file to learn how the project works. This site uses exactly these scripts.

> **Rule of thumb.** If a step is written only in a wiki or in someone's head, it will be done wrongly. Put it in a script in the repository.

## Reproducible builds

The goal is that the same source always gives the same result. That needs:

- Exact versions of every dependency, from a lock file.
- The same tool versions, often fixed in a file such as `.nvmrc` or a container image.
- No hidden inputs: no reliance on files that exist only on one laptop.

When the build is reproducible, "it works on my machine" stops being an excuse, because every machine is the same.

## Remember

- A build turns source into a working artefact through many steps.
- Build tools rebuild only what changed, by tracking dependencies between steps.
- Put common tasks in named scripts in the repository.
- Pin versions of dependencies and tools so every build gives the same result.

::quiz
? Why should the steps to run the tests be a script in the repository, not a page in the wiki?
+ The script runs the same way for everyone, and it changes with the code
- Wikis cannot hold commands
- Scripts run faster than typed commands
! A script is versioned with the code and runs identically on every machine and in CI.
? You change one file in a large project. What does a good build tool do?
- Rebuild everything from the start
+ Rebuild only the steps that depend on that file
- Nothing until you delete the old output
! Tracking dependencies between steps lets the tool reuse everything that the change does not affect.
::end
