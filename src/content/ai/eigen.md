---
minutes: 9
tech: []
refs:
  - strang: Ch. 6, “Eigenvalues and Eigenvectors”, and Ch. 7, “The Singular Value Decomposition (SVD)”
  - mml: Ch. 4, “Matrix Decompositions”
---
Most vectors change direction when a matrix acts on them. A few special vectors do not: the matrix only stretches or shrinks them. These are **eigenvectors**, and how much each one is stretched is its **eigenvalue**. Finding them is like finding the natural axes of a matrix, and the same idea, in the form of the singular value decomposition, underlies data compression, recommendation systems and the analysis of what models learn.

## The definition

A non-zero vector v is an **eigenvector** of a square matrix A if

`A × v = λ × v`

for some number λ, the **eigenvalue**. The matrix acts on v by scaling it, nothing more.

Example: `A = | 3 0 ; 0 1 |` stretches the x-axis by 3 and leaves the y-axis alone. So `[1, 0]` is an eigenvector with eigenvalue 3, and `[0, 1]` is one with eigenvalue 1. Any other vector, such as `[1, 1]`, becomes `[3, 1]`: its direction changes.

- An eigenvalue above 1 stretches; between 0 and 1 shrinks; negative flips the direction.
- An eigenvalue of 0 squashes that direction to nothing: information along it is lost.

## Why they matter: repeated application

Apply A again and again, and each eigenvector is multiplied by its eigenvalue each time. After many steps, directions with eigenvalues above 1 explode, and those below 1 fade away. This explains, for example, why signals in a very deep network can grow or vanish as they pass through many layers, a problem that careful initialisation and residual connections address.

## Decomposition

For many matrices, you can rewrite A using its eigenvectors and eigenvalues:

`A = Q × Λ × Q⁻¹`

where Q holds the eigenvectors as columns and Λ is a diagonal matrix of eigenvalues. Read it right to left: change to the eigenvector axes, stretch each axis by its eigenvalue, change back. A complicated matrix becomes three simple steps.

## The singular value decomposition

Eigenvectors only work for square matrices, and not always neatly. The **singular value decomposition** (SVD) works for any matrix, of any shape:

`A = U × Σ × Vᵀ`

- V gives a set of input directions, U a set of output directions, both at right angles to each other.
- Σ is diagonal: the **singular values**, how much each input direction is stretched into its output direction, sorted from largest to smallest.

Every matrix is a rotation (or reflection), a stretch along axes, and another rotation (or reflection).

## Keep the big parts

Usually, a few singular values are large and the rest are small. Keep only the top k, and you get the best possible approximation of the matrix with that much information. This **low-rank approximation** is used to:

- Compress images and data.
- Find the main patterns in a table, such as **principal component analysis** (PCA), which the lesson on clustering and dimension reduction uses.
- Fine-tune large models cheaply: methods such as LoRA learn a small low-rank change to each weight matrix instead of the whole matrix.

> **For experienced readers.** PCA on centred data is the SVD of the data matrix: the right singular vectors are the principal directions, and the squared singular values are proportional to the variance along each.

## Remember

- An eigenvector is only scaled by a matrix. The scale factor is its eigenvalue.
- Repeated application grows directions with eigenvalues above 1 and shrinks the rest.
- The SVD writes any matrix as rotate, stretch, rotate, with sorted singular values.
- Keeping the largest singular values gives the best low-rank approximation: PCA, compression, LoRA.

::quiz
? For `A = | 2 0 ; 0 5 |`, what is the eigenvalue of the eigenvector `[0, 1]`?
- 2
+ 5
- 7
! A × [0, 1] = [0, 5] = 5 × [0, 1].
? A matrix's singular values are 90, 40, 0.3 and 0.1. What does this suggest?
+ Two directions hold almost all of its effect, so a rank-2 approximation is very close
- All four directions matter equally
- The matrix is not square
! The small singular values add very little. Keeping the top two loses almost nothing.
::end
