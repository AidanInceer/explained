---
minutes: 7
tech: []
refs:
  - islp: Section 2.1.4, “Supervised Versus Unsupervised Learning”
  - suttonbarto: Ch. 1, “Introduction”
---
Machine learning is usually divided by the kind of signal the model learns from. With **supervised** learning, every example comes with the right answer. With **unsupervised** learning, there are no answers, only data to find structure in. With **reinforcement** learning, there is a reward for good actions, often delayed. Modern systems often combine all three.

## Supervised learning

Each example has an input and a **label**: the answer you want.

- **Classification**: the label is a category. Spam or not; cat, dog or fox.
- **Regression**: the label is a number. A house price; tomorrow's demand.

The model learns to map inputs to labels, and the loss measures how far its answers are from the labels. Most practical machine learning is supervised. Its main cost is getting labels, often by people, as the lesson on labels and labelling explains.

## Unsupervised learning

There are no labels. The model looks for structure:

- **Clustering**: group similar items, such as customers with similar habits.
- **Dimension reduction**: describe data with fewer numbers while keeping its shape.
- **Density modelling**: learn which inputs are typical and which are unusual, for example to detect fraud.

The lesson on clustering and dimension reduction covers these.

## Self-supervised learning

A powerful middle way: make labels from the data itself. Hide part of the input and train the model to predict it.

- Hide the next word of a sentence, and predict it. This is how large language models are pretrained.
- Hide patches of an image, and fill them in.

There is no cost for labels, so the model can learn from enormous amounts of raw text or images. Language models learn this way first, then are fine-tuned with smaller sets of human examples.

## Reinforcement learning

An **agent** takes **actions** in an **environment** and receives **rewards**. Nobody tells it the right action; it must find out by trying, and rewards may come long after the actions that earned them, as in a game won after 200 moves.

Used for games, robotics and control, and to fine-tune language models with feedback on which answers people prefer. The lesson on reinforcement learning, later in AI, covers it.

## Choosing

| You have | Use |
|---|---|
| Inputs with correct answers | Supervised |
| Lots of raw data, no answers | Self-supervised to pretrain, or unsupervised to explore |
| A way to score actions, not correct answers | Reinforcement |

## Remember

- Supervised: learn from labelled examples. Classification or regression.
- Unsupervised: find structure without labels: clusters, fewer dimensions, unusual cases.
- Self-supervised: hide part of the data and predict it. How language models pretrain.
- Reinforcement: learn actions from rewards, often delayed.

::quiz
? A model is trained to predict the next word of web text, with no human labels. What kind of learning is this?
+ Self-supervised
- Reinforcement
- Supervised with human labels
! The labels, the next words, come from the data itself.
? A bank wants to group customers by behaviour, with no categories decided in advance. What fits?
+ Unsupervised clustering
- Supervised classification
- Reinforcement learning
! With no labels, clustering finds groups from the data.
::end
