---
minutes: 8
tech: []
refs:
  - udl: Ch. 4, “Deep Neural Networks”
  - dlbook: Ch. 6, “Deep Feedforward Networks”, Sections 6.4 and 6.4.1
---
A **deep network** stacks many layers of [neurons](/lesson/neuron), each with an [activation function](/lesson/activations), so that each layer works on the output of the one before. Depth lets a network build complex ideas out of simpler ones, step by step. This is the "deep" in deep learning.

## The structure

A **feedforward** network (also called a multilayer perceptron, MLP) has:

- An **input layer**: the features, such as 784 pixel values.
- **Hidden layers**: each computes `f(W x + b)` on the previous layer's output.
- An **output layer**: the predictions, such as 10 class scores.

Data flows one way, from input to output. Running it is called the **forward pass**.

```
784 inputs → 256 → ReLU → 128 → ReLU → 10 → softmax
```

This network has three weight matrices. Its **depth** is the number of layers; its **width** is the number of units per layer.

## What depth gives

Each layer builds on what earlier layers found. In a network for images, studies of trained networks show a typical pattern:

- Early layers respond to edges and colour changes.
- Middle layers combine those into textures and simple shapes.
- Later layers combine shapes into parts and whole objects.

Nobody programs this hierarchy. It emerges from training, because it is an efficient way to represent images. Language models show a similar build-up, from word pieces to grammar to meaning.

## Why deep and not just wide

In theory, one very wide hidden layer can approximate almost any function. In practice, for many real problems, depth is far more efficient: functions that a shallow network would need an enormous number of units for can be built with a modest number of layers, by reusing pieces. A deep network folds the input space again and again, and each fold multiplies the number of regions it can tell apart.

## Why depth is hard

Deep networks were known for decades, but hard to train. Gradients pass back through every layer and are multiplied at each one, as [The chain rule](/lesson/chain-rule) showed, so they tend to vanish or explode. The practical breakthroughs that made very deep networks trainable:

- [ReLU-like activations](/lesson/activations) that do not squash gradients.
- Careful **initialisation** of the weights, covered in its own lesson.
- **Residual connections** and **normalisation**, also covered in their own lesson.
- Lots of data and GPUs.

## How it learns

Every weight in every layer is adjusted by [gradient descent](/lesson/gradient-descent). The gradient for each weight comes from **backpropagation**, the next lesson, which runs the chain rule backwards through the layers.

## Remember

- A deep network stacks layers of f(W x + b); data flows forward through them.
- Depth lets layers build complex features from simpler ones, learned, not programmed.
- Depth is more efficient than width for many real problems.
- Deep networks became trainable through better activations, initialisation, residual connections, data and GPUs.

::quiz
? A network is 784 → 256 → 128 → 10. How many weight matrices does it have?
+ 3
- 4
- 1
! One between each pair of consecutive layers.
? In a trained image network, what do the earliest layers typically respond to?
+ Edges and simple colour changes
- Whole objects such as faces
- The class label
! Early layers find simple local patterns; later layers combine them.
::end
