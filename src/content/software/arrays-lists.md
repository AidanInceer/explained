---
minutes: 8
tech: []
refs:
  - clrs: Ch. 10, “Elementary Data Structures”
  - csapp: Ch. 6, “The Memory Hierarchy”, on locality
---
A **data structure** is a way to arrange values in memory. The arrangement decides which operations are fast and which are slow. The simplest arrangement is a row of values, one after the other. It comes in two main forms, arrays and linked lists, with very different costs.

## Arrays

An **array** stores its items next to each other in one block of memory. If each item takes 8 bytes and the array starts at address 1000, item 0 is at 1000, item 1 at 1008, item *i* at 1000 + 8 × *i*.

That one sum is the array's great strength. To read item 5,000,000, the computer does one multiplication and one read. It does not look at the items before it. This is **random access**, and it takes the same time for any position.

Arrays are also friendly to the CPU cache. As [How computers work](/lesson/how-computers-work) showed, reading from memory is slow, so the CPU fetches a whole block at a time. When items sit side by side, one fetch brings in the next several items too. Looping through an array is very fast.

## The cost of inserting

The same layout makes some changes slow. To insert an item at the front of an array of a million items, every item must move one place to the right: a million moves. Deleting from the front is the same.

Adding at the end is cheap, as long as there is room. A **dynamic array**, such as Python's `list`, Java's `ArrayList` or a JavaScript array, keeps spare room at the end. When the room runs out, it takes a block about twice as large and copies everything over. That copy is slow, but it happens rarely, so on average adding at the end stays fast.

## Linked lists

A **linked list** stores each item in its own small block, called a **node**, together with the address of the next node. The nodes can be anywhere in memory.

- **Insert or delete is cheap** once you are at the right place: change two addresses, move nothing.
- **Reading item *i* is slow**: you must start at the first node and follow *i* links.
- **Loops are slower** in practice, because each node is somewhere else in memory, and each step may wait for a fetch.

## Costs side by side

| Operation | Array | Linked list |
|---|---|---|
| Read item *i* | Fast, the same for any *i* | Slow, follow *i* links |
| Add at the end | Fast on average | Fast, if it keeps a pointer to the end |
| Insert at the front | Slow, move everything | Fast |
| Find a value | Look at each item | Look at each item |
| Loop through all items | Very fast | Slower: items are scattered |

> **Rule of thumb.** Use the dynamic array that your language gives you, unless you have measured a reason not to. Its cache-friendly layout usually beats a linked list, even for some operations that a linked list does better on paper.

## Queues and stacks

Two common uses of a row of items have their own names:

- A **stack**: add and remove at the same end. Last in, first out. Undo history works like this.
- A **queue**: add at one end, remove at the other. First in, first out. Jobs waiting to run work like this.

Both are easy to build on a dynamic array or a linked list. Python's `collections.deque` gives a queue that is fast at both ends.

## Remember

- An array keeps items side by side, so any item can be read at once, and loops are fast.
- Inserting or deleting near the front of an array moves many items.
- A linked list inserts cheaply but must follow links to reach an item.
- Choose the structure for the operations that your program does most.

::quiz
? A program reads item number 750,000 of a large array. How many items does it look at first?
+ None: it computes the address directly
- 749,999
- About half of them
! An array's items are evenly spaced, so the address of any item is the start plus its position times the item size.
? A program adds new jobs at the front of a Python list of 2 million items, many times each second. Why is it slow?
- Python lists cannot hold 2 million items
+ Each insert at the front moves every item one place
- Lists are linked lists in Python
! A list is an array. Use a deque, or add at the end, to avoid moving every item.
::end
