---
minutes: 9
tech: []
refs:
  - progit: Ch. 1, “Getting Started”, and Ch. 2, “Git Basics”
  - missing: Lecture 6, “Version Control (Git)”
---
**Version control** records every change to a project, who made it and why. You can see how any file looked on any day, undo a mistake from last week, and work with others without overwriting each other. **Git** is the version control system that almost every team uses.

## Snapshots, not differences

A **repository** is a project folder plus its full history, kept in a hidden `.git` folder.

When you **commit**, Git saves a **snapshot**: the state of every file at that moment, with a message, your name and the time. Files that did not change are not copied again; the commit points to the stored version. Each commit also points to its **parent**, the commit before it. The chain of commits is the history.

Each commit has an id, a long **hash** such as `3f9a2c1…`, computed from its contents. Change anything in a commit and its hash changes. This is how Git knows that history has not been altered by accident.

## The three places

Git has three places where a change can be:

1. The **working directory**: the files that you edit.
2. The **staging area**: the changes you have chosen for the next commit.
3. The **repository**: the commits.

```
git status            # what changed, and what is staged
git add report.py     # stage one file's changes
git commit -m "Fix rounding of totals"
git log --oneline     # the history
```

The staging area lets you commit related changes together, even if you changed other files at the same time. A commit with one purpose is easy to review and easy to undo.

## Good commits

- **Small and whole.** One logical change, and the project still works after it.
- **A clear message.** The first line says what the change does, in under about 50 characters. The body, if needed, says *why*.
- **Often.** Each commit is a point you can return to.

"Fix bug" helps nobody in a year. "Round totals to pence before tax, not after" tells the reader what and points to why.

## Undo

Git makes most mistakes reversible:

- `git restore file.py` throws away your uncommitted changes to a file.
- `git revert <commit>` adds a new commit that undoes an old one. History stays intact, so this is safe on shared work.
- `git reset` moves your branch back to an earlier commit. Use it only on commits that you have not shared.

## Remotes

A **remote** is a copy of the repository on another computer, usually a service such as GitHub or GitLab. `git push` sends your commits there. `git pull` brings others' commits to you. Because every clone has the full history, the remote is a meeting point, not the only copy.

> **Pitfall.** Never commit passwords, API keys or other secrets. Removing them later does not remove them from history, and anyone with a clone has them. Add such files to `.gitignore`, and treat a leaked key as compromised: replace it.

## Remember

- A commit is a snapshot of the project, with a message and a parent.
- Files move from the working directory to the staging area to a commit.
- Make small commits with clear messages that say why.
- `revert` undoes shared work safely. Never commit secrets.

::quiz
? A bad commit was pushed and others have already pulled it. How do you undo it safely?
+ `git revert` the commit, which adds a new commit that reverses it
- `git reset` to before the commit and push again
- Delete the repository and start again
! Revert adds to the history instead of rewriting it, so others' copies stay consistent.
? Why use the staging area?
- Git requires every file to be staged twice
+ To choose exactly which changes go into the next commit
- To make files read-only
! Staging lets one commit hold one logical change, even when you have edited other things too.
::end
