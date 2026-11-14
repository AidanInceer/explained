---
minutes: 7
tech: []
refs:
  - islp: Section 5.1, “Cross-Validation”
---
A single validation set gives one estimate of a model's quality, and with small datasets that estimate is noisy: a different split could give a quite different number. **Cross-validation** uses all the data for validation, one part at a time, and averages the results. It gives a steadier estimate, and a sense of how much it varies.

## K-fold cross-validation

1. Split the training data into k equal parts, called **folds**. Five or ten is common.
2. For each fold in turn: train on the other k - 1 folds, and measure on this one.
3. Average the k scores. Their spread shows how stable the estimate is.

Every example is used for validation exactly once, and for training k - 1 times.

**Example.** 1,000 examples, 5 folds. Five models, each trained on 800 and tested on a different 200. Scores of 81%, 79%, 84%, 80% and 82% give an average of 81.2%, and tell you that a single split could easily have said 79% or 84%.

## What it is for

- **Choosing between models or hyperparameters**: compare their cross-validated scores. Less risk of picking one that was lucky on one split.
- **Small datasets**: when you cannot spare many examples for a fixed validation set.
- **Judging stability**: a large spread across folds means the model depends a lot on which data it saw.

After choosing, train the final model on all the training data, and check it once on the separate test set, as [Train, validation and test](/lesson/train-test) explained.

## The cost

You train k models instead of one. For classic models on modest data, that is fine. For a large neural network trained for days, it is usually too expensive, and a single, large validation set is used instead.

## Split correctly in each fold

The same rules as any split apply:

- **Groups**: keep all examples from one patient, user or document in one fold (**group k-fold**).
- **Time**: for forecasts, each fold must train on the past and validate on the future (**time-series split**), never the other way round.
- **Rare classes**: keep the share of each class similar in every fold (**stratified k-fold**).
- **Preparation inside the loop**: fit scaling, feature selection and other steps on the training folds only, inside each round. Otherwise the validation fold leaks into training.

> **Pitfall.** Cross-validation used to pick from hundreds of options still overfits to the data, just more slowly. Keep a final test set that no decision has touched.

## Remember

- K-fold: train on k - 1 parts, validate on the last, rotate, and average.
- It gives steadier estimates and shows their spread, especially for small data.
- It costs k trainings, often too much for large neural networks.
- Respect groups, time and rare classes in each fold, and prepare data inside the loop.

::quiz
? With 10-fold cross-validation, how many times is each example used for validation?
+ Once
- Ten times
- Never
! Each example belongs to exactly one fold, which is validated once.
? A forecasting model is cross-validated with randomly shuffled folds. What is wrong?
+ Folds train on future data to predict the past, so scores are too optimistic
- Nothing
- The folds are too large
! Time-series data needs folds that always train on the past and validate on later periods.
::end
