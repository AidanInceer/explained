---
minutes: 9
tech: []
refs:
  - clrs: Ch. 2, “Getting Started”, and Ch. 3, “Characterizing Running Times”
---
A program that is fast on 100 items can be unusable on a million. The question that matters is not "how fast is it now?" but "how does the work grow as the input grows?". **Big O notation** is the short way to answer that question.

## Count steps, not seconds

Seconds depend on the computer, the language and the day. Instead, count the basic steps that an algorithm takes for an input of size *n*, and see how that count grows.

Take a function that checks whether a list contains a value by looking at each item. In the worst case it looks at all *n* items. Double the list, double the work. We write this as **O(*n*)**, read "order *n*" or "linear".

Big O keeps only the part that grows fastest and drops constant factors. An algorithm that takes 3*n* + 20 steps is O(*n*): for large *n*, the 20 does not matter, and the 3 depends on details that differ between computers anyway.

## The common classes

| Big O | Name | Example | From 1,000 items to 1,000,000, work grows |
|---|---|---|---|
| O(1) | Constant | Read an array item by position | Not at all |
| O(log *n*) | Logarithmic | Binary search in a sorted list | From about 10 steps to about 20 |
| O(*n*) | Linear | Look at every item once | 1,000 times |
| O(*n* log *n*) | "n log n" | A good sort | About 2,000 times |
| O(*n*²) | Quadratic | Compare every item with every other | 1,000,000 times |
| O(2ⁿ) | Exponential | Try every subset | Beyond any computer |

The gaps are huge. With a million items, an O(*n* log *n*) sort does about 20 million steps. An O(*n*²) sort does a trillion.

## Spot quadratic code

The most common performance bug in real code is an accidental O(*n*²): a loop inside a loop over the same data.

```python
# For each order, find its customer
for order in orders:                  # n times
    for customer in customers:        # n times
        if customer.id == order.customer_id:
            order.customer = customer
```

With 10,000 orders and 10,000 customers, that is 100 million comparisons. Build a dictionary of customers by id once, and each lookup becomes O(1): the whole job becomes O(*n*). The next lesson, [Hash maps](/lesson/hash-maps), explains why.

> **Pitfall.** A loop that calls `list.index`, `in` on a list, or a database query on each pass is a loop inside a loop, even if you only see one `for`.

## Space

Big O also describes memory. An algorithm that makes a copy of its input uses O(*n*) extra space. One that keeps a few counters uses O(1). Sometimes you trade one for the other: the dictionary above uses O(*n*) memory to save time.

## What Big O does not say

- **Constants matter for small *n*.** An O(*n*²) method can beat an O(*n* log *n*) one on 20 items.
- **Real costs differ.** A step that reads from the network costs a million times more than a step in the CPU cache.
- **Worst case is not every case.** Some algorithms are slow only on rare inputs.

So use Big O to choose the right shape of solution, then measure on real data.

## Remember

- Big O says how work grows with the input size, ignoring constant factors.
- O(1), O(log *n*), O(*n*), O(*n* log *n*) scale well. O(*n*²) and worse do not.
- A loop inside a loop over the same data is the usual cause of slow code.
- Choose the shape with Big O, then measure.

::quiz
? An algorithm takes 1 second for 1,000 items and is O(*n*²). About how long for 10,000 items?
- 10 seconds
+ 100 seconds
- 1,000 seconds
! The input is 10 times larger, and the work grows with the square: 10² = 100 times longer.
? Which change turns the order-and-customer matching from O(*n*²) into O(*n*)?
- Sort the orders first
+ Build a dictionary of customers by id once, then look up each order's customer in it
- Use a faster CPU
! The dictionary makes each lookup constant time, so the whole job is one pass over the orders.
::end
