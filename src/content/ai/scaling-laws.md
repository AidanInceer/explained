---
minutes: 8
tech: []
refs:
  - scaling: Sections 1 and 3, on power laws in model size, data and compute
  - chinchilla: Sections 1 and 3, on compute-optimal training
---
In 2020, researchers found something surprising about language models: their loss falls in a smooth, predictable way as you add parameters, data and compute. Plotted on log scales, the trends are nearly straight lines. These **scaling laws** turned building large models from guesswork into planning, and they explain why so much money went into ever larger training runs.

## The finding

For transformer language models, the test loss L falls as a **power law** of each resource, when the others are not the bottleneck:

- **Parameters** N: bigger models reach lower loss.
- **Data** D: more training tokens give lower loss.
- **Compute** C: more operations, which grow with roughly N × D, give lower loss.

A power law looks like `L ≈ a × N^(-α)`. On a log-log plot it is a straight line. Each time you multiply N by 10, the loss falls by the same fraction. Improvements continue, but each one costs ten times more.

## Predicting before training

Because the trends are smooth, a team can train a range of small models cheaply, fit the line, and predict the loss of a model a hundred times larger before spending the money. That is how large runs are planned, and how settings found on small models, as in [Hyperparameters](/lesson/hyperparameters), are carried to large ones.

## How to spend a budget

With a fixed amount of compute, should you train a bigger model on less data, or a smaller model on more? The 2022 "Chinchilla" study found that, for the best loss per unit of compute, parameters and training tokens should grow **together**, at roughly 20 tokens per parameter. Many earlier models were too large for their data.

For example, a 70-billion-parameter model trained on 1.4 trillion tokens beat a 280-billion-parameter model trained on 300 billion tokens, with about the same compute.

## Beyond compute-optimal

The compute-optimal mix gives the best model for a training budget. But a model is trained once and then run many times. A smaller model is cheaper for every user, every day, as [Datacentres, power and cost](/lesson/power-cost) explained. So many teams now train smaller models on far more tokens than 20 per parameter: more training cost, much cheaper inference.

## What scaling laws do not say

- **Loss is not ability.** Lower loss predicts better performance on average, but specific skills can appear suddenly at some scale, or not at all, and are much harder to predict.
- **Data runs out.** High-quality text is finite. Scaling data requires new sources, careful filtering, or synthetic data, as [Augmentation and synthetic data](/lesson/augmentation) discussed.
- **The laws are empirical.** They describe what has been measured within a range. They are not laws of nature, and their exact values depend on the architecture and the data.

> **In practice.** Read a log-log plot as "how many times more resource for a given improvement". A straight line with a gentle slope means steady but expensive progress.

## Remember

- Loss falls as a smooth power law in parameters, data and compute.
- Small runs predict large ones, so big training runs can be planned.
- Compute-optimal training grows parameters and tokens together, roughly 20 tokens per parameter.
- Smaller models trained longer are cheaper to serve. Loss does not predict every skill.

::quiz
? Under the Chinchilla rule of thumb, about how many training tokens suit a 10-billion-parameter model?
+ About 200 billion
- About 10 billion
- About 20 trillion
! Roughly 20 tokens per parameter: 10 billion × 20 = 200 billion.
? Why do some teams train models on many more tokens than the compute-optimal amount?
+ A smaller model trained longer is cheaper to run for every user afterwards
- Compute-optimal models are less accurate in every way
- Data is free
! Inference costs add up over the model's life, so a smaller, longer-trained model can be cheaper overall.
::end
