---
minutes: 8
tech: []
refs:
  - tshandbook: The Basics, and Everyday Types
  - pep484: Rationale and Goals
  - seag: Ch. 22, “Large-Scale Changes”
---
Every language has types. The question is *when* it checks them. A **static** language checks types before the program runs. A **dynamic** language checks them while it runs. The choice decides which mistakes you find in your editor and which you find in production.

## Dynamic types

In Python, JavaScript and Ruby, a variable can hold any type, and the types are checked when an operation runs:

```python
def total(prices):
    return sum(prices)

total("12.50")   # fails only when this line runs
```

This is quick to write and flexible. The cost is that a wrong type is found only when that exact line runs with that exact value, which may be in front of a customer.

## Static types

In Java, C#, Go, Rust and TypeScript, the types of variables and parameters are known before the program runs, either written by you or worked out by the compiler:

```typescript
function total(prices: number[]): number {
  return prices.reduce((a, b) => a + b, 0)
}

total("12.50")   // compile error: string is not number[]
```

The compiler checks every call against the declared types. The mistake shows up in your editor, before you run anything.

## What static types give

- **Earlier errors.** A whole class of bugs never reaches a test or a user.
- **Documentation that stays true.** `prices: number[]` says what the function needs, and the compiler checks that it is still correct.
- **Tools.** The editor can complete names, find every use of a function, and rename it safely across a large codebase.
- **Safe change.** Change a function's parameters, and the compiler lists every caller that must change too.

## What they cost

- More to write, at least at first. Type inference reduces this a lot.
- Some correct programs are hard to express in the type system.
- Types say what kind of value, not whether it is right. A price of −5 is still a `number`.

## Gradual typing

Python and JavaScript now allow **type hints**: optional types that a separate checker (mypy or Pyright for Python, the TypeScript compiler for JavaScript) reads. The program runs the same with or without them. Teams add them to the most important code first.

```python
def total(prices: list[float]) -> float:
    return sum(prices)
```

> **Rule of thumb.** The bigger the codebase and the longer it lives, the more static types pay back. For a short script that one person runs once, they matter less.

## Strong and weak

A separate question is how strictly a language treats types while it runs. Python is **strong**: `"2" + 3` is an error. JavaScript is **weak**: it converts and gives `"23"`. Static or dynamic is about *when* types are checked; strong or weak is about how much the language converts silently.

## Remember

- Static types are checked before the program runs. Dynamic types are checked while it runs.
- Static types find many mistakes early, document code, and make large changes safe.
- Types say what kind of value something is, not whether the value is correct.
- Type hints add gradual static checking to Python and JavaScript.

::quiz
? A team renames a parameter in a function used in 300 places. Which helps most to find every caller that must change?
+ A static type checker
- More comments
- A faster CPU
! The type checker checks every call against the new signature and lists each one that no longer matches.
? A function takes `amount: number`. What can the type checker not catch?
- A call with a string
+ A call with a negative amount where only positive amounts make sense
- A call with no argument
! Types check the kind of value. Rules about which values are valid need checks in code or tests.
::end
