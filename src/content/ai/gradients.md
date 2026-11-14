---
minutes: 7
tech: []
refs:
  - mml: Section 5.2, “Partial Differentiation and Gradients”, and Section 5.3, “Gradients of Vector-Valued Functions”
  - dlbook: Section 4.3, “Gradient-Based Optimization”
---
The **gradient** puts all the [partial derivatives](/lesson/partial-derivatives) of a function into one vector. It points in the direction in which the function rises fastest, and its length says how steep that rise is. Turn round, step the other way, and you go downhill as fast as possible. That is how almost every model learns.

## Building it

For `f(x, y) = x² + 3xy`, the partial derivatives were `2x + 3y` and `3x`. The gradient, written ∇f, stacks them:

`∇f = [2x + 3y, 3x]`

At x = 1, y = 2, it is `[8, 3]`.

For a model with a million weights, the gradient of the loss is a vector with a million components: one for each weight.

## Steepest uphill

On a hillside, many directions lead up, but one leads up most steeply. The gradient points that way. Its length is the steepness in that direction.

- A long gradient: a steep slope. Small changes to the inputs change the output a lot.
- A short gradient: a gentle slope.
- A zero gradient: flat ground. A minimum, a maximum, or a saddle, which goes up in some directions and down in others.

Why does the gradient point uphill most steeply? The change in f for a small step d is about the [dot product](/lesson/dot-product) `∇f · d`. For a step of fixed length, a dot product is largest when the step points the same way as the gradient.

## Going downhill

To make the function smaller, step in the opposite direction, `-∇f`:

`new position = old position - (step size) × ∇f`

For a model, the position is all the weights, and the function is the loss. Each step changes every weight a little, each in proportion to its own partial derivative: weights the loss is very sensitive to change more. Repeat thousands of times, and the loss falls. This is [gradient descent](/lesson/gradient-descent), on the Optimisation line.

## Level lines

A contour map of a hill draws lines of equal height. The gradient at any point is at a right angle to the contour line through it: it points straight up the hill, never along it. Walking along a contour, perpendicular to the gradient, keeps you at the same height.

> **For new readers.** The symbol ∇ is called "nabla" or "del". ∇f is read "the gradient of f". In machine learning code it often appears as `grad`, as in `loss.backward()` filling each weight's `.grad`.

## Remember

- The gradient is the vector of all partial derivatives.
- It points in the direction of steepest increase; its length is the steepness.
- Stepping against the gradient lowers the function fastest.
- A model's loss gradient has one component per weight; training steps against it.

::quiz
? The gradient of a loss at the current weights is `[0.5, -2.0]`. Which change to the weights lowers the loss fastest, for a small step?
+ Decrease the first weight a little and increase the second weight more
- Increase both weights
- Decrease both weights equally
! Step against the gradient: -[0.5, -2.0] = [-0.5, 2.0]. The second weight moves more, because the loss is more sensitive to it.
? The gradient of a function is the zero vector at a point. What can you say?
+ The point is flat: it may be a minimum, a maximum or a saddle
- It is the global minimum
- The function is constant everywhere
! A zero gradient only means no slope in any direction at that point.
::end
