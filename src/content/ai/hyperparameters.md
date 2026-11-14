---
minutes: 7
tech: []
refs:
  - dlbook: Section 11.4, “Selecting Hyperparameters”
  - d2l: Ch. 19, “Hyperparameter Optimization”
---
The weights are learned. Many other settings are not: the learning rate, the batch size, the number of layers, how much dropout, how long to train. These **hyperparameters** are chosen by people, or by a search, before or during training. Choosing them well can matter as much as choosing the model.

## The main ones

| Hyperparameter | What it controls |
|---|---|
| Learning rate and schedule | Step size; often the most important, as [Learning rate](/lesson/learning-rate) explained |
| Batch size | Noise in each step, memory use, speed |
| Number of steps or epochs | How long to train |
| Model size: layers, width | How much the model can represent |
| Regularisation: weight decay, dropout | How strongly to prefer simple solutions, as in [Regularisation](/lesson/regularisation) |
| Optimiser settings | Such as Adam's β values |

## How to choose

Always judge on the **validation set**, never the test set, as [Train, validation and test](/lesson/train-test) explained.

- **Start from known defaults.** Papers and libraries give values that work for common models. AdamW with a learning rate around 3e-4, weight decay 0.01–0.1, warm-up then cosine decay, is a common starting point for transformers.
- **Change one thing at a time** at first, and look at the effect on the loss curves.
- **Search on a logarithmic scale** for rates and strengths: 0.1, 0.03, 0.01, 0.003, not 0.1, 0.2, 0.3.

## Search methods

- **Grid search**: try every combination of a few values for each setting. The number of runs multiplies quickly: 5 values for 4 settings is 625 runs.
- **Random search**: try random combinations. For the same budget it usually finds better settings than a grid, because it tries more distinct values of the settings that matter most.
- **Bayesian optimisation** and similar methods choose the next combination to try based on results so far.
- **Early stopping of poor runs**: stop runs that are clearly behind after a short time, and spend the budget on the promising ones.

## At large scale

For very large models, a full search is too expensive: one run can cost millions. Teams instead tune on small versions of the model and use rules for how the best settings change with size, from experience and from [scaling laws](/lesson/scaling-laws). Some parametrisations are designed so that the best learning rate stays the same as the model grows.

> **Pitfall.** Tuning many hyperparameters on one small validation set overfits to it, just like training does. Keep the final test set untouched, and be wary of tiny improvements.

## Remember

- Hyperparameters are chosen, not learned: learning rate, batch size, size, regularisation, duration.
- Judge them on validation data; start from good defaults; search rates on a log scale.
- Random search beats grid search for the same budget; stop poor runs early.
- Large models are tuned on small versions and scaled with rules.

::quiz
? You want to find a good learning rate. Which set of values to try is best?
+ 1e-2, 3e-3, 1e-3, 3e-4, 1e-4
- 0.01, 0.02, 0.03, 0.04, 0.05
- Only 0.001
! Learning rates matter by factors, so a logarithmic spread covers the useful range.
? Why does random search often beat grid search with the same number of runs?
+ It tries more distinct values of each setting, including the few that matter most
- It uses more compute
- Grids cannot include the learning rate
! A grid repeats the same few values of each setting; random search spreads them out.
::end
