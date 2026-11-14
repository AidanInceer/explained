---
minutes: 8
tech: []
refs:
  - sicp: Ch. 1, Section 1.3, “Formulating Abstractions with Higher-Order Procedures”, and Ch. 3, Section 3.1.3, “The Costs of Introducing Assignment”
---
**Functional programming** is a style that avoids changing values. Instead of updating state, a function takes values and returns new ones. You do not need a special language to use it: the main ideas work in Python, JavaScript, Java and most others, and they remove many of the bugs from [State and change](/lesson/state).

## Pure functions

A function is **pure** when:

1. Its result depends only on its arguments.
2. It has no **side effects**: it does not change anything outside itself, write files, or send messages.

```python
def with_vat(price):          # pure
    return price * 1.2

def add_vat_to_all(prices):   # not pure: changes its argument
    for i in range(len(prices)):
        prices[i] = prices[i] * 1.2
```

A pure function is easy to test: give inputs, check the output, no set-up. It is easy to reason about: the same call always gives the same answer. It is safe to run on many threads at once, because it shares nothing.

## Values that never change

An **immutable** value cannot be changed after it is created. Python's strings and tuples are immutable. To "change" one, you make a new one:

```python
name = "ada"
upper = name.upper()   # "ADA", a new string; name is still "ada"
```

With immutable values, aliasing stops being a problem. Two names can share a value safely, because nobody can change it under the other.

## Map, filter and reduce

Many loops follow three patterns. Functional style names each one:

- **Map**: make a new list by applying a function to each item.
- **Filter**: keep only the items that pass a test.
- **Reduce**: combine all items into one value, such as a sum.

```python
paid = [o for o in orders if o.paid]           # filter
totals = [o.total for o in paid]               # map
revenue = sum(totals)                          # reduce
```

Each line says *what* it does. There is no counter to get wrong and no list that changes while you read it.

## Functions as arguments

A **higher-order function** takes a function as an argument, or returns one. `sorted(users, key=last_login)` from [Functions](/lesson/functions) is one. They let you write the general part of an algorithm once and pass in the specific part.

## Where it fits

A program must still have effects: it saves data and shows a screen. The practical approach is a **pure core** with a thin **shell** of effects around it. The core computes prices, decisions and new states from inputs. The shell reads inputs, calls the core, and writes the results. Most bugs live in the core, and the core is the part that is easy to test.

> **For experienced readers.** Immutable data has a cost: copying. Persistent data structures share the unchanged parts between old and new versions, so a "copy" of a large list with one change costs very little.

## Remember

- A pure function depends only on its arguments and has no side effects.
- Immutable values cannot be changed, so they are safe to share.
- Map, filter and reduce name the common loop patterns.
- Keep a pure core and push effects to the edges.

::quiz
? Which function is pure?
+ One that returns the total of a list of numbers given to it
- One that adds the current time to a log file
- One that returns a random number
! A pure function depends only on its arguments and changes nothing outside. The time and randomness are hidden inputs.
? Why is a pure function easy to test?
- It runs faster
+ The same input always gives the same output, with no state to set up
- It cannot raise an error
! There is nothing to prepare and nothing to clean up: call it and compare the result.
::end
