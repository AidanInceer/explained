---
minutes: 8
tech: []
refs:
  - aposd: Ch. 4, “Modules Should Be Deep”, Ch. 5, “Information Hiding (and Leakage)”, and Ch. 7, “Different Layer, Different Abstraction”
---
Software design is mostly about one thing: managing complexity, so that people can understand and change a system as it grows. The main tool is to divide the system into **modules**, each with an **interface** that hides its insides. Done well, you can work on one module while knowing almost nothing about the others.

## Interface and implementation

Every module has two parts:

- The **interface**: what callers must know to use it. Function names, parameters, return values, errors, and rules such as "call `open` before `read`".
- The **implementation**: everything inside that callers do not need to know.

The interface is a cost to every caller. The implementation is a cost only to whoever works on the module. So a design is good when interfaces are simple and implementations do a lot.

## Deep modules

Picture each module as a rectangle. The top edge is the interface: how much a caller must learn. The area is the functionality: how much it does for them.

- A **deep** module has a short top edge and a large area. A file system's `open`, `read`, `write`, `close` hide disks, caches, permissions and layout. Few calls, enormous work.
- A **shallow** module has a long top edge and a small area. A class whose methods each pass through to another class adds things to learn and saves no work.

Prefer deep modules. A module with ten methods that does a little is often worse than one method that does a lot.

## Hide decisions

Each module should hide **design decisions** that might change: the format of a file, the database you use, the way a value is calculated. If the decision is hidden, changing it changes one module. If it leaks, so that callers depend on the file format or the table names, a change touches every caller.

> **Pitfall.** **Information leakage**: two modules both know the same detail, such as a message format, so they must change together. Often the fix is to merge them, or to move the detail into one module that the other calls.

## General-purpose, a little

An interface designed around today's one caller tends to be shallow and awkward. One that is **somewhat general**, solving the problem the caller has rather than the exact steps it takes, is usually simpler. For example, a text editor's buffer with `insert(position, text)` and `delete(start, end)` is simpler and more useful than one with `deleteSelectedTextUnderCursorAfterBackspace()`.

## Layers

Large systems stack modules in layers: the screen, the business rules, the storage. Each layer should offer a **different abstraction** from the one below. A layer that simply passes calls through, with the same names and parameters, adds code and no value.

## Remember

- Design is about managing complexity. Divide the system into modules with interfaces.
- Keep interfaces simple and make implementations do a lot: deep modules.
- Hide decisions that may change. Watch for details leaking into many modules.
- Each layer should offer a different abstraction from the one below.

::quiz
? A class has 25 methods, and each one calls one method of another class with the same arguments. What is the problem?
+ It is shallow: a large interface that hides almost nothing
- It has too few methods
- It is too deep
! Pass-through methods add to what callers must learn without doing work for them.
? Three services all parse the same custom file format. The format changes. What does this show?
+ Information leakage: one design decision is spread over three modules
- Good reuse
- Nothing, file formats rarely change
! The format should be hidden in one module, so a change touches one place.
::end
