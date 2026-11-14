---
minutes: 9
tech: []
refs:
  - clrs: Ch. 14, “Dynamic Programming”
  - sicp: Ch. 3, Section 3.3.3, exercise on memoization
---
Some problems break into smaller problems that **overlap**: the same small problem appears many times inside the big one. A plain recursive solution solves each copy again, and the work explodes. **Dynamic programming** solves each small problem once, keeps the answer, and reuses it. The name is historical; it simply means "fill in a table of answers".

## The waste

[Recursion](/lesson/recursion) showed the Fibonacci function, where each number is the sum of the two before it. `fib(5)` calls `fib(4)` and `fib(3)`. But `fib(4)` also calls `fib(3)`. Lower down, `fib(2)` is computed many times over. The number of calls grows about 1.6 times with each step up, so `fib(50)` would take hours.

Yet there are only 51 different questions: `fib(0)` to `fib(50)`.

## Memoisation: remember answers

Keep a dictionary of answers. Before you compute, look up. After you compute, store.

```python
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Now each `fib(k)` is computed once. `fib(50)` takes 51 steps. This top-down approach is called **memoisation** (often spelled memoization). Python's `functools.cache` adds it with one line.

## Tabulation: fill a table from the bottom

The other way is to start from the smallest problems and build up:

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

This **bottom-up** approach uses a loop instead of recursion, so it has no stack depth limit, and here it needs only two numbers of memory.

## A useful example: edit distance

How many single-letter changes (insert, delete or replace) turn "kitten" into "sitting"? This **edit distance** powers spelling suggestions and the `diff` that shows what changed in a file.

The trick is to describe the answer in terms of smaller answers. The distance between the first *i* letters of one word and the first *j* letters of the other depends only on three smaller cases: one letter fewer from the first word, from the second, or from both. Fill a table with a row for each prefix of one word and a column for each prefix of the other, cell by cell, and the bottom-right cell is the answer. For "kitten" and "sitting" it is 3.

The table has (*m* + 1) × (*n* + 1) cells, so the work is O(*m* × *n*), instead of the exponential work of trying every sequence of changes.

## How to spot a dynamic programming problem

Look for two signs:

1. **Optimal substructure**: the best answer to the big problem is built from the best answers to smaller ones.
2. **Overlapping subproblems**: the same smaller problems come up many times.

Then write the rule that connects a problem to its smaller ones, decide the order to fill the answers, and check the base cases.

> **In practice.** You will meet this more often as "cache the result of an expensive function" than as a named algorithm. The idea is the same: never compute the same thing twice.

## Remember

- Dynamic programming solves each overlapping subproblem once and reuses the answer.
- Memoisation caches answers top-down. Tabulation fills a table bottom-up.
- It turns exponential work into polynomial work, as with Fibonacci and edit distance.
- Look for optimal substructure and overlapping subproblems.

::quiz
? Why is the plain recursive Fibonacci function so slow?
+ It computes the same smaller values again and again
- Recursion is always slow
- Adding large numbers is slow
! The calls overlap: smaller values are recomputed in many branches. Caching each answer removes the repeats.
? What is the edit distance between "cat" and "cut"?
- 0
+ 1
- 3
! Replace one letter, "a" with "u". One change.
::end
