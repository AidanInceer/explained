---
minutes: 9
tech: []
refs:
  - islp: Section 4.4.2, on confusion matrices, sensitivity and specificity, and the ROC curve
  - mlsys: Ch. 6, “Model Development and Offline Evaluation”
---
"The model is 98% accurate" can mean an excellent model, or a useless one. If 98% of emails are not spam, a model that never flags anything is 98% accurate and catches no spam at all. To know whether a model is good, you need the right **measure** for the task, and to know what each kind of mistake costs.

## The confusion matrix

For a yes-or-no classifier, every prediction falls into one of four boxes:

| | Truly yes | Truly no |
|---|---|---|
| **Predicted yes** | True positive (TP) | False positive (FP) |
| **Predicted no** | False negative (FN) | True negative (TN) |

Every common measure comes from these four counts.

## The main measures

- **Accuracy**: (TP + TN) / all. The share that is right. Misleading when one class is rare.
- **Precision**: TP / (TP + FP). Of the cases the model flagged, how many were real? High precision means few false alarms.
- **Recall** (sensitivity): TP / (TP + FN). Of the real cases, how many did the model find? High recall means few misses.
- **F1 score**: the harmonic mean of precision and recall, `2PR / (P + R)`. One number that is high only when both are.

## An example

1,000 transactions, 10 are fraud. The model flags 20; 8 of those are real fraud.

- TP = 8, FP = 12, FN = 2, TN = 978.
- Accuracy = 986 / 1000 = 98.6%.
- Precision = 8 / 20 = 40%.
- Recall = 8 / 10 = 80%.

It catches 80% of fraud, and 60% of its alarms are false. Whether that is good depends on the cost of a missed fraud against the cost of checking a false alarm.

## Precision against recall

Most classifiers output a probability, and a threshold turns it into yes or no, as in [Logistic regression](/lesson/logistic-regression):

- **Lower the threshold**: flag more. Recall rises, precision falls.
- **Raise it**: flag less. Precision rises, recall falls.

The **ROC curve** and the **precision–recall curve** show this trade-off for every threshold. The **area under the ROC curve** (AUC) summarises how well the model ranks positives above negatives, whatever the threshold: 0.5 is random, 1.0 is perfect.

::fig ai-threshold | 200 payments, 30 of them fraud. Move the threshold and watch precision and recall.

## For numbers

For regression: **mean absolute error** (in the units of the target, easy to explain), **root mean squared error** (punishes large errors), and **R²** (the share of variation the model explains). For forecasts, compare against a simple baseline, such as "same as last week".

## Choose before you measure

- Decide which mistakes are worse, in money, risk or harm.
- Pick a measure that reflects that, and a threshold to match.
- Always compare with a **baseline**: always predict the majority class, or a simple rule. A model that cannot beat the baseline is not useful.
- Measure on each important group, not only overall. A model can be accurate overall and poor for a minority.

## Remember

- Accuracy misleads when classes are unbalanced.
- Precision: how many alarms are real. Recall: how many real cases are found. F1 combines them.
- The threshold trades precision against recall; ROC and AUC describe all thresholds.
- Choose measures from the cost of each mistake, and beat a baseline.

::quiz
? A model flags 50 emails as spam; 45 are spam. There were 90 spam emails in total. What are precision and recall?
+ Precision 90%, recall 50%
- Precision 50%, recall 90%
- Both 90%
! Precision = 45 / 50 = 90%. Recall = 45 / 90 = 50%.
? A disease is in 1% of people. A model always predicts "healthy". What is its accuracy, and is it useful?
+ 99%, and useless: its recall is zero
- 1%, and useless
- 99%, and very useful
! Accuracy hides the failure on the rare class. Recall shows that it finds no cases.
::end
