---
minutes: 7
tech: []
refs:
  - goos: Ch. 1, “What Is the Point of Test-Driven Development?”
  - pragprog: Topic 41, “Test to Code”
---
**Test-driven development** (TDD) turns the usual order round: you write a test for the next small piece of behaviour *before* you write the code. The test fails, you write just enough code to pass it, then you tidy up. Repeated in small steps, this gives code that is tested by design and shaped by how it is used.

## The cycle

1. **Red.** Write a small test for behaviour that does not exist yet. Run it, and watch it fail. The failure proves that the test can fail, and that the behaviour really is missing.
2. **Green.** Write the simplest code that makes the test pass. Not the final design; just enough.
3. **Refactor.** Now that the test protects you, improve the code: better names, remove duplication. The tests must stay green.

Each cycle takes minutes. You are never far from working code.

## An example

You need a function that formats prices.

- Red: `assert format_price(250) == "£2.50"`. It fails: the function does not exist.
- Green: write a function that divides by 100 and formats two decimal places.
- Red: `assert format_price(5) == "£0.05"`. Does it pass? If your first version printed "£0.5", you just found a bug before any user did.
- Red: `assert format_price(-250) == "-£2.50"`. Decide what negative prices should look like, write it down as a test, then make it pass.

Each test is a decision about behaviour, made explicitly, one at a time.

## What it gives

- **Tests for everything you build**, because nothing is built without one.
- **Better interfaces.** Writing the test first makes you use the code before it exists, from the caller's side. Awkward interfaces show up at once.
- **Small steps**, so when something breaks, you know it was the last two minutes of work.
- **Confidence to refactor**, which keeps the design clean over time.

## Where it is harder

- **Exploration.** When you do not yet know what to build, such as a first try at a new library or a quick prototype, writing tests first slows you down. Spike to learn, then throw the spike away and build properly.
- **User interfaces and visuals**, where "correct" is hard to state as an assertion.
- **Code that calls many outside services**, unless you have good seams and [test doubles](/lesson/test-doubles).

> **For experienced readers.** Strict TDD and "test soon after" can both give well-tested code. What matters is that the tests exist, that they check behaviour, and that you have seen each one fail.

## Remember

- Red: write a failing test. Green: make it pass simply. Refactor: tidy with the tests as a net.
- Work in small steps of a few minutes.
- TDD gives tested code and interfaces shaped by use.
- It fits clear behaviour best; explore first when the problem is unclear.

::quiz
? Why should you see a new test fail before you write the code?
+ To prove that the test can detect the missing behaviour
- Because test runners require a failure first
- To make the code slower
! A test that passes before the code exists is not testing what you think.
? In the green step, what should you write?
+ The simplest code that makes the test pass
- The final, fully general design
- More tests
! Keep the step small. The design improves in the refactor step, protected by the tests.
::end
