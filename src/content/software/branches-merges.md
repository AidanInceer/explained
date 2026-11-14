---
minutes: 9
tech: []
refs:
  - progit: Ch. 3, “Git Branching”
  - seag: Ch. 16, “Version Control and Branch Management”
---
Several people change the same project at the same time. Each needs a place to work without breaking the shared version, and a way to bring the work back together. In Git, **branches** give the place, and **merges** and **pull requests** bring work together.

## Branches

A **branch** is a name that points to a commit. The main branch is usually called `main`. When you create a branch and commit on it, the branch moves forward and `main` stays where it was.

```
git switch -c fix-rounding     # create a branch and move to it
# edit, add, commit...
git switch main                # back to main, unchanged
```

Branches in Git are cheap: creating one only writes a small name. So it is normal to make a branch for every change, however small.

## Merging

When the work on a branch is ready, you **merge** it into `main`. Git finds the last commit that both branches share, compares each side's changes since then, and combines them.

- If `main` has not moved, Git simply moves `main` forward to your branch. This is a **fast-forward**.
- If both have new commits, Git makes a **merge commit** with two parents.

A **rebase** is the other way to combine work: it replays your commits on top of the latest `main`, as if you had started there. The history is a straight line. Because rebase rewrites your commits, only rebase work that you have not shared.

::fig sw-git | Build a branch step by step, then join it with a merge or a rebase.

## Conflicts

If both branches changed the same lines, Git cannot choose, and stops with a **merge conflict**. It marks both versions in the file:

```
<<<<<<< HEAD
TAX_RATE = 0.2
=======
TAX_RATE = 0.21
>>>>>>> fix-rounding
```

You decide what the result should be, edit the file, remove the markers, and commit. A conflict is not an error. It is Git asking a person a question that it cannot answer.

> **Rule of thumb.** Small branches that live for a day or two have few conflicts. A branch that lives for a month will conflict with everything.

## Pull requests

A **pull request** (GitHub, Bitbucket) or **merge request** (GitLab) asks to merge a branch into `main`. It shows the changes, runs the automated checks, and lets colleagues comment on each line before anything merges. This is where most **code review** happens. The lesson “Code review”, on the Testing and quality line, builds on it.

A good pull request:

- Does one thing, and says what and why in its description.
- Is small enough to review properly. Hundreds of lines get a glance; thirty lines get a real review.
- Passes its checks before it asks for review.

## Trunk-based development

Many strong teams keep branches very short and merge into `main` at least daily. Unfinished features hide behind **feature flags**, so they can merge before they are ready to show. This avoids long-lived branches and the conflicts that come with them.

## Remember

- A branch is a cheap name for a line of commits. Make one for each change.
- Merge combines branches. Rebase replays commits; do not rebase shared work.
- A conflict is Git asking you to choose. Short branches have fewer conflicts.
- Pull requests show changes, run checks, and gather review before merging.

::quiz
? Two developers change the same line of the same file on different branches. What happens when the second one merges?
- Git keeps the newer change
+ Git stops with a conflict and asks a person to choose the result
- Git keeps both lines
! Git cannot know which change is right, so it marks both and asks.
? Which pull request is most likely to get a careful review?
+ One small change with a clear description and passing checks
- A month of work in one request
- One with no description, to save time
! Reviewers read small, explained changes carefully. Large ones get skimmed.
::end
