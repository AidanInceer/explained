---
minutes: 8
tech: []
refs:
  - islp: Section 2.2.2, “The Bias-Variance Trade-Off”
  - udl: Ch. 8, “Measuring Performance”
---
A student who memorises last year's exam answers can score full marks on that paper and fail this year's. A model can do the same. **Overfitting** is when a model learns its training data, including its noise and accidents, so well that it does worse on new data. Its opposite, **underfitting**, is a model too simple to capture the real pattern.

## Seeing it

Train a model and watch two numbers as training goes on:

- The **training loss** keeps falling.
- The **validation loss**, on data held back as in [Train, validation and test](/lesson/train-test), falls at first, then levels off, then **rises**.

The point where validation loss starts to rise is where the model starts to memorise rather than learn. The gap between the two curves is the size of the overfitting.

## An example

Fit points that follow a gentle curve, with some noise:

- A straight line misses the curve: **underfit**. Both training and validation errors are high.
- A smooth curve follows the trend: **good fit**. Both errors are low and close.
- A wiggly curve through every single point: **overfit**. Zero training error, but it swings wildly between points, so validation error is high.

## Bias and variance

Two sources of error, as in [Samples and estimates](/lesson/samples):

- **Bias**: error from wrong assumptions. A straight line cannot fit a curve, whatever the data. Simple models have high bias.
- **Variance**: error from sensitivity to the particular training sample. Train the wiggly curve on another sample and you get a very different curve. Flexible models have high variance.

Classically, making a model more flexible lowers bias and raises variance, and the best model sits in between: the **bias–variance trade-off**.

## What reduces overfitting

- **More data.** The most reliable fix. Noise averages out, and memorising becomes harder.
- **A simpler model**, or fewer features.
- **Regularisation**: penalise complexity, as the lesson [Regularisation](/lesson/regularisation) explains.
- **Early stopping**: stop training when validation loss stops improving.
- **Data augmentation**: create varied copies of examples, as the lesson on augmentation shows.

## Deep learning's twist

Large neural networks have far more parameters than training examples, and can memorise random labels perfectly. By the classic view they should overfit badly. Yet with enough data, good training methods and regularisation, they generalise well, and making them even larger often helps. This **double descent** behaviour, where error first rises and then falls again past the point of memorising the data, is still an active research topic.

> **Pitfall.** A training accuracy far higher than validation accuracy is the main warning sign. Always look at both.

## Remember

- Overfitting: training loss falls while validation loss rises. Underfitting: both stay high.
- Bias is error from too-simple assumptions; variance is sensitivity to the sample.
- More data, simpler models, regularisation, early stopping and augmentation reduce overfitting.
- Large networks can generalise despite having many parameters, but always check validation.

::quiz
? Training accuracy is 99% and validation accuracy is 71%. What is the likely problem?
+ Overfitting
- Underfitting
- The learning rate is too small
! A large gap between training and validation performance is the sign of overfitting.
? Both training and validation error are high and similar. What might help?
+ A more flexible model, or better features
- More regularisation
- Stopping training earlier
! High error on both sets means underfitting: the model cannot capture the pattern.
::end
