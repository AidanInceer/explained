---
minutes: 9
tech: []
refs:
  - strang: Section 2.4, “Rules for Matrix Operations”
  - mml: Section 2.2.1, “Matrix Addition and Multiplication”
  - pmpp: Ch. 3, “Multidimensional Grids and Data”, on matrix multiplication on GPUs
---
If one matrix moves points, and a second matrix moves them again, the two moves together are a single new matrix: their **product**. **Matrix multiplication** is how layers chain, how a whole batch of inputs is processed at once, and most of the arithmetic that a GPU does when it trains or runs a model.

## The rule

To multiply A (shape m × n) by B (shape n × p):

- The inner sizes must match: A's columns (n) must equal B's rows (n).
- The result has shape **m × p**.
- The entry in row i, column j of the result is the [dot product](/lesson/dot-product) of row i of A with column j of B.

```
| 1  2 |   | 5  6 |   | 1×5 + 2×7   1×6 + 2×8 |   | 19  22 |
| 3  4 | × | 7  8 | = | 3×5 + 4×7   3×6 + 4×8 | = | 43  50 |
```

> **For new readers.** Write the shapes first: (2 × 2) × (2 × 2) = 2 × 2. If the middle numbers do not match, the multiplication is not defined, and your code will raise a shape error.

## Order matters

For numbers, 3 × 5 = 5 × 3. For matrices, A × B is usually **not** B × A. Rotating then stretching is not the same as stretching then rotating. And often only one order is even defined, because the shapes do not fit the other way.

Multiplication is **associative**, though: (A × B) × C = A × (B × C). You can group a chain in whichever order is cheapest to compute.

## Why it is everywhere in AI

**A layer on many inputs at once.** In [Matrices](/lesson/matrices), a layer multiplied one input vector by a weight matrix. Stack 64 inputs as the rows of a matrix X (64 × 784), and one product X × W (784 × 128) processes all 64 at once, giving a 64 × 128 result. This is a **batch**, and it is how models are trained and served.

**Layers in a chain.** Two layers apply two matrices one after the other. Without anything between them, they would collapse into one matrix, which is why networks put a bend, an activation function, between layers.

**Attention.** A language model compares every word with every other word with one big product of two matrices, as the lesson on attention explains.

## The cost

Multiplying an m × n matrix by an n × p matrix takes m × n × p multiplications, and about as many additions. For two 4,096 × 4,096 matrices that is about 69 billion multiplications. Large models do this thousands of times for each token they read.

The work is huge, but very regular: the same small operation, repeated, with no decisions in between. That is exactly what GPUs are built for: thousands of small units each computing a part at the same time, as the lesson [Why GPUs](/lesson/gpus) on the physical layer line explains.

## Remember

- (m × n) × (n × p) gives m × p. Each entry is a row dotted with a column.
- Order matters: A × B is usually not B × A. Grouping does not.
- A batch of inputs times a weight matrix runs a layer on all of them at once.
- Products cost m × n × p multiplications, a regular kind of work that GPUs do well.

::quiz
? What is the shape of a (32 × 512) matrix times a (512 × 10) matrix?
+ 32 × 10
- 512 × 512
- Not defined
! The inner sizes (512) match and disappear. The outer sizes give the result.
? Why do networks put an activation function between two weight layers?
+ Without it, the two matrices would combine into one, and the extra layer would add nothing
- To make the shapes fit
- To make training slower
! A product of matrices is one matrix. Bends between layers let a deep network represent more than one linear map.
::end
