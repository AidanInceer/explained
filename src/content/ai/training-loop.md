---
minutes: 8
tech: []
refs:
  - d2l: Section 3.4, “Linear Regression Implementation from Scratch”, and Section 3.2, “Object-Oriented Design for Implementation”
  - karpathy: '“Let''s build GPT: from scratch, in code, spelled out”'
---
Every lesson so far comes together in a few lines of code that run millions of times: the **training loop**. Take a batch, run it forward, measure the loss, run it backward, step the weights. Then again. Knowing exactly what each line does makes most training problems easy to find.

## The loop

In PyTorch, the core looks like this:

```python
for epoch in range(num_epochs):
    for inputs, targets in train_loader:        # 1. batch
        predictions = model(inputs)              # 2. forward
        loss = loss_fn(predictions, targets)     # 3. loss
        optimizer.zero_grad()                    # clear old gradients
        loss.backward()                          # 4. backward
        optimizer.step()                         # 5. step
```

1. **Batch**: the data loader gives the next shuffled mini-batch, as in [Stochastic gradient descent](/lesson/sgd).
2. **Forward**: the model computes predictions, keeping intermediate values for later.
3. **Loss**: one number for how wrong the predictions are, from [Loss functions](/lesson/loss-functions).
4. **Backward**: [backpropagation](/lesson/backprop) fills each weight's gradient.
5. **Step**: the optimiser, such as [Adam](/lesson/momentum-adam), updates every weight.

`zero_grad()` matters: by default, PyTorch adds new gradients to old ones, so forgetting it mixes gradients across steps.

## Around the loop

A real training script adds:

- **Validation** every so often: run the model on the validation set without gradients (`model.eval()` and `torch.no_grad()`), and record the loss and metrics.
- **Logging**: training loss, validation loss, learning rate and gradient size, to read later as curves, as the lesson [Reading loss curves](/lesson/loss-curves) explains.
- **Learning rate schedule**: warm-up and decay, from [Learning rate](/lesson/learning-rate).
- **Checkpoints**: save the weights and optimiser state regularly, and keep the best by validation loss.
- **Gradient clipping**: if the gradient is unusually large, scale it down before the step, to prevent a single bad batch from wrecking training.

## Train and eval modes

Some layers behave differently in training and in use. Dropout switches units off only during training; batch normalisation uses batch statistics during training and stored averages afterwards. Switch modes with `model.train()` and `model.eval()`.

> **Pitfall.** Forgetting `model.eval()` when measuring validation gives noisy, misleading numbers, because dropout is still active.

## Start small

Before a long run:

1. **Overfit one batch.** Train on a single small batch until the loss is near zero. If the model cannot memorise ten examples, something is broken: a wrong label shape, a loss on the wrong axis, a frozen layer.
2. **Check the first loss.** For a 10-class problem with cross-entropy, a random model should start near ln(10) ≈ 2.3. A very different value points to a bug.
3. **Run briefly on the full data** and check that the loss falls.

These checks take minutes and save days.

## Remember

- The loop: batch, forward, loss, zero gradients, backward, step.
- Around it: validation, logging, schedules, checkpoints and gradient clipping.
- Switch between train and eval modes.
- Overfit one batch and check the first loss before any long run.

::quiz
? What is the expected initial cross-entropy loss of a randomly initialised 100-class classifier?
+ About ln(100) ≈ 4.6
- About 0
- About 100
! A random model gives each class about 1/100, and -ln(1/100) = ln 100.
? A model cannot reduce its loss on a single batch of 8 examples, even after many steps. What does that suggest?
+ A bug in the code, such as wrong shapes, a wrong loss or weights that are not updated
- The model needs more data
- Training must run for longer on the full dataset
! Any working model should memorise a tiny batch. Failure points to a bug.
::end
