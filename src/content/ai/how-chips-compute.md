---
minutes: 8
tech: []
refs:
  - hennessy: Ch. 1, “Fundamentals of Quantitative Design and Analysis”
  - csapp: Ch. 1, “A Tour of Computer Systems”, and Ch. 4, “Processor Architecture”
---
Every model, however clever, runs as arithmetic on a chip. Knowing what a chip actually does, and what it finds expensive, explains why AI is built the way it is: why matrix multiplication rules, why numbers are stored with few bits, and why memory matters more than raw speed.

## Transistors and logic

A chip is made of **transistors**: tiny switches that a voltage turns on or off. A modern chip has tens of billions of them, each only a few nanometres across.

Combine switches and you get **logic gates**: AND, OR, NOT. Combine gates and you get circuits that add two binary numbers, as in [Bits, bytes and encodings](/lesson/binary-data), multiply them, compare them, or store them.

## The clock

A **clock** ticks billions of times each second. On each tick, results move one step through the circuits. A 2 GHz chip ticks 2 billion times a second. Each tick, every part of the chip can do a small piece of work at the same time.

## Arithmetic units

The work happens in **arithmetic units**. Adding two numbers is cheap. Multiplying takes more transistors and more energy. Many chips have a combined unit for the most common operation in AI and graphics: **multiply-accumulate**, `a × b + c`, often called a **fused multiply-add** (FMA).

A [dot product](/lesson/dot-product) is a chain of these: multiply each pair, add to a running total. A matrix multiplication is many dot products. So a chip that can do huge numbers of multiply-adds per second is a chip that can run neural networks.

## Measuring speed: FLOPs

Computing speed for AI is measured in **FLOP/s**: floating-point operations per second. A multiply-add counts as two.

- A laptop CPU: on the order of a trillion (10¹²) FLOP/s.
- A modern data-centre GPU: on the order of a thousand trillion (10¹⁵) FLOP/s at low precision.

Training a large language model takes on the order of 10²⁴ or more operations in total. Even at 10¹⁵ per second, that is about 30 years on one chip, which is why training uses thousands of chips at once.

## CPU, GPU, and AI chips

- A **CPU** has a few powerful cores, each very good at complicated, branching work with many decisions.
- A **GPU** has thousands of simpler cores that all do the same operation on different data at once. Ideal for the regular arithmetic of matrices, as the lesson [Why GPUs](/lesson/gpus) explains.
- **AI accelerators**, such as Google's TPUs, go further: large grids of multiply-add units built only for matrix work.

## Energy

Every operation costs energy, and so does moving data. In modern chips, fetching a number from main memory costs much more energy than multiplying it. This fact shapes AI hardware and software, and returns in [Memory is the bottleneck](/lesson/memory-bandwidth).

## Remember

- Chips are billions of transistor switches forming gates and arithmetic circuits.
- A clock moves work forward billions of times a second, in parallel across the chip.
- Multiply-add is the core operation of AI; speed is measured in FLOP/s.
- CPUs handle complex work; GPUs and AI chips do massive amounts of simple arithmetic.

::quiz
? A dot product of two vectors with 1,000 components takes about how many multiply-add operations?
+ 1,000
- 1
- 1,000,000
! One multiply-add per pair of components.
? Why are GPUs, not CPUs, used to train large networks?
+ GPUs run thousands of the same simple operations at once, which matches matrix arithmetic
- CPUs cannot do floating-point arithmetic
- GPUs have faster clocks
! The work is huge and regular. Many simple cores beat a few complex ones for it.
::end
