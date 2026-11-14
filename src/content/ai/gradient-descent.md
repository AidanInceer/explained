---
minutes: 8
tech: []
refs:
  - dlbook: Section 4.3, “Gradient-Based Optimization”
  - d2l: Section 12.3, “Gradient Descent”
---
**Gradient descent** is the method that trains nearly every model in modern AI. It is simple: compute which way is downhill on the [loss landscape](/lesson/loss-landscape), take a small step that way, and repeat until the loss stops falling. Everything else on this line is a refinement of this one idea.

## The update

For the weights w, the loss L, and a step size η (the **learning rate**):

`w ← w - η × ∇L(w)`

Each weight moves against its own partial derivative, as [Gradients](/lesson/gradients) explained: weights the loss is sensitive to move more, and in the direction that lowers the loss.

## A worked example

Minimise `L(w) = (w - 3)²`. The best w is clearly 3. The derivative is `2(w - 3)`. Start at w = 0, with η = 0.25:

| Step | w | Gradient 2(w - 3) | New w |
|---|---|---|---|
| 1 | 0 | -6 | 0 + 1.5 = 1.5 |
| 2 | 1.5 | -3 | 1.5 + 0.75 = 2.25 |
| 3 | 2.25 | -1.5 | 2.625 |
| 4 | 2.625 | -0.75 | 2.8125 |

Each step halves the distance to 3. The steps get smaller by themselves, because the slope gets gentler near the bottom.

## The loop that trains a model

1. Run the model on training data and compute the loss.
2. Compute the gradient of the loss with respect to every weight, with backpropagation.
3. Update every weight by the rule above.
4. Repeat, many thousands of times.

In code, the core of this is a few lines: compute the loss, call backward, call the optimiser's step. The lesson on the training loop shows it.

## When to stop

- The loss on training data stops falling.
- Or, better, the loss on **validation** data, which the model does not train on, stops improving, as the lesson on train, validation and test explains. Training longer than that often makes the model memorise.

## What can go wrong

- **Step too large**: it overshoots the valley, bounces, or diverges to huge losses.
- **Step too small**: progress is painfully slow.
- **Flat regions and saddles**: the gradient is tiny, and progress stalls.
- **Ravines**: steps zig-zag across a narrow valley.

The next lessons address each one: the [learning rate](/lesson/learning-rate), [stochastic gradient descent](/lesson/sgd), and [momentum and Adam](/lesson/momentum-adam).

> **For experienced readers.** Plain gradient descent over the whole dataset is called **batch** gradient descent. In practice almost nobody uses it for large models; they use mini-batches, which are cheaper and, oddly, often generalise better.

## Remember

- Gradient descent: w ← w - η ∇L. Step against the gradient, repeat.
- Steps shrink near the bottom as the slope flattens.
- The training loop: loss, gradients, update, repeat.
- Stop when validation loss stops improving. Watch the step size.

::quiz
? With `L(w) = (w - 5)²`, w = 1 and a learning rate of 0.1, what is the next w?
+ 1.8
- 0.2
- 5
! The gradient is 2(1 - 5) = -8. The update is 1 - 0.1 × (-8) = 1.8.
? The loss jumps to enormous values after a few steps. What is the likely cause?
+ The learning rate is too large, so steps overshoot
- The learning rate is too small
- The data is too clean
! Steps that are too big jump past the valley and climb the other side, further each time.
::end
