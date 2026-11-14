---
minutes: 7
tech: []
refs:
  - opensourceguide: “How to Contribute to Open Source”
  - progit: Ch. 6, “GitHub”
---
Most of the software you use every day is built on **open source**: code that anyone may read, use and change under its licence. Linux, Python, PostgreSQL, React and thousands of smaller libraries are all maintained in the open, often by volunteers. Contributing is a way to learn from experienced engineers, to fix the tools you depend on, and to show your work in public.

## Licences

Open source is defined by its **licence**:

- **Permissive** licences, such as MIT, Apache 2.0 and BSD, let anyone use the code, including in closed products, with little more than keeping the copyright notice.
- **Copyleft** licences, such as the GPL, require that changed versions you distribute are also released under the same licence.

Check a project's licence before you use or contribute to it, and follow your employer's policy.

## Find a first contribution

- Start with a project you already use. You know what it does and where it hurts.
- Look for issues labelled "good first issue" or "help wanted".
- Documentation fixes, clearer error messages, small bugs and missing tests are valued and a good way in.

## Before you start

- **Read the contributing guide** (`CONTRIBUTING.md`) and the code of conduct. Projects have their own rules for style, tests and commit messages. This site has one too.
- **Comment on the issue** before doing large work: "I would like to work on this; my plan is…". Maintainers may already have a direction, or someone else may be on it.
- **Run the project and its tests locally**, as in [Reading code that you did not write](/lesson/reading-code).

## Make the change

The usual GitHub flow:

1. **Fork** the repository to your account, and clone it.
2. Create a branch, as in [Branches, merges and pull requests](/lesson/branches-merges).
3. Make a small, focused change, with tests.
4. Push to your fork and open a **pull request** to the original project, explaining what and why, and linking the issue.
5. Respond to review comments, and update the branch.

## Be patient and kind

Maintainers are often unpaid and busy. A review may take days or weeks. A polite reminder after a week or two is fine; pressure is not. If your pull request is declined, ask what would make a better contribution next time. Many long-time maintainers started with a rejected first change.

> **In practice.** Even if your change is not merged, you have read a real codebase, followed its process and had your code reviewed by experienced people. That is the main value of the exercise.

## Remember

- Open source is defined by its licence: permissive or copyleft.
- Start with a project you use, and a small issue or a documentation fix.
- Read the contributing guide, comment before large work, and run the tests.
- Fork, branch, small change with tests, pull request. Be patient and kind.

::quiz
? You want to fix a large problem in a popular project. What should you do first?
+ Comment on the issue with your plan, and wait for the maintainers' view
- Write all the code, then open a big pull request
- Fork the project and maintain your own version
! Maintainers may have plans or constraints. Agreeing first avoids wasted work.
? Your company wants to use a GPL library inside a product that it distributes. What should happen?
+ Check the licence's obligations with whoever handles licensing, because copyleft has conditions for distribution
- Nothing: all open source is free to use in any way
- Remove the licence file
! Copyleft licences require changed versions you distribute to stay under the same licence. Follow your company's policy.
::end
