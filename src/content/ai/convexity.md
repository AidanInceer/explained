---
minutes: 7
tech: []
refs:
  - dlbook: Section 4.4, “Constrained Optimization”, and Section 8.2.2, “Local Minima”
  - esl: Section 4.4, “Logistic Regression”, on its convex fitting problem
---
Some optimisation problems are easy in a precise sense: any downhill path reaches the best answer. These are **convex** problems. Most of classic machine learning is convex. Deep learning is not, and yet it works. Knowing the difference explains why some methods come with guarantees and others come with tricks.

## What convex means

A function is **convex** if the straight line between any two points on its graph lies on or above the graph. A bowl is convex. A landscape with two valleys is not.

For a convex function:

- There is only one valley. Every **local minimum is the global minimum**.
- [Gradient descent](/lesson/gradient-descent) with a suitable step size will reach it, from any starting point.
- You can often prove how many steps it takes.

## Convex problems in machine learning

- **Linear regression** with squared error: a bowl-shaped loss. It even has an exact formula for the answer.
- **Logistic regression** with cross-entropy: convex, so training always finds the best weights.
- **Support vector machines**: convex.

For these, a training method either finds the best answer or tells you it has not converged yet. Different runs reach the same weights.

## Non-convex problems

A neural network with even one hidden layer has a non-convex loss. There can be many valleys, saddles and plateaus, as [Loss landscapes](/lesson/loss-landscape) described. Consequences:

- **No guarantee** of finding the global minimum.
- **The start matters.** Different random initial weights reach different solutions.
- **The path matters.** The learning rate, batch size and optimiser change where training ends up.

## Why deep learning works anyway

In very high dimensions, with many more weights than strictly needed:

- Most points with zero gradient are **saddles**, not bad minima, and noisy gradient steps tend to slip off saddles.
- The local minima that training finds usually have losses close to the best possible.
- There are huge connected regions of good solutions.

So the practical goal is not "the global minimum". It is "a low point that works well on new data". That is a matter of good settings and checking on validation data, not of a proof.

> **For new readers.** "Convex" is a property of the loss as a function of the weights, not of the data or the model's shape. A model can draw curved decision boundaries and still have a convex training problem, if it is linear in its weights.

## Remember

- Convex: one valley; every local minimum is global; gradient descent finds it.
- Linear and logistic regression are convex; neural networks are not.
- Non-convex training depends on the start and the path, with no guarantee.
- In high dimensions, most stalls are saddles, and the minima found are usually good.

::quiz
? A logistic regression is trained twice from different random starts. What should you expect?
+ The same weights, because the problem is convex
- Very different weights each time
- Training fails the second time
! Convex problems have one minimum, reached from any start.
? Why does a neural network trained twice with different seeds give different weights?
+ Its loss is non-convex, so different starts reach different low points
- Random seeds change the training data
- It is a bug
! Many valleys exist. The start and the path decide which one training settles in.
::end
