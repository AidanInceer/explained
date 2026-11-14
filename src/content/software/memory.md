---
minutes: 9
tech: []
refs:
  - csapp: Ch. 3, Section 3.7, “Procedures”, and Ch. 9, Sections 9.9 to 9.11, on dynamic memory, garbage collection and common memory bugs
  - ostep: 'Ch. 14, “Interlude: Memory API”'
---
Each value that a program uses lives somewhere in memory, for some time. Where it lives decides how fast it is to create, and who must free the memory when the value is no longer needed. Languages answer this in different ways, and the answer explains many of their differences.

## The stack

When a function is called, it gets a **stack frame**: a small block of memory for its local variables and for the place to return to. When the function returns, its frame is removed. A function that calls another adds a frame on top, so frames pile up like plates. That pile is the **stack**.

The stack is fast and simple. Creating a frame moves one pointer by the size of the frame. Freeing it moves the pointer back. Nobody has to remember to clean up.

But the stack has limits. A value in a frame disappears when the function returns. And the stack is small, often a few megabytes, so a function that calls itself too deeply causes a **stack overflow**.

## The heap

Some values must outlive the function that creates them: a list that a function builds and returns, an object that many parts of the program share. These go on the **heap**, a large area of memory where blocks can be taken and given back in any order.

The heap is flexible and slower. Finding a free block takes work. And someone must decide when a block is no longer needed.

## Manual memory management

In C, the programmer asks for heap memory with `malloc` and gives it back with `free`. This is fast and gives full control. It also causes some of the worst bugs:

- **Memory leak.** The program forgets to free a block. Memory use grows until the program is restarted.
- **Use after free.** The program frees a block and then uses it again. It reads data that now belongs to something else.
- **Double free.** The program frees the same block twice and damages the heap's records.

Attackers use the last two to take control of programs. A large share of serious security bugs in browsers and operating systems have been memory errors of this kind.

## Garbage collection

Java, Python, JavaScript, Go and C# free heap memory automatically with a **garbage collector**. It finds blocks that the program can no longer reach, and frees them.

- **Tracing** collectors start from the values the program can see directly, follow every reference, and free everything they did not reach.
- **Reference counting**, which CPython uses, keeps a count of references to each object and frees it when the count reaches zero. It needs extra help for objects that refer to each other in a loop.

The programmer no longer frees memory, and the bugs above mostly disappear. The costs are extra memory, extra CPU work, and short pauses while the collector runs.

> **Pitfall.** A garbage collector cannot free what you still refer to. A cache that only grows, or a list of listeners that is never cleared, is a memory leak in any language.

## Ownership

Rust takes a third way. Each value has one **owner**, a variable. When the owner goes out of scope, the value is freed. The compiler checks the rules for borrowing a value, and refuses programs that could use memory after it is freed. You get the speed of manual management with no garbage collector, and you pay with stricter rules to learn.

## Remember

- The stack holds each call's local values. It is fast and is freed on return.
- The heap holds values that outlive a call. Someone must free them.
- Manual freeing is fast and error-prone. Garbage collection is safe and costs memory and pauses.
- Rust's ownership rules let the compiler check memory safety.

::quiz
? A function builds a list and returns it to its caller. Where must the list live?
- On the stack, in the function's frame
+ On the heap, because it must outlive the function's frame
- In the CPU cache
! The function's frame is removed when it returns. A value that the caller still uses must be on the heap.
? A Java service's memory use grows for days until it is restarted. The garbage collector runs. What is a likely cause?
- The garbage collector is turned off
+ The program keeps references it no longer needs, for example in a cache that only grows
- Java cannot free memory
! A collector only frees objects that nothing refers to. Objects held in a growing collection are never freed.
::end
