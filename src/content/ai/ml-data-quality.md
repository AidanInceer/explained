---
minutes: 8
tech: []
refs:
  - mlsys: Ch. 5, “Feature Engineering”, section on data leakage
  - labelerrors: Whole paper
  - gpt3: Section 4, “Measuring and Preventing Memorization Of Benchmarks”
---
A model trained on dirty data learns the dirt. Duplicates, wrong labels, broken records and, worst of all, test answers hidden in the training data make results look better or worse than they are. Checking data quality is less exciting than training models, and it usually matters more.

## Common problems

- **Duplicates and near-duplicates.** The same review copied many times, the same image at two sizes. The model over-weights them, and if copies land in both training and test sets, scores are inflated.
- **Wrong labels.** As [Labels and labelling](/lesson/labelling) showed, even benchmarks have them.
- **Missing values**, recorded as blanks, zeros or "N/A" in different places. A zero that means "unknown" is not the same as a real zero.
- **Inconsistent formats**: dates in two styles, prices in two currencies, units mixed.
- **Outliers**: some are errors (a person aged 412); some are the most important cases (a real fraud). Look before you remove.
- **Stale data**: records that no longer reflect reality.

## Leakage

**Leakage** means the model gets information during training that it would not have in real use, as [Train, validation and test](/lesson/train-test) introduced. Forms to watch:

- **Target leakage**: a feature that is a consequence of the answer. Using "account closed date" to predict whether a customer will leave.
- **Train–test contamination**: the same or near-identical examples on both sides of the split.
- **Benchmark contamination**: for large language models, test questions from public benchmarks may already be in the web data they were pretrained on. A model can then "answer" by memory. Teams search training data for benchmark text, and prefer new, private test sets.
- **Time leakage**: using data from after the moment of prediction.

The sign of leakage is a score that is too good to be true, followed by disappointment in production.

## Checks that catch most problems

1. **Count and profile**: rows, missing values per column, ranges, distinct values.
2. **Look for duplicates**, including near-duplicates, with hashing or embeddings.
3. **Check splits** for overlap of items, users and time.
4. **Read samples** from each class and each source.
5. **Train a quick, simple model** and look at the examples it gets most wrong. Many are label errors.
6. **Ask, for each feature**: would we know this at the moment of prediction?

> **For experienced readers.** The data engineering lessons on [data quality and testing](/lesson/data-quality) cover automated checks in pipelines. The same ideas apply to training data.

## Remember

- Dirty data teaches the model the dirt: duplicates, wrong labels, missing and mixed values.
- Leakage gives information that real use would not have. Too-good scores are the warning.
- Benchmark contamination is a real risk for large pretrained models.
- Profile, de-duplicate, check splits, read samples, and inspect the worst errors.

::quiz
? A churn model uses the feature "number of days since the account was closed". What is wrong?
+ Target leakage: the feature only exists after the customer has already left
- The feature is not numeric
- Nothing
! The model would not know this at prediction time. It leaks the answer.
? Why are new, private test sets increasingly used to evaluate large language models?
+ Public benchmark questions may be in the web data the models were trained on
- Private sets are easier
- Public benchmarks are too small
! Contamination lets a model answer from memory, inflating its score.
::end
