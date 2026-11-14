---
minutes: 8
tech: []
refs:
  - pmpp: Ch. 1, “Introduction”, Ch. 2, “Heterogeneous Data Parallel Computing”, and Ch. 4, “Compute Architecture and Scheduling”
  - alexnet: Section 3.2, “Training on Multiple GPUs”
---
GPUs were built to draw video games: millions of pixels, each computed by the same small program, sixty times a second. That turns out to be exactly the shape of neural network arithmetic. Since a GPU-trained network won the ImageNet contest by a wide margin in 2012, GPUs have powered almost all of modern AI.

## Few strong cores or many simple ones

A **CPU** has a handful of cores, often 8 to 64. Each is complex and fast at one task at a time: it predicts branches, reorders instructions, and has large caches. Good for programs full of decisions.

A **GPU** has thousands of simpler cores, grouped so that many of them run the **same instruction** on different data at the same moment. Each one is slower alone, but together they do far more arithmetic per second. This model is called **SIMT**: single instruction, multiple threads.

## Why it fits neural networks

A [matrix multiplication](/lesson/matrix-multiply) of two 4,096 × 4,096 matrices is about 69 billion multiply-adds, and every output entry can be computed independently of the others. There are no decisions in between, just the same operation on different numbers. A GPU gives each thread a piece and computes them all at once.

The same holds across a batch: every example in a batch goes through the same layer, so the work is spread across the GPU's cores.

## Tensor cores

Recent GPUs add special units, **tensor cores**, that multiply small matrix tiles, such as 4 × 4, in one step, in low precision formats from [Numbers in hardware](/lesson/numbers-in-hardware). They give most of a modern GPU's AI speed. To use them, the work must be shaped as matrix multiplications with suitable sizes and precisions, which deep learning libraries arrange for you.

## Programming them

You rarely write GPU code directly. PyTorch, JAX and similar libraries call highly tuned **kernels**, small GPU programs for each operation, written in CUDA or Triton. You move a tensor to the GPU with one line, and every operation on it runs there.

The one thing you must think about: moving data between the CPU's memory and the GPU's memory is slow. Keep data on the GPU, and move it as rarely as you can.

## Other accelerators

- **TPUs** (Google) are built around large grids of multiply-add units for matrix work.
- Several companies make chips built only for AI training or inference.
- Phones and laptops include small **neural processing units** (NPUs) for running models locally at low power.

All share the GPU's idea: many simple units doing the same arithmetic in parallel, fed with data as fast as possible.

> **For experienced readers.** A GPU's peak FLOP/s is rarely reached. Real speed depends on keeping its cores fed with data, which is the subject of the next lesson.

## Remember

- CPUs have few complex cores; GPUs have thousands of simple ones running the same instruction.
- Matrix multiplication is massive, independent, regular work: ideal for GPUs.
- Tensor cores multiply small matrix tiles in low precision, giving most of the speed.
- Libraries handle GPU code. Keep data on the GPU.

::quiz
? Why is a matrix multiplication well suited to a GPU?
+ Every output entry can be computed independently with the same operation, so thousands of cores can work at once
- It needs many decisions and branches
- It uses very little data
! Independent, identical work is exactly what many simple parallel cores are built for.
? A training script copies each batch from CPU to GPU, back to CPU for one step, then to the GPU again. What is the likely effect?
+ Slow training, because transfers between CPU and GPU memory are expensive
- Faster training
- No effect
! Moving data across is slow compared with the GPU's arithmetic. Keep work on the GPU.
::end
