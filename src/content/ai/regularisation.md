---
minutes: 8
tech: []
refs:
  - islp: Section 6.2, “Shrinkage Methods”
  - dlbook: Ch. 7, “Regularization for Deep Learning”
---
A flexible model can fit its training data too well, as [Overfitting, bias and variance](/lesson/overfitting) showed. **Regularisation** is any method that makes a model prefer simpler solutions, so that it fits the real pattern and not the noise. It trades a little accuracy on the training data for better accuracy on new data.

## Penalise large weights

The most common form adds a penalty to the loss for large weights:

- **L2 regularisation** (ridge, or **weight decay**): add `λ × Σ w²`. Every weight is pulled towards zero, large weights most. The model spreads its reliance over many inputs instead of leaning hard on a few.
- **L1 regularisation** (lasso): add `λ × Σ |w|`. Pushes many weights to exactly zero, so the model ignores those inputs. Useful to select a few important features.

λ sets the strength: zero means no regularisation; very large means weights near zero and an underfit model. Choose it with the validation set.

Why does this help? A model with large weights can react sharply to small changes in the input, which is how it bends to fit noise. Small weights give smoother, more stable functions.

> **For experienced readers.** With plain SGD, L2 regularisation and weight decay are the same. With Adam they differ; AdamW applies weight decay directly to the weights, which works better, as [Momentum and Adam](/lesson/momentum-adam) noted.

## Early stopping

Watch the validation loss while training, and stop when it stops improving. Keep the weights from the best point. Simple, cheap, and effective: it limits how far the weights can travel from their small starting values.

## Dropout

In neural networks, **dropout** randomly switches off a share of the units, for example 10% or 50%, on every training step. The network cannot depend on any single unit, so it learns spread-out, redundant patterns. At prediction time, all units are used, with outputs scaled to match.

## More and varied data

- **More data** is the strongest regulariser of all.
- **Data augmentation** creates varied copies of examples: flipped and cropped images, reworded text. The model learns that these changes do not alter the answer. See the lesson on augmentation.

## Other forms

- **Smaller models**, fewer features, or shallower trees.
- **Label smoothing**: train towards 0.9 for the right class instead of 1.0, so the model is not pushed to extreme confidence.
- **Ensembles**: average several models, as random forests do in [Decision trees and forests](/lesson/trees).

## Remember

- Regularisation makes models prefer simpler solutions, to generalise better.
- L2 (weight decay) shrinks all weights; L1 sets many to zero.
- Early stopping and dropout are simple and effective for neural networks.
- More and augmented data regularise best. Tune the strength on validation data.

::quiz
? You want a model that uses only a few of 500 features. Which regularisation fits?
+ L1 (lasso), which sets many weights to exactly zero
- L2 (ridge)
- No regularisation
! L1's penalty drives unimportant weights to zero, selecting features.
? With a very large regularisation strength λ, what tends to happen?
+ The weights are forced near zero and the model underfits
- The model overfits more
- Nothing changes
! Too strong a penalty stops the model from fitting even the real pattern.
::end
