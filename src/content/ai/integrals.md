---
minutes: 7
tech: []
refs:
  - mml: Section 6.2, on probability densities and integrals
  - dlbook: Section 3.3, “Probability Distributions”
---
A derivative breaks a quantity into its rate of change. An **integral** does the reverse: it adds up many small pieces to get a total. In AI, integrals appear mostly in probability: the chance that a continuous value falls in a range, and the average of a quantity over all its possible values.

## Area under a curve

Picture the graph of a function. The integral from a to b is the area between the curve and the horizontal axis, from a to b.

To compute it roughly, cut the range into thin strips, treat each as a rectangle of width Δx and height f(x), and add them up:

`area ≈ f(x₁)Δx + f(x₂)Δx + … + f(xₙ)Δx`

As the strips get thinner, the sum approaches the exact integral, written:

`∫ₐᵇ f(x) dx`

The long S is for "sum"; dx is the thin width.

**Example.** For `f(x) = 2x` from 0 to 3, the area is a triangle with base 3 and height 6: `½ × 3 × 6 = 9`. The integral gives the same answer.

## The reverse of a derivative

The **fundamental theorem of calculus** links the two ideas. If F is a function whose derivative is f, then:

`∫ₐᵇ f(x) dx = F(b) - F(a)`

For `f(x) = 2x`, `F(x) = x²` (since the derivative of x² is 2x), so the area from 0 to 3 is `9 - 0 = 9`.

## Where AI uses them

**Probability of a range.** For a continuous value, such as a height, the probability of any exact value is zero. Probability lives in areas. A **probability density** curve is shaped so that the area under it between two values is the chance of falling between them, and the total area is 1. The lesson [Distributions](/lesson/distributions) uses this.

**Expected values.** The average of a quantity over a continuous distribution is an integral: each value weighted by its density, summed over all values. The lesson on expectation and variance builds on this.

**Generative models.** Diffusion models and other generative models are described with integrals over many variables, which are almost never computed exactly.

## Estimating integrals

Most integrals that matter in AI have no neat formula, and are over thousands of dimensions. So they are **estimated** by sampling: draw many random examples and average. A training loss averaged over a batch is exactly this: an estimate of the average loss over all possible data, which is an integral nobody can compute.

## Remember

- An integral adds up many small pieces: the area under a curve.
- Integrals undo derivatives: the area equals F(b) - F(a).
- In AI, probabilities of ranges and expected values are integrals.
- High-dimensional integrals are estimated by averaging random samples.

::quiz
? What is the area under `f(x) = 4` from x = 1 to x = 6?
- 4
+ 20
- 24
! A rectangle of height 4 and width 5: area 20.
? Why is the average loss over a batch of examples an estimate of an integral?
+ It averages over samples to approximate the expected loss over all possible data
- Because the loss is always a curve
- Batches are integrals by definition
! The true expected loss is an integral over the data distribution. Sampling estimates it.
::end
