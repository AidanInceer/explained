---
minutes: 7
tech: []
refs:
  - sicp: Ch. 1, Section 1.1.6, “Conditional Expressions and Predicates”, and Section 1.2, “Procedures and the Processes They Generate”
  - pragprog: 'Topic 9, “DRY: The Evils of Duplication”'
---
A program runs from top to bottom, one statement after the other. Two tools change that order: a **choice**, which runs some code only when a condition is true, and a **loop**, which runs some code many times. With values, choices and loops, you can write any program.

## Choices

An `if` statement runs a block only when its condition is true:

```python
if balance < 0:
    send_warning(customer)
```

`else` gives the other path, and `elif` (else if) adds more:

```python
if score >= 70:
    grade = "pass with merit"
elif score >= 40:
    grade = "pass"
else:
    grade = "fail"
```

The conditions are checked in order, and only the first true one runs. That is why the higher limit comes first. Swap the first two and nobody gets a merit.

A condition is any expression that gives a Boolean, true or false. You can combine conditions with `and`, `or` and `not`.

> **Rule of thumb.** Deeply nested `if` statements are hard to read. Handle the special cases first and leave early (return, or skip to the next item). Then the main path runs at the left margin.

## Loops over a collection

The most common loop does something for each item in a collection:

```python
total = 0
for price in prices:
    total = total + price
```

The loop runs once for each item, with `price` set to that item. When the items run out, the loop ends.

## Loops that run until a condition changes

A `while` loop repeats as long as its condition is true:

```python
attempts = 0
while not connected and attempts < 5:
    connected = try_to_connect()
    attempts = attempts + 1
```

Here the loop also stops after five attempts. A `while` loop whose condition never becomes false is an **infinite loop**: the program appears to freeze. Always ask what makes the condition change.

## Off-by-one errors

Loops that count are a classic place for mistakes. Positions in most languages start at 0, so a list of 10 items has positions 0 to 9. A loop that runs to position 10 reads past the end. A loop that stops at 8 misses the last item. These **off-by-one errors** are so common that they have their own name.

Looping over the items themselves, as in the `for price in prices` example, avoids counting and avoids this bug.

## Remember

- `if`, `elif` and `else` choose a path. Conditions are checked in order.
- `for` runs code for each item. `while` repeats until a condition becomes false.
- Make sure each loop has a way to end.
- Loop over items, not positions, where you can.

::quiz
? A loop must check each of 5 servers. It counts positions from 1 to 5 in a language where positions start at 0. What happens?
- It checks all 5
+ It skips the first server and fails on a position past the end
- It checks the first server twice
! Positions are 0 to 4. Starting at 1 misses the first, and position 5 does not exist.
? What is wrong with this order: `if score >= 40: pass` then `elif score >= 70: merit`?
+ A score of 80 matches the first condition, so nobody ever reaches merit
- Nothing: conditions are checked all at once
- `elif` cannot use `>=`
! Only the first true condition runs. Put the stricter condition first.
::end
