---
minutes: 7
tech: []
refs:
  - cover: Section 2.1, “Entropy”
  - mackay: Ch. 2, “Probability, Entropy, and Inference”
---
[Bits and information](/lesson/bits) measured the surprise of one outcome. **Entropy** is the average surprise of a whole distribution: how uncertain you are before you see the outcome. It is low when one outcome is almost certain, and high when many outcomes are equally likely.

## The formula

For a distribution with probabilities p₁, p₂, …, the entropy is the expected surprise:

`H = Σ p × (-log₂ p) = -Σ p log₂ p`

Each outcome's surprise, weighted by how often it happens.

## Examples

- **A fair coin**: two outcomes, ½ each. `H = ½ × 1 + ½ × 1 = 1 bit`.
- **A coin that lands heads 90% of the time**: `H = 0.9 × 0.152 + 0.1 × 3.32 ≈ 0.47 bits`. Less uncertain, so less entropy.
- **A coin that always lands heads**: `H = 0`. No uncertainty at all.
- **A fair 8-sided die**: `H = 3 bits`, the same as the 3 questions in [Bits and information](/lesson/bits).

For a fixed number of outcomes, entropy is highest when all are equally likely, and zero when one is certain.

## What it means

Entropy is the **minimum average number of bits** needed to encode outcomes from the distribution. Shannon proved that no code can do better on average, and good codes come close. So entropy is a hard limit on compression: English text has a certain entropy per character, and no compressor can go below it on average.

## Entropy in language models

A language model's output at each step is a distribution over the next token:

- **Low entropy**: the model is confident. After "The capital of France is", almost all the probability is on "Paris".
- **High entropy**: many continuations are plausible. After "My favourite food is", many words fit.

The entropy of a model's predictions shows how certain it is. Sampling methods, as the lesson on sampling explains, can sharpen or flatten that distribution to make output more predictable or more varied.

## Where else it appears

- **Decision trees** choose questions that reduce entropy the most: the questions that split the data into the purest groups. This reduction is called **information gain**.
- **Exploration** in reinforcement learning sometimes rewards high entropy, so the agent keeps trying new actions.
- **Measuring diversity**: the entropy of predicted labels shows whether a model always says the same thing.

## Remember

- Entropy is the average surprise of a distribution: -Σ p log p.
- It is highest when outcomes are equally likely and zero when one is certain.
- It is the minimum average bits needed to encode the outcomes.
- A model's output entropy shows how confident it is.

::quiz
? What is the entropy of a fair 4-sided die?
- 1 bit
+ 2 bits
- 4 bits
! Four equally likely outcomes: log₂ 4 = 2 bits.
? Which next-token distribution has the lowest entropy?
+ 0.97 on one token, the rest spread thinly
- Equal probability on 10 tokens
- Equal probability on 2 tokens
! Entropy is lowest when one outcome is nearly certain.
::end
