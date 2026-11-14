---
minutes: 8
tech: []
refs:
  - strang: Section 1.2, “Lengths and Dot Products”
  - mml: Section 3.2, “Inner Products”, and Section 3.4, “Angles and Orthogonality”
---
The **dot product** takes two vectors and gives one number. That number says how much the two vectors point the same way. It is the single most used operation in AI: every layer of a neural network, every search by meaning, and every attention step in a language model is built from dot products.

## How to compute it

Multiply the components in the same position, then add the results:

`[2, 3] · [4, 1] = 2×4 + 3×1 = 8 + 3 = 11`

`[1, 0, 2] · [3, 5, -1] = 3 + 0 - 2 = 1`

Both vectors must have the same dimension, as with addition in [Vectors](/lesson/vectors).

## What it means

The dot product also equals the two lengths multiplied together, times the cosine of the angle between the vectors:

`a · b = length(a) × length(b) × cos(angle)`

So its sign tells you the direction:

- **Positive**: the vectors point roughly the same way (angle under 90°).
- **Zero**: they are at a right angle. They are called **orthogonal**: they share nothing.
- **Negative**: they point roughly opposite ways (angle over 90°).

And its size grows with how long the vectors are, and how well they line up.

## Cosine similarity

Often you want "how alike?" without the effect of length. Divide the dot product by the two lengths, and you get the cosine of the angle alone:

`cosine similarity = (a · b) / (length(a) × length(b))`

It runs from 1 (same direction) through 0 (unrelated) to -1 (opposite). Search engines that find documents by meaning turn each text into a vector, an **embedding**, and rank results by cosine similarity with the question's vector.

## A weighted sum

There is a second way to read the dot product. If one vector holds **inputs** and the other holds **weights**, the dot product is a **weighted sum**:

- Inputs: `[size_m2, rooms, age_years] = [80, 3, 20]`
- Weights: `[2000, 5000, -500]`
- Dot product: `160,000 + 15,000 - 10,000 = 165,000`

This is a tiny price model. Each weight says how much its input counts, and in which direction. A neuron in a neural network does exactly this, then adds a little more, as a later lesson shows.

> **For new readers.** You will see the dot product written as `a · b`, `aᵀb`, `⟨a, b⟩`, or as a sum `Σ aᵢbᵢ`. They all mean the same thing.

## Remember

- Dot product: multiply position by position, then add.
- Positive means alike, zero means unrelated (orthogonal), negative means opposite.
- Cosine similarity removes the effect of length. It is how embeddings are compared.
- Inputs dotted with weights give a weighted sum: the core of a neuron.

::quiz
? What is `[1, 2, 3] · [4, 0, -1]`?
- 0
+ 1
- 7
! 1×4 + 2×0 + 3×(-1) = 4 + 0 - 3 = 1.
? Two embeddings have a cosine similarity of about 0. What does that suggest?
+ The texts are unrelated in meaning
- The texts are identical
- The texts mean opposite things
! A cosine near 0 means the vectors are at about a right angle: they share little.
::end
