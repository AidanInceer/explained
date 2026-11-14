---
minutes: 8
tech: []
refs:
  - mml: Section 6.3, “Sum Rule, Product Rule, and Bayes’ Theorem”
  - bishop: Section 1.2, “Probability Theory”
---
New evidence changes what you should believe. A cough makes a cold more likely. A message containing "free prize" makes spam more likely. **Conditional probability** describes chances given that something is known, and **Bayes' rule** says exactly how to update a belief when evidence arrives.

## Conditional probability

`P(A | B)` is read "the probability of A given B": how likely A is, among the cases where B is true.

`P(A | B) = P(A and B) / P(B)`

**Example.** Of 100 emails, 30 are spam. 20 of the spam emails contain "prize", and 2 of the 70 normal ones do. So 22 emails contain "prize", and 20 of those are spam:

`P(spam | contains "prize") = 20 / 22 ≈ 0.91`

Knowing the word moved the chance from 30% to 91%.

## Order matters

`P(A | B)` is not `P(B | A)`.

- P(contains "prize" | spam) = 20/30 ≈ 0.67.
- P(spam | contains "prize") ≈ 0.91.

Mixing these up is one of the most common errors in reasoning about evidence, from medicine to courts.

## Bayes' rule

Bayes' rule turns one around into the other:

`P(A | B) = P(B | A) × P(A) / P(B)`

In words:

`belief after evidence = (how well the evidence fits A) × (belief before) / (how common the evidence is overall)`

- **Prior** P(A): what you believed before.
- **Likelihood** P(B | A): how probable the evidence is if A is true.
- **Posterior** P(A | B): what you should believe after.

## The rare-disease trap

A test for a disease is 99% accurate both ways. The disease affects 1 person in 1,000. You test positive. How likely are you to have it?

Out of 100,000 people: 100 have it, and 99 of them test positive. 99,900 do not, and 1%, about 999, also test positive. So of 1,098 positives, only 99 are ill:

`P(ill | positive) ≈ 99 / 1,098 ≈ 9%`

The test is good, but the prior was tiny, and false positives from the many healthy people swamp the true ones.

> **In practice.** The same trap hits fraud and anomaly detectors. When the thing you look for is rare, even an accurate model produces mostly false alarms. Look at precision on real data, as the lesson on measuring a model explains.

::fig ai-bayes | 1,000 people, one square each. Make the disease rarer and see what a positive test is worth.

## In models

- **Naive Bayes** classifiers apply Bayes' rule directly, assuming words are independent given the class. Simple and still useful for text.
- A **language model** computes `P(next token | all previous tokens)`: the whole text is a chain of conditional probabilities.
- **Bayesian** methods keep a whole distribution of beliefs about a model's settings, and update it with data.

## Remember

- P(A | B) is the probability of A among the cases where B is true.
- P(A | B) is not P(B | A). Do not confuse them.
- Bayes: posterior ∝ likelihood × prior.
- When the target is rare, even accurate tests give mostly false positives.

::quiz
? In a group, 50 people like tea, 20 of whom also like coffee. What is P(likes coffee | likes tea)?
+ 0.4
- 0.2
- 0.5
! Among the 50 tea drinkers, 20 like coffee: 20 / 50 = 0.4.
? A fraud model is 99% accurate, and fraud is 1 in 10,000 transactions. Most transactions it flags are probably…
+ Not fraud, because the many honest transactions produce more false alarms than there are real frauds
- Fraud
- Half fraud
! With a tiny prior, false positives from the honest majority outnumber the true positives.
::end
