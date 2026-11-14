---
minutes: 8
tech: []
refs:
  - refactoring: Ch. 2, “Principles in Refactoring”, and Ch. 3, “Bad Smells in Code”
---
**Refactoring** is changing the structure of code without changing what it does. Rename a variable, split a long function, move a method to the class where it belongs. Each step is small and keeps the program working. Done steadily, refactoring keeps a codebase easy to change. Skipped, the code slowly becomes too risky to touch.

## Small, safe steps

The method has two rules:

1. **Keep behaviour the same.** A refactoring changes structure only. If you also want to change behaviour, do it in a separate step.
2. **Keep the tests green.** Run them after every step. If they fail, undo the last step, which was small, rather than debug a large change.

So refactoring needs tests. Without them, you cannot know that behaviour stayed the same. In code with no tests, first write tests that pin down what it does now, as [Why test](/lesson/why-test) suggested.

## Common refactorings

- **Rename** a variable, function or class so its name says what it is. Your editor does this safely.
- **Extract function**: move part of a long function into a new function with a good name.
- **Inline**: the reverse, when a function adds nothing over its body.
- **Move**: put a function in the module where its data lives.
- **Replace a conditional with polymorphism**, or with a lookup table, when the same `if` chain on a type appears in many places.
- **Introduce a parameter object**: group parameters that always travel together, such as `start_date` and `end_date`, into one `DateRange`.

## Smells

A **code smell** is a sign that the structure may be wrong. Not always a problem, but worth a look:

- A **long function** that needs comments to explain its sections.
- **Duplicated code** that must change in several places.
- A **long parameter list**.
- **Feature envy**: a function that uses another object's data more than its own.
- **Shotgun surgery**: one change needs small edits in many files, the coupling problem from [Coupling and cohesion](/lesson/coupling).
- **Comments that explain what** confusing code does, where a clearer name would do.

## When to refactor

- **Before a change**: make the change easy, then make the easy change. If a feature is awkward to add, first reshape the code so it fits.
- **While reading**: when you work out what something does, rename it so the next reader need not.
- **Not as a separate project**. Months of "the big refactor" with no new features worry everyone and often never finish. Many small refactorings, mixed with feature work, keep code healthy.

> **Pitfall.** Do not mix refactoring and behaviour changes in one commit or pull request. A reviewer cannot see which lines changed what the program does. Keep them separate.

## Remember

- Refactoring changes structure, never behaviour, in small steps.
- Run the tests after every step. No tests: write some first.
- Smells point to where structure may be wrong.
- Refactor before and during feature work, and keep it separate from behaviour changes.

::quiz
? You must add a feature, and the code where it belongs is tangled. What is a good approach?
+ First refactor so the feature fits easily, with tests green, then add the feature
- Add the feature in the tangle and refactor some other time
- Rewrite the whole module
! Make the change easy, then make the easy change. Keep the two steps separate.
? A refactoring breaks a test. What should you do?
+ Undo the small step and try again, more carefully
- Change the test to match
- Keep going and fix it at the end
! A refactoring must not change behaviour. Small steps make undoing cheap.
::end
