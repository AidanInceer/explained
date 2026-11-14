---
minutes: 7
tech: []
refs:
  - mml: Section 6.4, “Summary Statistics and Independence”
  - dlbook: Section 3.8, “Expectation, Variance and Covariance”
---
Two numbers summarise most distributions well enough for everyday use. The **expectation** (or mean) is the centre: the average value you would get over many tries. The **variance** says how spread out the values are round that centre. Together they appear everywhere in AI: in losses, in normalisation layers, in initialising weights and in judging how reliable a result is.

## Expectation

The expected value of a random variable is the average of its values, each weighted by its probability:

`E[X] = Σ value × probability`

A fair die: `(1 + 2 + 3 + 4 + 5 + 6) × 1/6 = 3.5`. You will never roll 3.5, but over many rolls the average approaches it.

A bet: win £10 with probability 0.2, lose £3 otherwise. `E = 10 × 0.2 + (-3) × 0.8 = 2 - 2.4 = -0.4`. On average you lose 40p per bet.

Expectations add: `E[X + Y] = E[X] + E[Y]`, always, even when X and Y depend on each other.

## Variance and standard deviation

The **variance** is the expected squared distance from the mean:

`Var[X] = E[(X - E[X])²]`

Squaring makes every distance positive and weighs large distances more. The **standard deviation**, σ, is the square root of the variance, which brings it back to the original units.

Two sets with the same mean, 10:

- `9, 10, 11`: small spread, variance about 0.67.
- `0, 10, 20`: large spread, variance about 66.7.

The mean alone hides the difference.

## In AI

- **The loss is an expectation.** Training minimises the expected loss over the data. A batch average estimates it, as [Integrals](/lesson/integrals) described.
- **Normalisation.** Layers such as batch norm and layer norm subtract the mean and divide by the standard deviation of their inputs, so each layer sees values on a steady scale.
- **Initialisation.** Weights are drawn with a variance chosen so that signals keep about the same size through many layers, avoiding the vanishing and exploding of the [chain rule](/lesson/chain-rule).
- **Noisy gradients.** A gradient from a small batch is right on average, but has high variance. Larger batches lower the variance, as the lesson on stochastic gradient descent explains.

## Variance of an average

Average n independent samples, and the variance of that average is the variance of one sample divided by n. Its standard deviation falls with the square root of n: to halve the noise, you need four times as many samples. This is why measuring small differences between models needs large test sets.

> **For experienced readers.** Covariance measures how two variables move together; correlation scales it to the range -1 to 1. A matrix of covariances between features is what PCA decomposes.

## Remember

- Expectation: the probability-weighted average. Expectations add.
- Variance: the expected squared distance from the mean. σ is its square root.
- Losses are expectations; normalisation and initialisation control variance.
- Averaging n samples divides variance by n; noise falls with √n.

::quiz
? What is the expected value of a game that pays £6 with probability 0.5 and £0 otherwise?
+ £3
- £6
- £0
! 6 × 0.5 + 0 × 0.5 = 3.
? To halve the standard deviation of an average, how many more samples do you need?
+ Four times as many
- Twice as many
- Half as many
! The standard deviation of an average falls with the square root of n: √4 = 2.
::end
