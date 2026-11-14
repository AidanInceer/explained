---
minutes: 8
tech: []
refs:
  - islp: Ch. 8, “Tree-Based Methods”
  - esl: Ch. 10, “Boosting and Additive Trees”, and Ch. 15, “Random Forests”
---
A **decision tree** predicts by asking a series of yes-or-no questions about the input: "Is income above £40,000? Is the account older than two years?" Each answer leads to the next question, until a leaf gives the prediction. One tree is easy to read and easy to overfit. Many trees combined, as **random forests** or **gradient boosting**, are among the most accurate methods for tables of data, often beating neural networks there.

## A single tree

```
Is the account under 30 days old?
├── yes: Is the amount over £500?
│        ├── yes: fraud (likely)
│        └── no:  not fraud
└── no:  not fraud
```

To predict, follow the questions from the top. Each **leaf** holds an answer: the most common class among training examples that reached it, or their average value for regression.

## Growing a tree

The tree is built from the top, one question at a time. At each step, the algorithm tries every feature and every split point, and picks the question that makes the two groups **purest**: for classification, the split that reduces [entropy](/lesson/entropy) or a similar impurity measure the most; for regression, the split that reduces squared error most. It repeats in each group until the groups are pure, or too small, or a depth limit is reached.

## Strengths and weaknesses

- **Readable**: you can follow and explain every decision.
- **Handles mixed data**: numbers and categories, without scaling, as [Features and representations](/lesson/features) needed for other models.
- **Captures interactions**: "large amount *and* new account" is natural for a tree.
- **Overfits easily**: grown deep, a tree carves out a leaf for every odd example. Small changes in the data can give a very different tree: high variance, as in [Overfitting, bias and variance](/lesson/overfitting).

## Random forests

Train hundreds of trees, each on a random sample of the data, and at each split consider only a random subset of the features. Then let them **vote** (or average). Each tree overfits in its own way; their errors largely cancel. The forest keeps the trees' flexibility and loses most of their variance. Random forests work well with little tuning.

## Gradient boosting

Train trees **one after another**. Each new tree is small, and is trained to correct the errors that the trees so far still make. The final prediction adds up all the trees. Libraries such as XGBoost, LightGBM and CatBoost implement this, and they are a common winning choice for tabular data in practice and in competitions.

> **In practice.** For a table of customers, transactions or sensor readings, try gradient-boosted trees before a neural network. They train fast, need little preparation, and are often more accurate.

## Remember

- A decision tree predicts with a chain of yes-or-no questions, each chosen to make the groups purest.
- Single trees are readable and handle mixed data, but overfit and are unstable.
- Random forests average many varied trees to cut variance.
- Gradient boosting adds small trees that each fix the remaining errors; it is strong for tabular data.

::quiz
? Why does a random forest usually generalise better than one deep tree?
+ Averaging many trees trained on different samples cancels much of each tree's own overfitting
- Each tree in the forest is deeper
- Forests do not use the training data
! The trees' errors differ, so voting reduces variance.
? For a table of 50,000 customers with 30 numeric and category columns, what is a strong first choice?
+ Gradient-boosted trees
- A large transformer
- A single linear regression with no features
! Boosted trees are usually accurate and quick on tabular data, with little preparation.
::end
