---
minutes: 8
tech: []
refs:
  - islp: Ch. 2, “Statistical Learning”, Section 2.1
  - dlbook: Section 5.1, “Learning Algorithms”
---
In ordinary programming, a person writes the rules: "if the email contains these words, mark it as spam". In **machine learning**, a person writes a model with adjustable settings and a way to measure mistakes, and the computer finds the rules from examples. This lesson names the three parts that every learning system has.

## Three parts

1. **A model**: a [function](/lesson/math-functions) from inputs to outputs, with adjustable numbers called **parameters** (or weights). For example, `price = w₁ × size + w₂ × rooms + b`.
2. **Data**: examples of inputs, often with the correct outputs. A thousand houses with their real prices.
3. **A loss**: one number that measures how wrong the model is on the data. Lower is better.

**Learning** means: change the parameters to make the loss small. Usually with [gradient descent](/lesson/gradient-descent).

That is all. Linear regression and a large language model differ in the size of the model, the amount of data and the kind of loss. They follow the same recipe.

## Why learn from data

Some rules are easy to write. Many are not:

- Recognising a face in a photo.
- Translating a sentence.
- Predicting which customers will cancel.

Nobody can write those rules by hand, but there are plenty of examples. Machine learning turns examples into rules.

## What "learning" does and does not mean

A trained model has found parameters that fit its training data. The goal is that it also works on **new** data from the same kind of source. That is called **generalisation**, and it is not guaranteed:

- A model can memorise its examples and fail on anything new, as the lesson on overfitting explains.
- A model only knows patterns in its data. If the data is biased or out of date, so is the model.
- A model finds correlations, not causes. "People who buy umbrellas get wet" is a pattern, not a reason.

## Parameters and hyperparameters

- **Parameters** are learned from data: the weights.
- **Hyperparameters** are chosen by people before training: the size of the model, the learning rate, how long to train. Choosing them well is much of the practical work, as the lesson on hyperparameters covers.

## When not to use it

If you can write the rule clearly, write it. A rule is cheaper, faster, easier to test and easier to explain. Machine learning earns its cost where the rules are too complex to write, and examples are plentiful.

## Remember

- Every learning system has a model with parameters, data, and a loss.
- Learning means adjusting parameters to lower the loss, usually by gradient descent.
- The goal is generalisation to new data, which is not guaranteed.
- Parameters are learned; hyperparameters are chosen. Use rules where rules are enough.

::quiz
? Which is a parameter, not a hyperparameter?
+ A weight in the model, adjusted during training
- The learning rate
- The number of layers
! Parameters are learned from data. Hyperparameters are set before training.
? A team can write a simple, exact rule for a task. Should they train a model instead?
+ Usually not: a clear rule is cheaper, more predictable and easier to explain
- Yes, models are always better
- Yes, if they have a GPU
! Use machine learning where rules are too complex to write.
::end
