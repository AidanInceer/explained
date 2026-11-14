---
minutes: 7
tech: []
refs:
  - mml: Ch. 2, “Linear Algebra”, and Section 3.1, “Norms”
  - strang: Ch. 1, “Introduction to Vectors”
---
A model cannot read a word or look at a picture. It can only do arithmetic. So everything that goes into a model, and everything inside it, is a list of numbers. That list is a **vector**, and almost every later lesson builds on it.

## A vector is a list of numbers

A **vector** is an ordered list of numbers. Each number is a **component**. The number of components is the vector's **dimension**.

- `[3, 1]` is a vector with 2 components.
- `[0.2, -1.5, 4.0]` is a vector with 3 components.

The order matters. `[3, 1]` and `[1, 3]` are different vectors, because each position has its own meaning. In a vector that describes a house, the first number might be the floor area and the second the number of rooms. Swap them and you describe a different house.

## Two ways to picture a vector

With two or three components, you can draw a vector in two ways:

1. **As a point.** `[3, 1]` is the point that is 3 to the right and 1 up from the origin.
2. **As an arrow** from the origin to that point. The arrow has a direction and a length.

Both pictures describe the same numbers. The point picture helps when you compare things: two similar houses are two points close together. The arrow picture helps when you combine things, as the next part shows.

> **For new readers.** Real models use vectors with hundreds or thousands of components. You cannot draw them, but everything here still works in the same way. You think in two dimensions and let the arithmetic do the rest.

## Add and scale

Two operations make vectors useful.

**Addition** adds the components in the same position:

`[3, 1] + [1, 2] = [4, 3]`

As arrows: put the second arrow at the tip of the first. The sum goes from the start of the first to the tip of the second.

**Scaling** multiplies every component by one number, called a **scalar**:

`2 × [3, 1] = [6, 2]`

As an arrow: the same direction, twice as long. A negative scalar turns the arrow round.

Both operations need vectors of the same dimension. You cannot add `[1, 2]` and `[1, 2, 3]`: the third position has no partner.

## Length

The **length** of a vector, also called its **norm**, is the distance from the origin to its point. For `[3, 4]` it is 5, by Pythagoras' theorem:

`length([3, 4]) = √(3² + 4²) = √25 = 5`

The rule is the same in any dimension: square each component, add the squares, take the square root. The distance between two points is the length of their difference, so you can measure how far apart two houses, two images or two words are.

## Why AI uses vectors

- **Inputs are vectors.** A grey image of 28 × 28 pixels is a vector of 784 brightness values. A row in a table is a vector of its numeric columns.
- **Meanings are vectors.** A language model turns each word or word piece into a vector, called an embedding. Words with similar meanings get vectors that are close together.
- **A model's knowledge is numbers.** Its weights are large collections of numbers, and each layer turns one vector into another.

So "similar" becomes "close", and "combine" becomes "add". The next lesson, “The dot product”, gives the most used way to compare two vectors.

## Remember

- A vector is an ordered list of numbers. Its dimension is how many numbers it has.
- You can add vectors of the same dimension, and scale a vector by a number.
- Length is the square root of the sum of squares. Distance is the length of a difference.
- In AI, inputs, meanings and weights are all vectors.

::quiz
? What is `[2, 5] + 3 × [1, -1]`?
- `[3, 4]`
+ `[5, 2]`
- `[9, 12]`
! First scale: `3 × [1, -1] = [3, -3]`. Then add position by position: `[2 + 3, 5 - 3] = [5, 2]`.
? What is the length of `[6, 8]`?
- 14
+ 10
- 48
! Square each component and add: 36 + 64 = 100. The square root of 100 is 10.
::end
