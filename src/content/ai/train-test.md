---
minutes: 8
tech: []
refs:
  - islp: Section 5.1, “Cross-Validation”, opening, on the validation set approach
  - mlsys: Ch. 4, “Training Data”, on data splits and leakage
---
A model that scores 99% on the data it was trained on may score 60% on anything new. The only way to know how it will do on new data is to test it on data it has never seen. So before training, you set some data aside. How you split the data decides whether your results mean anything.

## Three sets

- **Training set**: the model learns its parameters from this. Typically most of the data.
- **Validation set**: used during development to choose hyperparameters, compare models and decide when to stop training. The model does not train on it, but your decisions are shaped by it.
- **Test set**: used once, at the end, to estimate how the final model will do in the real world. Not used for any decision.

A common split is about 80% / 10% / 10%, though with very large datasets a few thousand examples may be enough for validation and test.

## Why a separate test set

Each time you look at validation results and change something, you fit your choices a little to the validation set. Do this a hundred times and the validation score becomes optimistic, as [Significance and confidence](/lesson/significance) warned about tuning on the test set. A test set that no decision has touched gives an honest final number.

> **Rule of thumb.** If you look at the test set, then change the model, it is no longer a test set. Get a new one, or accept that your number is optimistic.

## Split the right way

A random split works when examples are independent. Often they are not:

- **Time.** To predict the future, train on the past and test on later data. A random split lets the model see the future during training, and its score will be far too high.
- **Groups.** If one patient has 50 scans, put all of them on the same side of the split. Otherwise the model can recognise the patient, not the disease.
- **Duplicates.** Near-identical examples, such as the same web page copied, must not appear in both sets.

## Leakage

**Data leakage** is when information that would not be available in real use gets into training, or into the features:

- A feature that is recorded only after the outcome: "was refunded" used to predict fraud.
- Preparing data (scaling, filling gaps) using statistics from all data, including the test set, as [Features and representations](/lesson/features) warned.
- Test examples that also appear in a model's pretraining data, which is a real problem for public benchmarks.

Leakage gives brilliant test scores and disappointing real results. When results look too good, suspect leakage first.

## The test set must look like real use

The test set should come from the same kind of source and time as the data the model will meet in production. A test on clean, old, easy data overstates real performance.

## Remember

- Train on one set, tune on a validation set, report once on a test set.
- Every decision based on a set makes its score optimistic.
- Split by time, by group, and without duplicates when examples are not independent.
- Watch for leakage, and make the test set look like real use.

::quiz
? A model predicts next month's sales. The data is split at random across five years. What is the problem?
+ The model trains on later data than some test examples, so it effectively sees the future
- Random splits are always correct
- The test set is too small
! For forecasts, train on the past and test on later periods.
? A model scores 99.8% on a medical test set, far above published results. What should you check first?
+ Leakage, such as the same patients or duplicate images on both sides of the split
- Nothing: celebrate
- The learning rate
! Results that look too good are often caused by information leaking from test into training.
::end
