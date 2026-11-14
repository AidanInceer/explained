---
minutes: 8
tech: []
refs:
  - sicp: Ch. 1, Section 1.1.4, “Compound Procedures”, and Section 1.1.8, “Procedures as Black-Box Abstractions”
  - aposd: Ch. 4, “Modules Should Be Deep”
  - pragprog: 'Topic 9, “DRY: The Evils of Duplication”'
---
A **function** gives a name to a piece of work, so you can use it again without writing it again. Functions are the first and most important tool to keep a program understandable as it grows.

## Define once, call many times

```python
def add_vat(price, rate=0.2):
    return price * (1 + rate)
```

`add_vat` is the name. `price` and `rate` are **parameters**: names for the inputs. `rate` has a **default value**, used when the caller gives none. `return` gives the result back.

You **call** the function with **arguments**, the actual values:

```python
add_vat(100)         # 120.0
add_vat(100, 0.05)   # 105.0
```

Now the rule for VAT lives in one place. When the rate rules change, you change one function, not fifty copies spread through the code.

## A function is a promise

A good function can be used without reading its body. Its name, its inputs and its output say what it does. This is an **abstraction**: you think about *what* it does and forget *how*.

You already use thousands of functions this way: `len`, `sort`, `print`. You do not know how they work inside, and you do not need to.

So the most important part of a function is not its code. It is its **interface**: the name, the parameters, the result, and what happens when something goes wrong. A function called `get_user` that also deletes old sessions breaks its promise, and it will surprise someone.

## Scope

Variables created inside a function exist only inside it. This is **local scope**:

```python
def area(width, height):
    result = width * height
    return result
```

`result` is gone when the function returns. Another function can use the name `result` for something else, and the two never collide. This is what lets large programs be built by many people.

## Good functions

- **One job.** If you need "and" to describe it, it may be two functions.
- **Clear name.** A verb for actions (`send_invoice`), a noun phrase for values (`total_price`).
- **Few parameters.** Five or more is a sign that the function does too much.
- **Deep, not shallow.** A good function hides a lot of work behind a small interface. A function that only renames another one adds a name to learn and no help.

> **For experienced readers.** "Short functions" is not the goal. A long function with one clear job and a simple interface is easier to use than ten tiny functions that must be called in the right order.

## Functions are values

In most modern languages a function is a value. You can pass it to another function:

```python
sorted(users, key=last_login)
```

Here `sorted` calls `last_login` on each user to decide the order. This idea returns in the lesson [Functional ideas](/lesson/functional).

## Remember

- A function names a piece of work. Parameters are inputs, `return` gives the output.
- Callers use the interface, not the body. Keep the promise that the name makes.
- Local variables exist only inside the function.
- Give each function one job and a small, clear interface.

::quiz
? The same tax calculation is copied into 12 places, and the tax rate changes. What is the main problem?
+ All 12 copies must be found and changed, and missing one gives wrong results
- The program runs more slowly
- Copies use more memory
! Duplicated logic changes in many places at once. A single function keeps the rule in one place.
? A function `calculate_total(order)` also sends an email. Why is this a problem?
- Functions cannot send emails
+ The name promises a calculation, so callers do not expect an email, and may send it twice
- It makes the function too short
! A function's interface is a promise. A hidden side effect surprises the people who call it.
::end
