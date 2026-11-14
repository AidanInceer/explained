---
minutes: 8
tech: []
refs:
  - mml: Section 6.5, “Gaussian Distribution”
  - dlbook: Section 3.9, “Common Probability Distributions”
---
A **distribution** describes all the values a random quantity can take, and how likely each is. Its shape matters: whether values cluster round a middle, spread evenly, or have rare enormous values changes how you should model them and how you should read an average. A few shapes appear again and again.

## Discrete distributions

- **Bernoulli**: one yes-or-no trial with probability p. A coin flip, a click or no click.
- **Categorical**: one of k outcomes, each with its own probability. A die, or the next token from a language model's vocabulary.
- **Binomial**: the number of yes results in n independent yes-or-no trials. How many of 100 visitors click.

## Uniform

Every value in a range is equally likely. A random number between 0 and 1. Uniform distributions are used to start things off: random initial settings, random shuffling, random sampling.

## Normal (Gaussian)

The bell curve. Values cluster round a **mean** μ, and fall away symmetrically, with a spread set by the **standard deviation** σ:

- About 68% of values fall within 1 σ of the mean.
- About 95% within 2 σ.
- About 99.7% within 3 σ.

The normal shape appears whenever many small independent effects add up. That is the **central limit theorem**, and it explains why heights, measurement errors and averages of many samples look roughly normal. Neural network weights are often initialised from a normal distribution, and many models assume normal noise.

## Long tails

Some quantities are not like that. City populations, income, file sizes, words in a language and the number of followers per account have **long-tailed** (or heavy-tailed) distributions: most values are small, and a few are enormous.

- In the English language, a few words such as "the" are extremely common, and most words are rare. Language models must handle both.
- The mean of a long-tailed distribution is pulled far up by the few huge values, and is a poor summary. Use the **median**, and percentiles.

> **Pitfall.** Assuming a normal distribution where the tail is long underestimates extreme events. "A 5 σ event" that should happen once in millions of years shows up every few years in markets and in server response times.

## Densities

For continuous distributions, such as the normal, the curve is a **probability density**. Its height is not a probability; the area under it over a range is, as [Integrals](/lesson/integrals) showed. The total area is 1.

## Why this matters for models

- A model's output for a class is a categorical distribution.
- Training data is a sample from some distribution. A model learns that distribution, and works well only on inputs that come from it. When real inputs drift away from it, quality drops.
- Choosing a loss function often means choosing a distribution: squared error fits normal noise; cross-entropy fits categorical outcomes.

## Remember

- Bernoulli and categorical for single outcomes; binomial for counts.
- Uniform: all values equal. Normal: a bell round a mean; 68–95–99.7 within 1, 2, 3 σ.
- Long tails: a few huge values. Use medians and percentiles there.
- Models learn the distribution of their training data, and fail when inputs drift from it.

::quiz
? Heights in a group are normal with mean 170 cm and σ 10 cm. About what share is between 150 and 190 cm?
+ 95%
- 68%
- 50%
! 150 to 190 is within 2 σ of the mean, which holds about 95% of values.
? Response times have a long tail. Which number best describes a typical request?
+ The median
- The mean
- The maximum
! A few very slow requests pull the mean up. The median is the middle request.
::end
