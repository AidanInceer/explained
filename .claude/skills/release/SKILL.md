---
name: release
description: Release tested work from the develop branch to main (the live site). Use when asked to release, ship, publish, promote develop, or merge develop into main.
---

# Release develop to main

`main` is the live site. `develop` is published as a preview at
https://aidaninceer.github.io/explained/develop/. A release is a pull request from `develop` into `main`.

## Steps

1. **Check develop is ready.**
   - `git fetch origin`
   - `gh run list --branch develop --limit 4` — the latest CI and Deploy runs on `develop` must be `success`.
   - If a run failed, stop and report the failure with `gh run view <id> --log-failed`.
2. **List what goes out.** `git log --oneline origin/main..origin/develop`. If it is empty, there is nothing to
   release: say so and stop.
3. **Open the pull request** (or find the open one: `gh pr list --base main --head develop`):
   `gh pr create --base main --head develop --title "Release: <short summary>" --body "<list of changes>"`.
   The body lists the commits from step 2 in plain words, and the preview address.
4. **Ask the user to test the preview and approve.** Do not merge without a clear yes in chat.
5. **Merge** with a merge commit, so `develop` and `main` keep the same history:
   `gh pr merge <number> --merge`. Do not delete the `develop` branch.
6. **Confirm.** `gh run list --branch main --limit 2`. When the Deploy run succeeds, open
   https://aidaninceer.github.io/explained/ and check the change is live.

## Hotfix

For an urgent fix to the live site: branch from `main`, open the pull request into `main`, then merge `main`
back into `develop` (`git switch develop && git merge origin/main && git push`).
