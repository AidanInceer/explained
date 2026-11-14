---
minutes: 7
tech: []
refs:
  - islp: Section 2.2, “Assessing Model Accuracy”, and Section 5.2, “The Bootstrap”
  - dlbook: Section 5.4, “Estimators, Bias and Variance”
---
You can never see all the data in the world: every email that will ever be sent, every patient, every sentence. You see a **sample**, and you use it to **estimate** something about the whole: the average, a model's accuracy, the effect of a change. Two questions always follow: is the sample representative, and how much would the estimate change with a different sample?

## Population and sample

- The **population** is everything you care about: all your users, all possible inputs.
- A **sample** is the part you actually have.
- An **estimate** is a number computed from the sample, meant to approximate the population's true value.

A model's accuracy on a test set is an estimate of how it will do on all future inputs.

## Representative samples

An estimate is only as good as the sample:

- **Random** samples give every member of the population an equal chance to be included. Then errors are only chance, and shrink with size.
- **Biased** samples over- or under-represent some groups. Then errors do not shrink with size. A million examples from one country do not tell you about another.

Many failures of AI systems come from training or test samples that were not like the real users: faces mostly of one skin tone, text mostly in one language, data from before a change in behaviour.

## How much the estimate wobbles

Take a different random sample, and you get a slightly different estimate. The **standard error** measures that wobble. For an average of n independent values, it is the standard deviation of one value divided by √n, as [Expectation and variance](/lesson/expectation) showed.

**Example.** A model is right on 900 of 1,000 test examples: 90%. The standard error of that is about √(0.9 × 0.1 / 1000) ≈ 0.95 percentage points. So the true accuracy is plausibly anywhere from about 88% to 92%. A rival model with 91% on the same test set is not clearly better.

## The bootstrap

When there is no neat formula, resample. Draw many new samples of the same size from your sample, with replacement, compute the estimate on each, and look at how much they vary. This **bootstrap** gives an error range for almost anything, such as an F1 score or a median, at the cost of computing.

> **Pitfall.** Small test sets give noisy numbers. Before you claim that one model beats another by half a point, check whether the difference is larger than the wobble.

## Bias and variance of an estimator

An estimator, the rule that turns a sample into an estimate, can be wrong in two ways:

- **Bias**: on average, it misses the true value in one direction.
- **Variance**: it scatters widely from sample to sample.

The same two words describe models, in the lesson on overfitting, bias and variance.

## Remember

- A sample stands in for a population; an estimate approximates the true value.
- Random samples give errors that shrink with size; biased samples do not.
- The standard error shrinks with √n. Use it to judge whether differences are real.
- The bootstrap gives error ranges by resampling.

::quiz
? A test set has 200 examples, and model A scores 81% while model B scores 80%. What can you conclude?
+ Probably not that A is better: the difference is well within the wobble of 200 examples
- A is clearly better
- B is clearly better
! With 200 examples, the standard error is about 3 points. A one-point gap is not evidence.
? A sentiment model is tested only on film reviews, then used on medical notes. What is the problem?
+ The test sample does not represent the population where the model is used
- The test set is too large
- Medical notes have no sentiment
! An estimate holds for the population the sample came from.
::end
