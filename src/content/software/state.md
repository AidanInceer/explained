---
minutes: 8
tech: []
refs:
  - sicp: Ch. 3, Section 3.1, “Assignment and Local State”
  - aposd: Ch. 2, “The Nature of Complexity”
---
A **state** is what a program remembers between one step and the next: the items in a basket, whether the user is signed in, how many retries are left. Programs need state. State is also where most bugs hide, because to understand a line of code you must know every way the values could have changed before it.

## A value that changes

Up to now, a variable could simply be read as a name for a value. With change, it becomes a box whose contents depend on *when* you look:

```python
basket = []
basket.append("tea")
basket.append("milk")
print(len(basket))   # 2
```

To know what `len(basket)` gives, you must know everything that happened to `basket` before. In a short script that is easy. In a large program, a value may change in a hundred places, in an order that depends on what the user did.

## Shared state

The real difficulty comes when two parts of a program refer to the same changing value.

```python
defaults = {"currency": "GBP"}
order_a = defaults
order_b = defaults
order_a["currency"] = "EUR"
print(order_b["currency"])   # "EUR"
```

`order_a` and `order_b` are not copies. They are two names for one dictionary, so a change through one name shows through the other. This is called **aliasing**, and it surprises everyone at least once.

> **Pitfall.** In Python, a default argument like `def add(item, items=[])` is created once, when the function is defined. Every call that uses the default shares the same list, so items from earlier calls appear in later ones. Use `items=None` and create a new list inside.

## Why state makes code hard

- **Order matters.** The same lines in a different order give a different result.
- **Effects travel.** A change in one place breaks a part of the program that seems unrelated.
- **Tests need set-up.** To test a function that reads state, you must first build that state.
- **Concurrency.** As [Concurrency](/lesson/concurrency) showed, two threads that change the same state can corrupt it.

## Keep state small and in few places

You cannot remove state. A shop must remember the basket. But you can control it:

1. **Keep it in one place.** One object owns the basket. Other code asks it to change, and does not change it directly.
2. **Make most values unchangeable.** Compute a new value instead of changing an old one. Many values never need to change after they are created.
3. **Make changes explicit.** A function that returns a new value is easier to follow than one that quietly changes its argument.
4. **Store durable state in a database**, with clear rules, rather than in many variables across a running program.

The next two lessons give the two common ways to do this: [Objects and modules](/lesson/objects-modules), which keep state together with the code that may change it, and [Functional ideas](/lesson/functional), which avoid change where they can.

## Remember

- State is what a program remembers between steps. It depends on everything that happened before.
- Two names can refer to the same changing value.
- State makes order matter, makes tests harder, and causes concurrency bugs.
- Keep state in few places, change it in clear ways, and prefer values that do not change.

::quiz
? After `a = [1, 2]`, `b = a`, `b.append(3)`, what is `a`?
- `[1, 2]`
+ `[1, 2, 3]`
- An error
! `b = a` does not copy the list. Both names refer to the same list, so the change shows through `a`.
? Which change most reduces bugs caused by state?
+ Let one part of the program own each piece of state, and let others ask it to change
- Make every variable global, so every part can see it
- Copy the state into every function
! When one owner controls changes, there are few places to look when a value is wrong.
::end
