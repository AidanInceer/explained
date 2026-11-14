---
minutes: 7
tech: []
refs:
  - dlbook: Section 6.2.2.3, “Softmax Units for Multinoulli Output Distributions”
  - d2l: Section 4.1, “Softmax Regression”
---
A model often ends with a list of raw scores, one per possible answer: 2.0 for cat, 1.0 for dog, -1.0 for fox. Scores can be any size and any sign. To turn them into probabilities, which are positive and add up to 1, models use **softmax**. It is at the end of almost every classifier and language model, and inside every attention layer.

## The formula

For scores z₁, z₂, …, zₖ:

`softmax(zᵢ) = e^(zᵢ) / Σⱼ e^(zⱼ)`

Raise e to each score, which makes every value positive, then divide each by the total, so they add up to 1.

## An example

Scores: cat 2.0, dog 1.0, fox -1.0.

- e^2.0 ≈ 7.39
- e^1.0 ≈ 2.72
- e^-1.0 ≈ 0.37
- Total ≈ 10.48

Probabilities: cat ≈ 0.705, dog ≈ 0.259, fox ≈ 0.035. They add up to 1.

## What it does to scores

- **Order is kept.** The highest score gets the highest probability.
- **Differences matter, not levels.** Adding the same number to every score changes nothing. Only the gaps count.
- **Gaps are exaggerated.** Because of the exponential, a score 2 higher gives about 7 times the probability (e² ≈ 7.4). The winner takes more than a fair share, hence "soft max": a smooth version of picking the maximum.

The raw scores before softmax are called **logits**.

## Temperature

Divide the scores by a number T, the **temperature**, before softmax:

- T below 1 widens the gaps: the distribution gets sharper, closer to always picking the top answer.
- T above 1 narrows the gaps: the distribution gets flatter, giving other answers more chance.

Language models use temperature when they generate text: low for focused, predictable answers; higher for more varied writing. The lesson on sampling covers this.

::fig ai-softmax | Scores for the next word, turned into probabilities by softmax. Change the temperature.

## Two practical points

- **Stability.** e raised to a large score overflows. Libraries subtract the largest score from all scores first, which changes nothing in the result, as noted above, and keeps the numbers small.
- **Pairing with the loss.** Softmax is almost always combined with the cross-entropy loss, as the lesson [Cross-entropy and KL divergence](/lesson/cross-entropy) shows. Libraries compute the two together, from logits, for accuracy and speed.

> **Pitfall.** Softmax probabilities look precise, but a model trained only to be accurate can be badly calibrated: it may say 0.99 when it is right far less often. Probabilities from softmax are a model's opinion, not a measured fact.

## Remember

- Softmax turns any scores into probabilities: exponentiate, then divide by the total.
- It keeps order, ignores shifts, and exaggerates gaps.
- Temperature sharpens (T < 1) or flattens (T > 1) the distribution.
- Libraries stabilise it and pair it with cross-entropy.

::quiz
? Scores are [3, 3]. What does softmax give?
+ [0.5, 0.5]
- [3, 3]
- [1, 0]
! Equal scores give equal probabilities, adding to 1.
? You add 100 to every logit. What happens to the softmax probabilities?
+ Nothing: only differences between scores matter
- They all become 1
- They all become 0
! The shared factor e^100 cancels between the top and bottom of the formula.
::end
