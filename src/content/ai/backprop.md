---
minutes: 9
tech: []
refs:
  - udl: Ch. 7, “Gradients and Initialization”, on the backpropagation algorithm
  - dlbook: Section 6.5, “Back-Propagation and Other Differentiation Algorithms”
  - karpathy: '“The spelled-out intro to neural networks and backpropagation: building micrograd”'
---
To train a network with [gradient descent](/lesson/gradient-descent), you need the gradient of the loss with respect to every weight: millions or billions of [partial derivatives](/lesson/partial-derivatives), at every step. **Backpropagation** computes all of them in one backward pass through the network, for about twice the cost of the forward pass. It is [the chain rule](/lesson/chain-rule), applied layer by layer from the loss back to the input.

## Forward, then backward

1. **Forward pass.** Run a batch through the network, layer by layer, and compute the loss. Keep every intermediate result: each layer's input and output.
2. **Backward pass.** Start at the loss. Work backwards through the layers. At each layer, use the gradient arriving from above to compute:
   - the gradient for this layer's **weights** (to update them), and
   - the gradient for this layer's **input** (to pass to the layer below).
3. **Update.** Step every weight against its gradient.

## A tiny example

One neuron, no activation: `ŷ = w × x`, with loss `L = (ŷ - y)²`. Take x = 2, w = 3, y = 5.

Forward:
- ŷ = 3 × 2 = 6
- L = (6 - 5)² = 1

Backward:
- dL/dŷ = 2(ŷ - y) = 2
- dŷ/dw = x = 2
- dL/dw = dL/dŷ × dŷ/dw = 2 × 2 = 4

The gradient is 4: increasing w increases the loss, so the update lowers w. With a learning rate of 0.1, w becomes 3 - 0.4 = 2.6, and ŷ moves from 6 towards 5.

## In a layer

For a dense layer `out = W × in`, given the gradient of the loss with respect to `out`, called g:

- The gradient for the weights is g times the input, as an outer product: weights that saw large inputs, and whose outputs mattered a lot, get large gradients.
- The gradient passed down is `Wᵀ × g`: the same weights, used in reverse.

Activations pass gradients through by multiplying by their slope: ReLU passes the gradient where its input was positive, and blocks it where its input was negative.

## Why it is efficient

A naive method would nudge each weight separately and rerun the network: one forward pass per weight, billions of passes per step. Backpropagation reuses the shared parts of the chain: the gradient arriving at a layer is computed once and used for all the weights below it. So the backward pass costs about two forward passes, whatever the number of weights.

The price is **memory**: the forward pass must keep every layer's intermediate values for the backward pass. For large models this activation memory is a major cost, sometimes traded for compute by recomputing values instead of storing them.

## You rarely write it

Libraries do it automatically. In PyTorch, you compute the loss and call `loss.backward()`; every weight's `.grad` is filled in. This is **automatic differentiation**: the library records each operation in the forward pass, and knows the local derivative of each one.

> **In practice.** Writing a tiny backpropagation by hand once, for a few neurons, is the best way to understand what `backward()` does and why shapes, memory and vanishing gradients matter.

## Remember

- Backpropagation applies the chain rule backwards from the loss, layer by layer.
- Each layer computes its weight gradients and passes an input gradient down.
- It costs about two forward passes, regardless of the number of weights, but needs stored activations.
- Libraries do it automatically with automatic differentiation.

::quiz
? With ŷ = w × x, L = (ŷ - y)², x = 1, w = 4 and y = 1, what is dL/dw?
+ 6
- 3
- 9
! ŷ = 4, dL/dŷ = 2(4 - 1) = 6, dŷ/dw = x = 1, so dL/dw = 6.
? Why does backpropagation need more memory than the forward pass alone?
+ It must keep each layer's intermediate values from the forward pass to compute gradients
- It stores a copy of the training data
- It runs the network twice at the same time
! The local derivatives depend on the values computed going forward.
::end
