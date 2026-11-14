---
minutes: 7
tech: []
refs:
  - udl: Ch. 6, “Fitting Models”, and Ch. 20, “Why Does Deep Learning Work?”
  - dlbook: Section 8.2, “Challenges in Neural Network Optimization”
---
A model's error depends on all of its settings at once. Picture each possible combination of settings as a point on the ground, and the error there as the height. That gives a surface: the **loss landscape**. Training is a search for a low point on it, usually without ever seeing the whole thing.

## One setting, then two

A model with one weight w has a loss curve: loss up, w across. Often a U shape with the best w at the bottom.

With two weights, the loss is a surface over a plane, like a map of hills and valleys. A good setting is the bottom of a valley.

A real network has millions or billions of weights, so its landscape has that many dimensions. Nobody can picture it, but the hill-and-valley words still apply, and [Many dimensions](/lesson/dimensions) warned how strange such spaces are.

## What you can know about it

You cannot map the whole landscape: even checking ten values per weight for a million weights would take 10^1,000,000 evaluations. But at the current point you can compute:

- The **loss**: your height.
- The **gradient**: the direction of steepest climb and how steep it is, from [Gradients](/lesson/gradients).

That is like standing on a hillside in thick fog with only a spirit level. The natural strategy is to step downhill, look again, and repeat: the next lesson, [Gradient descent](/lesson/gradient-descent).

## Features of the terrain

- **Minima**: points lower than everything around them. The lowest of all is the **global minimum**; others are **local minima**.
- **Saddle points**: down in some directions, up in others, like a mountain pass. The gradient there is zero, so a naive method can slow to a crawl. In high dimensions, saddles are far more common than poor local minima.
- **Plateaus**: wide, flat regions with tiny gradients, where training seems to stall.
- **Narrow valleys and ravines**: steep in one direction, gentle in another. Steps bounce from side to side instead of moving along the valley floor.
- **Cliffs**: sudden steep walls where a gradient step can throw the weights far away.

## What deep learning found

For large neural networks, the landscape is friendlier than once feared. Many different low points reach similar, good losses. The practical problems are more often plateaus, saddles, ravines and the size of the steps than being trapped in a bad local minimum.

There is also a link to generalisation: low points in wide, flat valleys tend to work better on new data than those in narrow, sharp ones, because small changes to the weights do not change the predictions much.

> **For new readers.** The landscape changes with the data. Each batch of examples gives a slightly different surface, which is part of why stochastic gradient descent, later on this line, behaves as it does.

## Remember

- The loss landscape is the error as a surface over all the settings of a model.
- You only see your local height and slope, so training steps downhill and looks again.
- The terrain has minima, saddles, plateaus, ravines and cliffs.
- For large networks, many low points are good; flat valleys tend to generalise better.

::quiz
? Why can't you just evaluate the loss everywhere and pick the lowest point?
+ There are far too many combinations of settings: the space has millions of dimensions
- The loss cannot be computed
- The lowest point is always zero
! Even a coarse grid over a million weights has more points than could ever be computed.
? At a saddle point, what is the gradient?
+ Zero, although the loss goes down in some directions
- Very large
- Always negative
! A saddle is flat at its centre, so the gradient is zero even though downhill directions exist.
::end
