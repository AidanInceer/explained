---
minutes: 8
tech: []
refs:
  - bishop: Section 1.2.4, “The Gaussian Distribution”, on maximum likelihood
  - dlbook: Section 5.5, “Maximum Likelihood Estimation”
---
You flip a coin 10 times and get 7 heads. What is the coin's chance of heads? The natural guess is 0.7. **Likelihood** explains why that guess is right, and the same idea, choose the settings that make the observed data most probable, is how almost every model is trained.

## Probability and likelihood

They use the same formula, read in two directions:

- **Probability**: the settings are fixed; how probable is each possible outcome? "If the coin is fair, how likely are 7 heads in 10 flips?"
- **Likelihood**: the outcome is fixed, because you saw it; how well does each possible setting explain it? "Given that I saw 7 heads in 10, how likely was that under p = 0.5? Under p = 0.7?"

## The coin

If the chance of heads is p, the probability of a particular sequence with 7 heads and 3 tails is:

`L(p) = p⁷ × (1 - p)³`

Try a few values:

| p | L(p) |
|---|---|
| 0.5 | about 0.00098 |
| 0.6 | about 0.0018 |
| 0.7 | about 0.0022 |
| 0.8 | about 0.0017 |

The likelihood is highest at p = 0.7. That is the **maximum likelihood estimate**: the setting under which what you saw was most probable.

## Use the logarithm

Likelihoods of many data points are products of many small numbers, which quickly become too small for a computer to store. So we use the **log-likelihood**: the logarithm turns the product into a sum, as [Functions and graphs](/lesson/math-functions) noted, and the best setting stays the same, because the logarithm only rises.

`log L(p) = 7 log p + 3 log(1 - p)`

Its derivative is zero at p = 0.7, confirming the answer.

## Training is maximum likelihood

Replace "the coin" with "the model" and "p" with "all its weights":

- The data are the training examples: images with their labels, or texts.
- The likelihood is the probability that the model assigns to the true labels, or to each true next token.
- Training finds the weights that make that probability as high as possible.

In practice we **minimise the negative log-likelihood**, because optimisers minimise. For classification this is exactly the **cross-entropy loss**, as the lesson [Cross-entropy and KL divergence](/lesson/cross-entropy) shows. When a language model is trained to predict the next token, it is maximising the likelihood of real text.

## Limits

- With little data, maximum likelihood trusts it too much. Three flips with three heads gives p = 1: "this coin always lands heads". Priors (from Bayes) and regularisation temper this.
- A model can only be as good as its family of possible settings allows. Maximum likelihood finds the best member of the family, not the truth.

## Remember

- Likelihood: how well each possible setting explains data you have seen.
- The maximum likelihood estimate is the setting that makes the data most probable.
- Use log-likelihood: sums instead of products, and the same best setting.
- Training a model is minimising the negative log-likelihood: cross-entropy for classifiers.

::quiz
? In 20 trials, an event happens 5 times. What is the maximum likelihood estimate of its probability?
+ 0.25
- 0.5
- 0.2
! The estimate that makes the observed data most probable is the observed frequency: 5 / 20.
? Why do we work with the log-likelihood instead of the likelihood?
+ Products of many small probabilities become sums, which are stable to compute, and the best setting is unchanged
- The log-likelihood is always larger
- It removes the need for data
! The logarithm turns products into sums and keeps the same maximum.
::end
