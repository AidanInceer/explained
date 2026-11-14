---
minutes: 8
tech: []
refs:
  - dlbook: Section 11.5, “Debugging Strategies”
  - udl: Ch. 8, “Measuring Performance”, on training and test curves
---
During training you get one number per step: the loss. Plotted over time, the **loss curve** is the main window into what the model is doing. Its shape tells you whether training works, whether it has stopped improving, whether the learning rate is wrong, and whether the model is memorising. Learn to read it, and most problems become visible.

## A healthy run

- **Training loss** falls quickly at first, then more slowly, flattening into a gentle slope.
- **Validation loss** follows it closely, a little above.
- Small wiggles are normal: each batch is different, as [Stochastic gradient descent](/lesson/sgd) explained. Smooth the curve with a moving average to see the trend.

## Common shapes and what they mean

**Flat from the start.** The loss does not move.
- The learning rate may be far too small, or gradients are not reaching the weights.
- Check that the optimiser includes the model's parameters, and that gradients are not zero, as the start-small checks in [The training loop](/lesson/training-loop) suggest.

**Falls, then explodes, or becomes NaN.**
- The learning rate is too high, or there is no warm-up. Large gradients may need clipping.
- Look for bad data, such as an extreme value or a division by zero, around the step where it happens.

**Spikes that recover.** A sudden jump, then a return to trend.
- Often a batch of unusual data, or a learning rate near the edge of stability. Occasional spikes are common in large runs; frequent or growing ones are a warning.

**Training falls, validation rises.**
- [Overfitting](/lesson/overfitting). The model is memorising. Stop at the validation minimum, add regularisation, or get more data.

**Both stay high and flat, close together.**
- Underfitting: the model is too small, the features are poor, or training is too short.

**Validation lower than training.**
- Usually because regularisation, such as dropout, is active during training but not during validation. Not a problem by itself. But if the gap is large, check for leakage, as [Data quality and leakage](/lesson/ml-data-quality) warned.

**Drops at fixed points.**
- A step in the learning rate schedule. Lowering the rate often gives a quick drop, which shows that the higher rate was keeping the model bouncing round the valley.

## Log scales

Losses fall fast early and slowly later. Plot the loss, and often the steps, on a **logarithmic** axis: slow late improvements become visible, and the straight-line trends of [Scaling laws](/lesson/scaling-laws) appear.

## Watch more than the loss

Also plot:

- The **learning rate**, to match changes in the curve with the schedule.
- The **gradient norm**: rising norms often come before instability.
- The real **metric**, such as accuracy, on validation data. The loss is a stand-in for it.

## Remember

- A healthy curve falls fast, then slowly; validation follows closely.
- Flat: learning rate or wiring. Exploding: learning rate too high. Rising validation: overfitting.
- Spikes, plateaus and schedule drops each have typical causes.
- Use log scales, and plot learning rate, gradient norm and real metrics too.

::quiz
? Training loss keeps falling while validation loss has risen for the last 5 epochs. What should you do?
+ Use the weights from the validation minimum, and add regularisation or data
- Train for longer
- Raise the learning rate
! Rising validation loss with falling training loss is overfitting.
? The loss is flat at its starting value for 1,000 steps. What should you check first?
+ That gradients are non-zero and the optimiser is updating the model's parameters
- That the model is large enough
- That the test set is correct
! A loss that never moves usually means the weights are not being updated.
::end
