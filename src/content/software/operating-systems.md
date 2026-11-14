---
minutes: 8
tech: []
refs:
  - ostep: 'Ch. 2, “Introduction to Operating Systems”, and Ch. 4, “The Abstraction: The Process”'
  - csapp: Ch. 8, “Exceptional Control Flow”
---
Many programs run on one computer at the same time, and all of them want the CPU, memory, files and the network. The **operating system** (OS), such as Linux, Windows, macOS, Android or iOS, shares these out and stops programs from harming each other. Almost every program you write asks the OS for help, many times each second.

## Three jobs

The OS has three main jobs.

1. **Share the hardware.** It decides which program runs on which CPU core, and for how long. It gives each program its part of memory.
2. **Give simple building blocks.** Programs do not drive a disk or a network card directly. They ask the OS to "open a file" or "send these bytes", and the OS does the hard part.
3. **Protect.** One program cannot read another program's memory, or a file that its user may not read.

The core of the OS, which does these jobs, is the **kernel**.

## Processes

A **process** is a program that runs. When you start a program, the OS creates a process: it loads the code into memory, gives the process its own memory space, and adds it to the list of work.

Each process sees memory as if it were alone on the machine. This is **virtual memory**: the OS and the hardware translate each process's addresses to real places in memory. Two processes can use the same address and never touch each other's data. A crash in one process does not damage the others.

> **For new readers.** Open the task manager (Windows) or Activity Monitor (macOS). Each line is a process. A browser often runs many, so that one bad tab cannot take down the rest.

## Who gets the CPU next

A computer may have 8 cores and 300 processes. Most processes wait most of the time: for a key press, a file, a network reply. The OS **scheduler** chooses which ready process runs on each core.

It gives each process a short **time slice**, a few milliseconds, then switches to another. This switching happens so often that every program seems to run all the time. A process that waits for the disk or the network gives up the CPU, so others can use it.

## System calls

A program asks the OS for help with a **system call**: open a file, read from it, send data on the network, start another process. During a system call the CPU switches into a protected mode where the kernel may do anything, does the work, and switches back.

This border is the reason for the protection. A normal program cannot touch the hardware or another process. It can only ask, and the kernel checks each request.

## Files

The OS also gives **files**: named sequences of bytes in **directories** (folders). The file system decides where the bytes go on the SSD or disk, keeps track of free space, and records who may read and write each file. A program only says "open `report.txt`" and reads bytes.

## Remember

- The OS shares the hardware, gives simple building blocks, and protects programs from each other.
- A process is a running program with its own memory.
- The scheduler gives each ready process short turns on the CPU.
- Programs ask the kernel for help with system calls.

::quiz
? Two processes both store a value at memory address 1000. What happens?
- The second process overwrites the first one's value
- The OS stops the second process
+ Nothing goes wrong: each process has its own virtual memory, so address 1000 means a different real place for each
! Virtual memory gives each process its own address space. The OS maps each one to different real memory.
? A program needs to read a file. What does it do?
- It reads the bytes from the SSD directly
+ It makes a system call, and the kernel reads the file for it
- It asks the CPU scheduler
! Programs cannot touch hardware. They ask the kernel with system calls, and the kernel checks and does the work.
::end
