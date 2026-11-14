---
minutes: 7
tech: []
refs:
  - mml: Section 6.1, “Construction of a Probability Space”, and Section 6.2, “Discrete and Continuous Probabilities”
  - dlbook: Ch. 3, “Probability and Information Theory”, Sections 3.1 to 3.4
---
Models are rarely certain. A spam filter says "97% likely spam". A language model gives every possible next word a chance. **Probability** is the language for this: numbers between 0 and 1 that say how likely things are, with rules for combining them.

## The basics

- A probability is a number from 0 (impossible) to 1 (certain). 0.25 means "one time in four".
- The probabilities of all possible outcomes add up to 1. A fair die: each face has 1/6, and six sixths make 1.
- The probability that something does **not** happen is 1 minus the probability that it does.

## And, or

**Or**: for outcomes that cannot happen together, add. Rolling a 1 or a 2: 1/6 + 1/6 = 1/3.

**And**: for **independent** events, where one tells you nothing about the other, multiply. Two coins both heads: ½ × ½ = ¼.

Independence is a strong assumption. Rain today and rain tomorrow are not independent. Many mistakes in reasoning come from multiplying probabilities that are not.

## Random variables

A **random variable** is a quantity whose value depends on chance: the face of a die, tomorrow's temperature, the next word.

- **Discrete** variables take separate values, like die faces or words. Each value has a probability.
- **Continuous** variables can take any value in a range, like a height. Probability lives in ranges, as areas under a density curve, as [Integrals](/lesson/integrals) showed.

## Where models use it

- A **classifier** outputs a probability for each class: 0.9 cat, 0.08 dog, 0.02 fox. They add to 1.
- A **language model** outputs a probability for every token in its vocabulary at each step, and text is produced by picking from those probabilities.
- **Training** asks: how probable did the model think the true answers were? A good model gives high probability to what really happened. The lessons on likelihood and cross-entropy make this exact.

## Two meanings

Probability is used in two ways:

- **Frequency**: in many repeats, how often it happens. A fair coin lands heads about half the time.
- **Belief**: how confident to be, given what you know. "70% chance of rain tomorrow" cannot be repeated, but it is still useful.

The same rules apply to both. Models' outputs are best read as beliefs, and good models' beliefs are **calibrated**: of all the times a model says 70%, it is right about 70% of the time.

> **Pitfall.** A model's probability is not a guarantee. A model can say 99% and be wrong, especially on inputs unlike its training data. Check calibration on your own data before you trust the numbers.

## Remember

- Probabilities run from 0 to 1, and all outcomes add to 1.
- Add for "or" of exclusive outcomes; multiply for "and" of independent events.
- Discrete variables have probabilities per value; continuous ones per range.
- Models output probabilities. Good ones are calibrated; none are guarantees.

::quiz
? A model gives probabilities 0.6 to "cat" and 0.3 to "dog". What probability is left for all other classes together?
- 0.9
+ 0.1
- 0
! All outcomes add up to 1: 1 - 0.6 - 0.3 = 0.1.
? What is the probability of two independent events, each with probability 0.5, both happening?
+ 0.25
- 1
- 0.5
! For independent events, multiply: 0.5 × 0.5 = 0.25.
::end
