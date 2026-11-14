---
minutes: 8
tech: []
refs:
  - sicp: Ch. 1, Section 1.2, “Procedures and the Processes They Generate”
  - clrs: Ch. 4, “Divide-and-Conquer”
---
A **recursive** function calls itself. It solves a problem by solving a smaller copy of the same problem, then using that answer. For data with branches, such as [trees and graphs](/lesson/trees-graphs), recursion is often the clearest way to write the code.

## The two parts

Every recursive function has:

1. A **base case**: an input small enough to answer directly, with no further call.
2. A **recursive case**: break the problem into a smaller one, call the function on it, and build the answer from the result.

Count the files in a folder and all its folders:

```python
def count_files(folder):
    total = 0
    for entry in folder.entries:
        if entry.is_file:
            total += 1                      # base case: a file counts as one
        else:
            total += count_files(entry)     # recursive case: a smaller folder
    return total
```

You do not need to know how deep the folders go. Each call handles one folder and trusts the call below it to handle the rest.

## How to think about it

Do not trace every call in your head. Instead, ask two questions:

- Is the base case correct?
- If the recursive call gives the right answer for the smaller problem, does this call build the right answer from it?

If both are yes, the function is correct for any size. This is the same reasoning as a proof by induction.

## The cost: the stack

Each call gets its own frame on the stack, as [Stack, heap and garbage](/lesson/memory) explained. A recursion 100,000 levels deep needs 100,000 frames, and the stack is small. Python stops at about 1,000 levels by default with a `RecursionError`. Other languages crash with a **stack overflow**.

So recursion fits best when the depth stays small: a tree that is balanced, folders that go a few dozen levels deep. For a long chain, such as walking a list of a million items, use a loop.

> **Pitfall.** A missing or wrong base case gives infinite recursion. The program does not hang for ever; it uses up the stack and crashes, often with a very long error.

## Divide and conquer

Many fast algorithms are recursive. **Merge sort**, from [Searching and sorting](/lesson/searching-sorting), splits a list in half, sorts each half by calling itself, and merges the results. The base case is a list of one item, which is already sorted. This pattern, split, solve each part, combine, is called **divide and conquer**.

## When the same work repeats

A naive recursive function can repeat the same work many times. The classic example is the Fibonacci numbers, where each is the sum of the two before it:

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

`fib(40)` makes hundreds of millions of calls, because `fib(38)` is computed again inside both `fib(40)` and `fib(39)`, and so on down. Remembering each answer the first time makes it instant. That idea is the subject of [Dynamic programming](/lesson/dynamic-programming).

::fig sw-fib | The calls that fib(n) makes, with and without a memo.

## Remember

- A recursive function has a base case and a recursive case on a smaller problem.
- Check the base case, and check that each step is right if the smaller call is right.
- Each call uses stack space. Deep recursion crashes. Use loops for long chains.
- Divide and conquer splits a problem, solves the parts, and combines them.

::quiz
? A recursive function has no base case and calls itself again with the same list each time. What happens?
- It returns 0
+ It calls itself until the stack runs out and the program crashes
- It loops for ever without using memory
! With no base case, every call makes another call. Each one adds a frame until the stack overflows.
? Which task suits recursion best?
+ Visiting every node of a balanced tree with a few levels
- Adding up a list of 10 million numbers
- Reading a file line by line
! Recursion matches branching data, and a shallow tree keeps the stack small. Long flat sequences suit loops.
::end
