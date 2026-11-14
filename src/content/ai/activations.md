---
minutes: 7
tech: []
refs:
  - udl: Ch. 3, “Shallow Neural Networks”, on the ReLU and other activation functions
  - dlbook: Section 6.3, “Hidden Units”
---
Between every two layers, a neural network applies an **activation function**: a fixed, simple bend applied to each value. Without it, a deep network would be no more powerful than a single layer. Which bend you use affects how fast and how reliably the network trains.

## Why bends are needed

A layer without an activation is a [matrix multiplication](/lesson/matrix-multiply) plus a constant: a linear map. Two linear maps in a row are one linear map. So a hundred layers with no bends collapse into one, and can only draw straight lines between classes.

An activation function is **non-linear**. With bends between layers, each layer can fold and reshape the space, and the stack can represent curved, complicated boundaries. A network with enough units and even one hidden layer with a non-linear activation can approximate any reasonable function; depth makes this far more efficient.

## The common choices

**Sigmoid**: `1 / (1 + e⁻ᶻ)`, squeezing values into 0 to 1. Used in early networks. Its slope is tiny for large positive or negative inputs, so gradients **vanish** through many layers, as [The chain rule](/lesson/chain-rule) warned. Now mostly used only at outputs that must be probabilities.

**Tanh**: like the sigmoid, but from -1 to 1, centred on 0. Better than sigmoid, with the same vanishing problem.

**ReLU** (rectified linear unit): `max(0, z)`. Zero for negative inputs, unchanged for positive ones.

- Very cheap to compute.
- Its slope is exactly 1 for positive inputs, so gradients pass through many layers without shrinking.
- Weakness: a neuron whose input is always negative outputs 0 and gets zero gradient, so it can stop learning: a **dead** neuron.

ReLU made training deep networks practical, around 2010–2012.

**Leaky ReLU**: a small slope, such as 0.01, for negative inputs, so neurons never fully die.

**GELU** and **SiLU** (also called swish): smooth curves that look like ReLU but bend gently near zero and let a little through for small negative values. Transformers and most modern large models use these or related gated forms.

## At the output

The last layer's activation depends on the task, not on training ease:

- **No activation** (identity) for regression: any number.
- **Sigmoid** for one yes-or-no probability.
- **[Softmax](/lesson/softmax)** for a probability over several classes or tokens.

> **For new readers.** In code, the activation is often its own layer, such as `nn.ReLU()` between two `nn.Linear` layers in PyTorch.

## Remember

- Without non-linear activations, stacked layers collapse into one linear map.
- Sigmoid and tanh saturate and cause vanishing gradients in deep stacks.
- ReLU is cheap and keeps gradients alive; leaky ReLU avoids dead neurons.
- GELU and SiLU are smooth variants used in modern transformers. Output activations follow the task.

::quiz
? What does ReLU output for inputs -2, 0 and 3?
+ 0, 0, 3
- -2, 0, 3
- 0, 0.5, 1
! ReLU is max(0, z).
? A network of 20 layers with no activation functions between them is equivalent to…
+ A single linear layer
- A 20-layer non-linear network
- Nothing at all
! Linear maps composed together are one linear map.
::end
