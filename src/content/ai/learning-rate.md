---
minutes: 7
tech: []
refs:
  - dlbook: Section 8.3.1, “Stochastic Gradient Descent”, on learning rate schedules
  - d2l: Section 12.11, “Learning Rate Scheduling”
---
The **learning rate** is the size of each step in [gradient descent](/lesson/gradient-descent). It is often the single most important setting in training. Too small, and training crawls or stalls. Too large, and it overshoots, bounces around, or blows up. Good training usually changes it over time.

## What it controls

The update is `w ← w - η × gradient`. The learning rate η scales every step:

- **Too small**: each step barely moves. Loss falls very slowly, and training may stop on a plateau long before it is done.
- **About right**: loss falls steadily, quickly at first, then more slowly.
- **Too large**: steps overshoot the valley floor. The loss jumps up and down, or rises without limit, often ending in `NaN` (not a number) when values overflow.

In the example from the last lesson, minimising `(w - 3)²`: a learning rate of 0.25 halved the distance each step. A rate of 1.0 would jump from 0 to 6, then back to 0, for ever. A rate above 1.0 would move further away each step.

::fig ai-descent | Try learning rates of 0.1, 0.5, 0.9 and 1.05 on the bowl. Above 1, each step overshoots further than the last.

## Finding a good value

Typical starting points depend on the optimiser: around 0.1 to 0.01 for plain stochastic gradient descent, and around 0.001 to 0.0001 for Adam. But each problem differs.

A practical method, the **learning rate range test**: train for a short time while raising the learning rate a little every step, from very small to large. Plot the loss. The best rate is usually a bit below the point where the loss falls fastest, well before it starts to rise.

## Schedules

A single fixed rate is rarely best. Common **schedules**:

- **Warm-up**: start with a small rate and raise it over the first few hundred or thousand steps. At the start, weights are random and gradients can be wild; big steps then can wreck training. Large models almost always use warm-up.
- **Decay**: lower the rate as training goes on, so the model settles into a valley instead of bouncing round it. Step decay (divide by 10 at set points), linear decay, or **cosine decay**, which lowers it smoothly along a half cosine curve.

A common recipe for large models: linear warm-up, then cosine decay to a small value by the end.

## Signs in the loss curve

- Loss flat from the start: rate too small, or something else is broken.
- Loss falls, then jumps and spikes: rate too large, at least for that phase.
- Loss falls and levels off early, then falls again after a decay step: the rate was limiting progress.

The lesson on reading loss curves goes into this in more detail.

> **Pitfall.** When you change the batch size, the best learning rate usually changes too. Larger batches give less noisy gradients and often allow a larger rate.

## Remember

- The learning rate scales every step. Too small crawls; too large diverges.
- Starting values depend on the optimiser. Test a range briefly to choose.
- Warm up at the start, then decay. Linear warm-up plus cosine decay is common.
- Read the loss curve for signs that the rate is wrong.

::quiz
? Training loss becomes NaN after 200 steps. Which change is most likely to help?
+ Lower the learning rate, or add warm-up
- Raise the learning rate
- Train for longer
! Exploding values usually come from steps that are too big, especially early on.
? Why do large models use warm-up?
+ Early gradients from random weights can be very large, so small steps at first avoid wrecking training
- To make training finish sooner
- Because the data loads slowly
! Starting small lets the weights reach a stable region before full-size steps begin.
::end
