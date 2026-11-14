---
minutes: 7
tech: []
refs:
  - dlbook: Section 5.9, “Stochastic Gradient Descent”, and Section 8.1.3, “Batch and Minibatch Algorithms”
  - d2l: Section 12.4, “Stochastic Gradient Descent”, and Section 12.5, “Minibatch Stochastic Gradient Descent”
---
To compute the exact gradient of the loss, you must run the model on every training example. With billions of examples, one step would take days. **Stochastic gradient descent** (SGD) takes a shortcut: estimate the gradient from a small random **batch** of examples, take a step, and pick a new batch. The steps are noisy, but there are vastly more of them, and the noise even helps.

## The method

1. Shuffle the training data.
2. Take the next **mini-batch**, for example 32 or 256 examples.
3. Compute the loss and gradient on that batch only.
4. Update the weights, as in [Gradient descent](/lesson/gradient-descent).
5. Repeat. One full pass through the data is an **epoch**.

The batch gradient is an estimate of the full gradient: right on average, with some random error, as [Samples and estimates](/lesson/samples) described.

## Why it works so well

- **Far more steps for the same compute.** A batch of 256 out of a million examples gives a step about 4,000 times faster. Many rough steps beat few exact ones.
- **Redundant data.** Many examples are similar. You do not need all of them to know roughly which way is downhill.
- **Noise helps.** The random error in each step jostles the weights off saddle points and out of sharp, narrow valleys, towards wider ones that tend to [generalise better](/lesson/loss-landscape).

## Batch size

- **Small batches**: noisy steps, less memory, often good generalisation, but the hardware is used less efficiently.
- **Large batches**: smoother steps, and GPUs are used fully, because one large matrix multiplication is efficient, as [Matrix multiplication](/lesson/matrix-multiply) explained. Very large batches can generalise worse unless the learning rate and schedule are adjusted.

The noise in a batch gradient falls with the square root of the batch size: four times the batch, half the noise. This is why the learning rate often grows with the batch size.

## Shuffle

The batches must be random. If the data is sorted, say all cats then all dogs, each batch pulls the model one way and the next pulls it back. Shuffle every epoch.

> **For new readers.** In everyday use, "SGD" means mini-batch gradient descent, not the original one-example-at-a-time version.

## Remember

- SGD estimates the gradient from a small random batch and steps on it.
- Noisy, cheap steps beat exact, expensive ones, and the noise helps escape saddles.
- Batch size trades noise for hardware efficiency; adjust the learning rate with it.
- Shuffle the data every epoch.

::quiz
? A dataset has 1,000,000 examples and the batch size is 500. How many steps are in one epoch?
+ 2,000
- 500
- 1,000,000
! One epoch passes over all the data once: 1,000,000 / 500 = 2,000 batches.
? Why must training data be shuffled for SGD?
+ So each batch is a fair random sample, not a run of one kind of example
- To make the dataset smaller
- Because GPUs need random data
! Sorted data makes consecutive batches pull the model in opposite directions.
::end
