---
minutes: 8
tech: []
refs:
  - dlbook: Section 6.2.1, “Cost Functions”
  - islp: Section 2.2.1, “Measuring the Quality of Fit”
---
A **loss function** turns all of a model's mistakes into one number: how bad its answers are. Training does exactly one thing: make that number small. So the loss decides what the model learns. Choose it carelessly, and the model becomes very good at the wrong thing.

## For numbers: squared and absolute error

For regression, where the answer is a number:

- **Mean squared error** (MSE): the average of (prediction - truth)². Large errors count far more than small ones: an error of 10 costs 100, an error of 1 costs 1.
- **Mean absolute error** (MAE): the average of |prediction - truth|. Every unit of error counts the same, so a few large errors matter less.

Choose by what a mistake costs. If one big miss is a disaster, squared error. If the data has occasional wild values that you should not chase, absolute error, or a mix such as the **Huber loss**, which is squared for small errors and absolute for large ones.

## For categories: cross-entropy

For classification, the model outputs probabilities, and the loss is [cross-entropy](/lesson/cross-entropy): `-log` of the probability given to the right answer. It rewards confident correct answers and punishes confident wrong ones hard. It is also the loss used to train language models, one token at a time.

## Averaging

The loss is averaged over examples: over a batch during training, over a whole dataset to report it. As [Integrals](/lesson/integrals) noted, the batch average estimates the expected loss over all possible data.

## The loss is not the goal

The loss must be something that gradient descent can work with: smooth, with useful gradients. The real goal often is not:

- A spam filter is judged on how many spam emails it catches and how many good emails it wrongly blocks. Cross-entropy is a stand-in.
- A recommender is judged on what users click and keep. Its loss is a stand-in.

Check the real measures separately, as the lesson [Measuring a model](/lesson/metrics) explains. A lower loss usually, but not always, means a better product.

> **Pitfall.** A model optimises exactly what you measure. Train a model to maximise clicks, and it may learn to show sensational content. The loss is a statement of what you want; write it carefully.

## Adding to the loss

The loss can include more than the error:

- **Regularisation** terms that penalise large weights, to reduce overfitting, as the lesson on regularisation shows.
- **Weights per class**, so that rare classes, such as fraud, are not ignored.
- **Penalties** that keep a fine-tuned model close to its original, as in reinforcement learning from feedback.

## Remember

- The loss is one number for how bad the answers are. Training minimises it.
- Squared error punishes large errors most; absolute error treats all errors alike.
- Cross-entropy is the loss for probabilities and classification.
- The loss is a stand-in for the real goal. Measure the goal separately.

::quiz
? Errors of 1, 1 and 10. What is the mean squared error?
- 4
+ 34
- 12
! (1 + 1 + 100) / 3 = 34. The one large error dominates.
? A fraud dataset has 1 fraud per 1,000 transactions. A model predicts "not fraud" for everything and gets a low average loss. What could help?
+ Give the rare class more weight in the loss, and judge the model on recall of fraud
- Train for longer with the same loss
- Remove all fraud examples
! With plain averaging, rare classes barely affect the loss. Class weights and the right metric fix the focus.
::end
