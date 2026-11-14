---
minutes: 8
tech: []
refs:
  - csapp: Ch. 1, “A Tour of Computer Systems”
  - ostep: Ch. 2, “Introduction to Operating Systems”
---
Every program, from a phone app to a web server, runs on the same few parts: a processor that follows instructions, memory that holds what the processor works on, storage that keeps data when the power is off, and connections between them. When you know what each part is good at, many design choices start to make sense.

## The processor follows instructions

The **CPU** (central processing unit) does the work. It reads one **instruction** at a time from memory, does what the instruction says, and moves to the next one. An instruction is very small: "add these two numbers", "copy this value from memory", "if this value is zero, jump to that instruction".

A modern CPU does this billions of times each second. Its speed is given as a **clock rate**, for example 3 GHz: three billion steps each second. Most CPUs also have several **cores**. Each core follows its own stream of instructions, so a CPU with 8 cores can work on 8 things at the same time.

Everything that a program does, it does by these small steps. A sort, a web request and a video frame all become millions of simple instructions.

> **For new readers.** You do not write these instructions yourself. A compiler or an interpreter turns your code into them. The lesson “What happens when code runs”, later on this line, covers this step.

## Memory holds the work in progress

The CPU can only work on data that is close to it. **Memory**, also called RAM (random access memory), holds the program that runs and the data that it uses now: the list being sorted, the request being answered.

Memory is fast, but it has two limits:

1. **It is volatile.** When the power goes off, its contents are lost.
2. **It is small and costly** compared with storage. A laptop may have 16 GB of memory and 1 TB of storage.

So a program loads what it needs into memory, works on it, and writes results that must last to storage.

## Storage keeps data when the power is off

**Storage** is an SSD (solid-state drive) or a hard disk. It keeps files, databases and the programs themselves, even with no power. It is much larger and cheaper than memory for each gigabyte, and much slower to reach.

This is why "save" is a separate action, and why a database takes care to write to storage before it says that a change is done.

## Speed differs by thousands of times

The parts are not a little faster or slower than each other. They differ by orders of magnitude. These are rough times to read a small piece of data:

| Where the data is | Rough time to read it | Compared with a cache read |
|---|---|---|
| CPU cache (a small memory inside the CPU) | About 1 nanosecond | 1 |
| Main memory | About 100 nanoseconds | 100 times slower |
| SSD | About 100 microseconds | 100,000 times slower |
| Another computer in the same data centre | About 0.5 milliseconds | 500,000 times slower |
| A computer on another continent | About 150 milliseconds | 150 million times slower |

The CPU keeps small, fast **caches** of recently used memory, because a read from main memory makes it wait for about a hundred of its steps. The same idea repeats at every level: keep the data that you use often close to the place where you use it.

> **Rule of thumb.** When code is slow, the cause is usually waiting for data, not doing arithmetic. Ask first: how many times does it go to storage or to the network?

## Connections join the parts

The parts talk over connections: the CPU to memory, memory to storage, the computer to the network card. The **operating system** controls these. It decides which program runs on which core, gives each program its own memory, and reads and writes storage and the network for programs that ask. The next lessons on this line, “Operating systems” and “Networks and the internet”, go into each one.

## Remember

- The CPU follows small instructions, billions of times each second, on several cores.
- Memory is fast and is lost when the power goes off. Storage is slow and lasts.
- Each step away from the CPU is many times slower. Keep often-used data close.

::quiz
? A program reads the same 1 MB of settings on every request, from a file on an SSD. What is the simplest way to make it faster?
- Buy a CPU with a higher clock rate
+ Read the file once and keep the settings in memory
- Add more CPU cores
! A read from memory is about a thousand times faster than a read from an SSD. The CPU spends most of the time waiting for the file, not working on it.
? Why does a database write a change to storage before it tells the application that the change is done?
- Storage is faster than memory
+ Memory is lost when the power goes off, so the change would not last
- The CPU can only read from storage
! Only storage keeps data without power. A change that exists only in memory is lost in a crash.
::end
