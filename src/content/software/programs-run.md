---
minutes: 8
tech: []
refs:
  - csapp: Ch. 1, “A Tour of Computer Systems”, Section 1.2, and Ch. 7, “Linking”
  - sicp: Ch. 4, “Metalinguistic Abstraction”
---
You write code as text. The CPU only follows machine instructions. Something must turn one into the other. How a language does this decides how fast the program runs, when you see an error, and what you need to install to run it.

## Compiled languages

A **compiler** reads your whole program and translates it into machine code before the program runs. The result is an **executable** file that the operating system can start directly. C, C++, Rust and Go work like this.

- **Fast to run.** The translation is done once, and the compiler has time to optimise.
- **Errors early.** The compiler finds many mistakes, such as a misspelled name or a wrong type, before anything runs.
- **One build for each platform.** Machine code for an Intel laptop does not run on an ARM phone. You compile again for each kind of machine.

## Interpreted languages

An **interpreter** reads the program and does what it says, while it runs. You do not build a separate file first. Python, Ruby and the shell work like this.

- **Quick to start working.** Change a line and run again.
- **Slower to run.** The interpreter does extra work for every step.
- **Errors late.** A mistake in a part of the code that has not run yet is not found yet.

> **For experienced readers.** Most "interpreted" languages first compile to **bytecode**: simple instructions for a virtual machine, not for the real CPU. CPython does this and stores the result in `.pyc` files. The interpreter then runs the bytecode.

## Just-in-time compilation

Java, C# and JavaScript use a mix. The code is compiled to bytecode, and a **virtual machine** runs it. While the program runs, the virtual machine watches which parts run most often and compiles those parts to machine code. This is **just-in-time (JIT) compilation**.

A JIT can make code almost as fast as compiled code, because it optimises with knowledge of how the program really behaves. The cost is a slower start and more memory.

## The runtime

Your program does not run alone. A **runtime** comes with it: code that the language provides to manage memory, start threads, handle errors and talk to the operating system. A **standard library** gives ready-made code for common tasks such as text, files, dates and network requests.

This is why a Python script needs Python installed, and a Java program needs a Java runtime, while a compiled Go program usually runs on its own.

## Linking

A program uses code from many places: your files, the standard library, other packages. The **linker** joins them. It connects each call to the function that it names. **Static linking** copies the code into the executable. **Dynamic linking** finds shared libraries when the program starts, so many programs can share one copy, and a security fix to the library helps all of them.

## Remember

- A compiler translates the whole program before it runs. An interpreter does it while it runs.
- Many languages compile to bytecode for a virtual machine, and a JIT compiles hot parts while they run.
- The runtime and the standard library come with your program.
- The linker joins your code with the libraries it uses.

::quiz
? A Python program has a misspelled variable name in a function that only runs on the first day of each month. When do you find the error?
- When you install Python
+ When that function first runs, on the first day of the month
- When you save the file
! An interpreter only finds many errors when it reaches that code. Tests that run every function find such errors earlier.
? Why can a Go program often be copied to a server and run, with nothing else installed?
+ The compiler produced machine code with the runtime and libraries inside one executable
- Go programs run in the browser
- The server has a Go interpreter by default
! Go compiles to one statically linked executable by default, so it needs no separate runtime.
::end
