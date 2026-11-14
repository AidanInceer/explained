---
minutes: 7
tech: []
refs:
  - mml: Section 5.2, “Partial Differentiation and Gradients”
---
A model's error does not depend on one setting. It depends on millions of them. A **partial derivative** asks the question of [Derivatives](/lesson/derivatives) about one input at a time: if I nudge only this one, and hold every other input still, how fast does the output change?

## One input at a time

Take a function of two inputs:

`f(x, y) = x² + 3xy`

To find the partial derivative with respect to x, treat y as a fixed number and differentiate as usual:

`∂f/∂x = 2x + 3y`

For y, treat x as fixed:

`∂f/∂y = 3x`

The curly ∂ ("partial") marks that the other inputs are held still.

At the point x = 1, y = 2:

- `∂f/∂x = 2 + 6 = 8`: nudging x up raises f by about 8 times the nudge.
- `∂f/∂y = 3`: nudging y up raises f by about 3 times the nudge.

So at this point, f is more sensitive to x than to y.

## A picture

Think of the function as a landscape: x and y are positions on the ground, and f is the height. The partial derivative with respect to x is the slope if you walk due east. With respect to y, the slope if you walk due north. Each one describes the hill in one direction only.

## Why models need them

A model's error depends on every weight. For each weight, the partial derivative of the error says:

- whether increasing that weight would raise or lower the error, and
- how strongly the error responds to it.

With that information for every weight, you can nudge all of them at once in the direction that lowers the error. Collected into one vector, the partial derivatives form the [gradient](/lesson/gradients), the subject of a later lesson on this line.

## Computing them at scale

For a model with a billion weights, you need a billion partial derivatives at every training step. Computing each one separately would be hopeless. The **chain rule**, the next lesson, together with automatic differentiation, computes all of them in about the time of two passes through the model. That method is backpropagation.

> **For new readers.** "With respect to" just means "which input are we nudging". You will read "the gradient of the loss with respect to the weights" very often. It means: how the error responds to each weight.

## Remember

- A partial derivative nudges one input and holds the rest still.
- Treat the other inputs as constants, then differentiate as usual.
- Each partial derivative is the slope in one direction of a many-dimensional landscape.
- A model needs one for every weight; together they form the gradient.

::quiz
? For `f(x, y) = 4x + y²`, what is `∂f/∂y` at x = 10, y = 3?
- 4
+ 6
- 40
! Treat x as a constant: the 4x term does not change with y. The derivative of y² is 2y = 6.
? What does a large partial derivative of the error with respect to one weight mean?
+ The error is very sensitive to that weight at the current point
- The weight is large
- The weight should be removed
! It measures how strongly the error responds to small changes in that weight, here and now.
::end
