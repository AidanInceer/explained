---
minutes: 7
tech: []
refs:
  - seag: Ch. 11, “Testing Overview”
  - pragprog: Topic 41, “Test to Code”
---
Every program is tested. The only question is whether you test it, or your users do. **Automated tests** are small programs that run your code and check the results. They are less about finding bugs today, and more about letting you change the code tomorrow without fear.

## The real reason

Code that works is rarely finished. Requirements change, libraries update, someone fixes a bug and breaks something else. Without tests, every change is a gamble: you check the part you changed by hand, and hope the rest still works.

With a good set of tests, you change the code, run the tests in a minute, and know. That confidence is what lets a team keep improving a codebase for years instead of being afraid to touch it.

## What a test looks like

```python
def test_vat_is_added():
    assert add_vat(100) == 120

def test_zero_price_stays_zero():
    assert add_vat(0) == 0
```

A test has three parts, often called **arrange, act, assert**: set up the inputs, call the code, check the result. A test runner, such as pytest, finds the tests, runs them, and reports which pass and which fail.

## Kinds of tests

| Kind | Checks | Speed | How many |
|---|---|---|---|
| Unit | One function or class on its own | Milliseconds | Many |
| Integration | Several parts together, often with a real database | Seconds | Some |
| End-to-end | The whole system, as a user uses it | Seconds to minutes | Few |

This shape, many small fast tests and a few large slow ones, is often drawn as a **test pyramid**. Fast tests run on every change. Slow ones catch what only appears when everything is connected. The next lessons, [Unit tests](/lesson/unit-tests) and [Integration and end-to-end tests](/lesson/integration-tests), cover each.

## What makes tests worth having

- **Fast.** Tests that take an hour are run rarely. Tests that take a minute are run all the time.
- **Reliable.** A test that fails at random, a **flaky** test, teaches the team to ignore failures. Fix or delete it.
- **About behaviour.** A test should check what the code does, not how it does it, so you can rewrite the inside without changing the test.
- **Readable.** A failing test should say clearly what broke.

> **Pitfall.** Test coverage, the share of lines that tests run, is a useful hint and a poor goal. A test can run every line and check nothing. Ask instead: if this behaviour broke, would a test fail?

## Tests as documentation

A test shows exactly how code is meant to be used, with real inputs and outputs, and unlike written docs it fails when it becomes wrong. When you join a project, reading the tests is one of the fastest ways to understand it, as [Reading code that you did not write](/lesson/reading-code) suggested.

## Remember

- Tests let you change code without fear.
- A test arranges inputs, acts, and asserts the result.
- Many fast unit tests, some integration tests, a few end-to-end tests.
- Good tests are fast, reliable, about behaviour, and readable.

::quiz
? A team avoids changing an old module because "nobody knows what might break". What would help most?
+ Tests that pin down the module's current behaviour, so changes can be checked
- A rule that nobody may change it
- More comments
! Tests turn "nobody knows" into a check that runs in minutes.
? A test fails about once in twenty runs, with no code change. What should the team do?
+ Find the cause and fix the test, or remove it
- Run it again until it passes
- Ignore it
! Flaky tests teach people to ignore failures, which hides real bugs.
::end
