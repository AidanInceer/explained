---
minutes: 8
tech: []
refs:
  - seag: Ch. 21, “Dependency Management”
  - pragprog: Topic 2, “The Cat Ate My Source Code”, on taking responsibility for what you ship
---
Almost no program is written from nothing. A web app may use hundreds of **packages**: code written by others for dates, HTTP, databases, tests. They save months of work. Each one is also code that you did not write, cannot fully read, and must keep up to date. Managing them well is part of the job.

## Packages and registries

A **package** (or library) is a bundle of code with a name and a **version**, published to a **registry**: PyPI for Python, npm for JavaScript, Maven Central for Java, crates.io for Rust. A **package manager**, such as pip, npm or Cargo, downloads packages and installs them for your project.

Your project lists what it needs in a file: `pyproject.toml`, `package.json`, `Cargo.toml`. These are its **dependencies**.

## Versions

Most packages use **semantic versioning**: `MAJOR.MINOR.PATCH`, such as `2.4.1`.

- **PATCH** goes up for bug fixes that change nothing else.
- **MINOR** goes up for new features that do not break existing use.
- **MAJOR** goes up for changes that can break code that uses the package.

A dependency can name a range, such as "any 2.x from 2.4 on". That lets you get fixes without breaking changes, if the authors follow the rules. Not all do.

## Lock files

Ranges create a problem: install today and next month, and you may get different versions. A **lock file** (`package-lock.json`, `poetry.lock`, `Cargo.lock`, `uv.lock`) records the exact version of every package that was installed, including the packages that your packages need. Install from the lock file and every developer, every test run and production get the same code.

> **Rule of thumb.** Commit the lock file for applications. Update it on purpose, in its own change, with the tests run.

## Transitive dependencies

You add one package. It needs five others, and they need more. These **transitive dependencies** are often most of the code in a project. You chose one; you depend on fifty. A bug, a licence problem or an attack in any of them is your problem too.

## Isolation

Two projects on one computer may need different versions of the same package. Install each project's packages separately:

- Python uses a **virtual environment**, a folder with its own Python and packages, per project.
- npm puts packages in each project's `node_modules` folder.
- Containers go further and isolate the whole system, as the lesson on containers explains.

Never install a project's packages into the computer's main Python. Sooner or later two projects will need different versions.

## Choosing a package

Before you add a dependency, ask:

- Do I need it? A few lines of my own code may be simpler than a package and its tree.
- Is it maintained? Recent releases, open issues answered, more than one maintainer.
- Is it widely used? Many users find bugs before you do.
- What is its licence, and does it allow our use?

## Remember

- Packages come from registries and are installed by a package manager.
- Semantic versions: major breaks, minor adds, patch fixes.
- A lock file pins every exact version, so every install is the same.
- Each package brings its own dependencies. Add packages on purpose, and isolate each project.

::quiz
? A project's tests pass on one laptop and fail on another, with the same code. What is a likely cause?
+ The two installs got different package versions, because there is no lock file
- One laptop has a faster CPU
- Git changed the code
! Without a lock file, version ranges can resolve to different releases on different days.
? A package goes from version 3.2.0 to 4.0.0. What does that signal under semantic versioning?
+ It may contain changes that break code that uses it
- It only has bug fixes
- It has no changes
! A major version change means breaking changes are possible. Read the release notes before you upgrade.
::end
