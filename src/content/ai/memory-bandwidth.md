---
minutes: 8
tech: []
refs:
  - pmpp: Ch. 5, “Memory Architecture and Data Locality”
  - hennessy: Ch. 2, “Memory Hierarchy Design”
---
A modern GPU can do about a thousand trillion operations a second. It can read only a few trillion bytes from its memory in the same second. For many AI workloads the arithmetic units sit idle, waiting for numbers to arrive. **Moving data, not computing on it, is usually the bottleneck**, and much of AI engineering is about moving less.

## Two speeds

- **Compute**: how many operations per second the chip can do, in FLOP/s.
- **Memory bandwidth**: how many bytes per second it can read from memory, in bytes/s.

The ratio between them matters. A current data-centre GPU may do around 10¹⁵ operations per second but read only about 3 × 10¹² bytes per second. So to keep the arithmetic busy, it must do hundreds of operations for every byte it reads.

## Arithmetic intensity

**Arithmetic intensity** is the number of operations done per byte read from memory.

- **Adding two large vectors**: read two numbers, do one addition, write one number. Intensity well under 1. Memory-bound: the chip mostly waits.
- **Multiplying two large matrices**: each number read is used in many multiply-adds. For n × n matrices, the work grows with n³ and the data with n², so intensity grows with n. Compute-bound, if done well.

This is why large matrix multiplications run near the chip's peak, and element-wise operations, such as adding a bias or applying an activation, are limited by bandwidth.

## The memory hierarchy

As [How computers work](/lesson/how-computers-work) showed for CPUs, memory comes in layers. On a GPU:

- **Registers**: tiny, per thread, instant.
- **Shared memory and caches** on the chip: small and very fast.
- **High-bandwidth memory** (HBM) next to the chip: tens of gigabytes, fast but far slower than on-chip memory.
- **CPU memory**, across a connection: slower still.

Fast kernels load a tile of data into on-chip memory once, use it many times, and only then write back. **Fusing** several operations into one kernel avoids writing intermediate results to HBM and reading them back.

> **For experienced readers.** FlashAttention speeds up attention this way: it computes attention in tiles inside on-chip memory and never writes the full attention matrix to HBM.

## Why generating text is memory-bound

When a language model generates one token for one user, each layer multiplies a single vector by its weight matrices. Each weight is read from memory once and used once: intensity is very low. The speed of generation is then set mostly by how fast the chip can read all the weights:

`time per token ≈ size of the weights / memory bandwidth`

A model with 14 GB of weights on a chip with 2 TB/s of bandwidth: at best about 7 ms per token, whatever the chip's FLOP/s.

This explains several common techniques:

- **Batching** many users' requests together, so each weight read serves many tokens.
- **Quantisation** to fewer bits, from [Numbers in hardware](/lesson/numbers-in-hardware): fewer bytes to read per token.
- **Caching** the attention keys and values of earlier tokens, so they are not recomputed.

## Remember

- Chips compute far faster than they can read memory. Data movement is usually the limit.
- Arithmetic intensity, operations per byte, decides whether work is compute- or memory-bound.
- Fast code reuses data in on-chip memory and fuses operations.
- Generating one token at a time is memory-bound: batching and quantisation help.

::quiz
? A model's weights take 8 GB, and the chip's memory bandwidth is 2 TB/s. Roughly what is the fastest time per token for one user?
+ About 4 ms
- About 0.004 ms
- About 4 s
! Every weight is read once per token: 8 GB / 2,000 GB/s = 0.004 s.
? Which operation is most likely limited by memory bandwidth rather than by compute?
+ Adding a bias vector to a large tensor
- Multiplying two large square matrices
- Neither
! An element-wise add does one operation per number read: very low arithmetic intensity.
::end
