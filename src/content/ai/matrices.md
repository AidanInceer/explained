---
minutes: 8
tech: []
refs:
  - strang: Section 1.3, “Matrices”, and Section 2.1, “Vectors and Linear Equations”
  - mml: Section 2.2, “Matrices”, and Section 2.7, “Linear Mappings”
---
A **matrix** is a grid of numbers in rows and columns. It has two useful readings. As **data**, it is a table: each row a house, each column a feature. As an **action**, it is a machine that takes a vector in and gives a new vector out, moving every point of a space at once. Neural networks use both readings all the time.

## The shape

A matrix with 2 rows and 3 columns is a **2 × 3** matrix:

```
A = | 1  0  2 |
    | 3  1  0 |
```

The shape is always rows first, then columns. Writing it down before you calculate avoids most mistakes.

## As data

A dataset of 1,000 houses with 5 numbers each is a 1,000 × 5 matrix. One row is one house's vector. One column is one feature for all houses. Images are matrices too: a grey image 28 pixels high and 28 wide is a 28 × 28 matrix of brightness values.

## As an action: matrix times vector

Multiply a matrix by a vector, and each output component is the [dot product](/lesson/dot-product) of one row of the matrix with the vector:

```
| 1  0  2 |   | 4 |   | 1×4 + 0×1 + 2×2 |   | 8 |
| 3  1  0 | × | 1 | = | 3×4 + 1×1 + 0×2 | = | 13 |
              | 2 |
```

A 2 × 3 matrix takes a vector with 3 components and gives a vector with 2. The number of columns must match the input's size; the number of rows sets the output's size.

## What the action looks like

In two dimensions you can see what a matrix does to every point:

- `| 2 0 ; 0 2 |` doubles everything: a **scaling**.
- `| 0 -1 ; 1 0 |` turns everything a quarter turn: a **rotation**.
- `| 1 1 ; 0 1 |` slides the top of a square to the side: a **shear**.

Such maps are **linear**: straight lines stay straight, the origin stays put, and grid lines stay evenly spaced. That property makes them predictable and fast to compute.

## The columns tell you everything

A neat fact: the first column of a matrix is where the first axis direction `[1, 0]` lands, and the second column is where `[0, 1]` lands. Every other point follows from those, because any vector is a mix of the axis directions. So you can read what a matrix does from its columns.

## Why AI cares

A layer of a neural network holds a matrix of **weights**. It takes the input vector, multiplies it by the matrix, and gets a new vector, a new view of the same data. With a 784 × 128 weight matrix, a layer turns a 784-pixel image into 128 numbers. Training changes the numbers in these matrices; the next lesson, [Matrix multiplication](/lesson/matrix-multiply), shows how layers chain.

## Remember

- A matrix is a grid of numbers. Shape: rows × columns.
- As data, rows are examples and columns are features.
- As an action, a matrix times a vector gives a dot product for each row.
- Linear maps scale, rotate and shear, and keep lines straight. A layer is one such map.

::quiz
? A matrix is 4 × 10. What size of vector can it multiply, and what size comes out?
+ In: 10 components. Out: 4 components
- In: 4. Out: 10
- In: 40. Out: 1
! The columns must match the input, and each row gives one output component.
? What is `| 2 0 ; 0 3 | × [1, 1]`?
- `[1, 1]`
+ `[2, 3]`
- `[5, 5]`
! Row one: 2×1 + 0×1 = 2. Row two: 0×1 + 3×1 = 3.
::end
