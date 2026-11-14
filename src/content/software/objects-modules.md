---
minutes: 9
tech: []
refs:
  - aposd: Ch. 4, “Modules Should Be Deep”, and Ch. 5, “Information Hiding (and Leakage)”
  - sicp: Ch. 2, Section 2.1, “Introduction to Data Abstraction”
---
As a program grows, you need a way to divide it into parts that you can understand one at a time. Two tools do this: **objects** keep data together with the code that works on it, and **modules** group related code into files with a clear boundary.

## Objects bundle data and behaviour

An **object** holds some data and the functions, called **methods**, that may read and change it. A **class** is the template that objects are made from:

```python
class Basket:
    def __init__(self):
        self._items = []

    def add(self, item, quantity=1):
        if quantity < 1:
            raise ValueError("quantity must be at least 1")
        self._items.append((item, quantity))

    def count(self):
        return sum(q for _, q in self._items)
```

Each `Basket()` is a separate object with its own items. Other code calls `add` and `count`, and never touches `_items` directly. (In Python the leading `_` is a convention that means "private: do not use from outside".)

## Why bundle them

This answers the problem from [State and change](/lesson/state). The basket's state has one owner. Every change goes through `add`, so the rule "quantity must be at least 1" is checked in one place, and can never be skipped. If the basket later needs to store items in a different way, only the class changes. Code that uses it does not notice.

This is **encapsulation**, or **information hiding**: callers depend on what an object does, not on how it does it.

## Inheritance, with care

A class can **inherit** from another and reuse its code: a `GiftBasket` that is a `Basket` with a message. This is useful in small doses. Deep chains of inheritance are hard to follow, because the behaviour of one class is spread over many files. Most experienced engineers prefer **composition**: a gift basket that *has* a basket and a message, rather than one that *is* a basket.

## Modules

A **module** is a unit of code with a public interface and a hidden inside. In Python, every file is a module. In Java and Go, a package plays this role. A module might hold everything about payments: classes, functions and constants.

The main question when you design a module is what to make public. Everything public is a promise: other code will depend on it, and you cannot change it freely.

> **Rule of thumb.** A good module is **deep**: a small, simple interface that hides a lot of work. A module whose interface is as complex as its insides gives callers nothing.

## Coupling and cohesion in one sentence

Put things that change together in the same module (**cohesion**), and keep modules from depending on each other's insides (**low coupling**). The lesson on coupling and cohesion, on the Design and architecture line, goes into this.

## Remember

- An object keeps data with the methods that may change it. A class is its template.
- Encapsulation: callers use what an object does, and cannot reach how it does it.
- Prefer composition to deep inheritance.
- A module has a public interface and a hidden inside. Keep the interface small and deep.

::quiz
? Why do the `Basket` class's callers call `add` instead of appending to `_items` directly?
+ So that the quantity rule is always checked, and the storage can change without breaking them
- Because lists cannot be changed from outside a class
- It is faster
! Going through the method keeps the rule in one place and hides how items are stored.
? A module exposes 40 functions, and each one only renames a database call. What is the problem?
- It has too few functions
+ It is shallow: callers must learn a large interface that hides almost nothing
- Modules may not call databases
! A good module hides complexity behind a small interface. This one adds an interface and hides no work.
::end
