---
minutes: 7
tech: []
refs:
  - dlbook: Section 2.1, “Scalars, Vectors, Matrices and Tensors”
  - d2l: Section 2.1, “Data Manipulation”, and Section 2.3, “Linear Algebra”
---
A number is a single value. A vector is a row of numbers. A matrix is a grid. A **tensor** continues the pattern: a block of numbers with any number of **axes**. In AI code, almost everything is a tensor, and most bugs are tensors with the wrong shape.

## Axes and shape

The number of axes is the tensor's **rank** (also called its number of dimensions, which is confusing, because a vector's "dimension" means its length). The **shape** lists the size along each axis:

| Rank | Name | Example shape | Example |
|---|---|---|---|
| 0 | Scalar | `()` | A loss value: 0.42 |
| 1 | Vector | `(768,)` | One word's embedding |
| 2 | Matrix | `(1000, 5)` | A table: 1,000 rows, 5 features |
| 3 | 3-tensor | `(32, 128, 768)` | 32 sentences, 128 tokens each, 768 numbers per token |
| 4 | 4-tensor | `(64, 3, 224, 224)` | 64 colour images: 3 colour channels, 224 × 224 pixels |

## Common axes

In practice, each axis has a meaning, and the order is a convention of the library or model:

- **Batch**: which example. Almost always the first axis.
- **Sequence** or **time**: which position in a sentence or a signal.
- **Channels**: colour channels of an image, or features.
- **Height** and **width**: positions in an image.
- **Features** or **hidden size**: the numbers that describe one item.

Read a shape like a sentence: `(32, 128, 768)` is "32 examples, each with 128 tokens, each token described by 768 numbers".

## Operations on tensors

The operations from earlier lessons extend naturally:

- **Element-wise** operations, such as adding two tensors of the same shape, work position by position.
- **Matrix multiplication** works on the last two axes, and repeats across the others. A `(32, 128, 768)` tensor times a `(768, 3072)` weight matrix gives `(32, 128, 3072)`: the same layer applied to every token of every sentence.
- **Reductions**, such as a sum or a mean along one axis, remove that axis: the mean over the sequence axis turns `(32, 128, 768)` into `(32, 768)`, one vector per sentence.
- **Reshaping** changes the shape without changing the numbers, for example flattening a 28 × 28 image to 784 values.

## Broadcasting

When two tensors have different shapes, libraries such as NumPy and PyTorch often **broadcast**: they repeat the smaller one along missing axes. Adding a bias vector of shape `(768,)` to a tensor of shape `(32, 128, 768)` adds it to every token.

> **Pitfall.** Broadcasting is convenient and silent. A `(32, 1)` tensor added to a `(32,)` tensor gives a `(32, 32)` tensor, with no error, and the bug appears much later. Print shapes while you develop, and check them with assertions.

## Remember

- A tensor is a block of numbers with any number of axes. Its shape lists the size of each.
- Axes have meanings: batch, sequence, channels, height, width, features.
- Matrix multiplication repeats across leading axes; reductions remove an axis.
- Broadcasting repeats smaller tensors silently. Check shapes.

::quiz
? A batch of 16 colour images, 64 × 64 pixels, with channels first. What is its shape?
+ (16, 3, 64, 64)
- (64, 64, 16)
- (16, 64)
! Batch, then 3 colour channels, then height and width.
? You take the mean over the second axis of a tensor shaped (8, 50, 300). What shape results?
+ (8, 300)
- (8, 50)
- (50, 300)
! A reduction removes the axis it runs over: 8 examples, each a 300-number vector.
::end
