---
minutes: 8
tech: []
refs:
  - islp: Ch. 3, “Linear Regression”
  - d2l: Section 3.1, “Linear Regression”
---
**Linear regression** predicts a number as a weighted sum of the inputs, plus a constant. It is the simplest useful model, it is still widely used, and it contains every part of machine learning in miniature: a model, parameters, a loss, and gradient descent. A neural network is, in a sense, many linear regressions stacked with bends between them.

## The model

With inputs x₁, x₂, …, the prediction is:

`ŷ = w₁x₁ + w₂x₂ + … + b`

Or, with vectors, a [dot product](/lesson/dot-product) plus a constant: `ŷ = w · x + b`.

- Each **weight** wᵢ says how much the prediction changes when input xᵢ goes up by one, with the others held still.
- The **bias** b is the prediction when all inputs are zero.

With one input, this is a straight line through the data: `ŷ = wx + b`.

## The loss

Use mean squared error from [Loss functions](/lesson/loss-functions): the average of (ŷ - y)² over the training examples. Training finds the w and b that make it smallest: the line that fits the points best, in the squared sense.

## Fitting it

Two ways:

- **A formula.** For linear regression with squared error, the best weights can be computed directly, in one step, with linear algebra. The problem is [convex](/lesson/convexity), so every method reaches the same lowest loss. With no two features that always move together, the best weights are also unique.
- **Gradient descent.** Start with any weights, and repeat: compute the gradient of the loss, step against it, as in [Gradient descent](/lesson/gradient-descent). For very large datasets this is often more practical.

For one input, the gradient for w is the average of `2(ŷ - y) × x`, and for b the average of `2(ŷ - y)`. Each step nudges the line towards the points that it misses most.

## A small example

House prices (in thousands) against size (in m²): (50, 150), (80, 210), (100, 250). The best line here is exactly `price = 2 × size + 50`: every point lies on it, and the loss is zero. Real data is never this tidy; the best line leaves some error, and the loss measures how much.

## Reading the weights

A great strength of linear regression is that you can read it. A weight of 2 on size means "each extra square metre adds about £2,000, holding the other inputs fixed". That is useful, with two warnings:

- It is a correlation in this data, not proof of cause.
- If two inputs are strongly related, such as size and number of rooms, their weights can be unstable and hard to interpret.

## Limits

The model can only draw straight lines (or flat planes). If the true relationship curves, you must add curved features, such as size², or use a more flexible model. [Logistic regression](/lesson/logistic-regression) adapts the same idea to predict probabilities.

## Remember

- Linear regression predicts a weighted sum of inputs plus a bias.
- Fit it by minimising mean squared error, with a formula or gradient descent.
- Its weights are readable, but show correlation, not cause.
- It draws only straight lines; curved patterns need new features or another model.

::quiz
? A model is `price = 3 × size + 20`. What does it predict for size 40?
+ 140
- 63
- 120
! 3 × 40 + 20 = 140.
? Why does linear regression with squared error always reach the same lowest loss?
+ Its loss is convex, so it has one lowest value
- Its data is always clean
- It has no weights
! A convex loss has a single valley, reached from any start.
::end
