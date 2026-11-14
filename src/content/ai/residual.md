---
minutes: 8
tech: []
refs:
  - resnet: Sections 1 and 3, “Deep Residual Learning”
  - layernorm: Sections 1 and 3
  - udl: Ch. 11, “Residual Networks”
---
For years, adding more layers to a network made it worse, even on its training data. Signals and gradients faded or exploded on their way through dozens of layers. Two simple additions changed that: **residual connections**, which give every layer a shortcut, and **normalisation**, which keeps values at a steady scale. Every large modern model, including every transformer, uses both.

## The problem

A deeper network should be at least as good as a shallower one: the extra layers could just pass their input through unchanged. In practice, plain deep networks trained worse. Learning "do nothing" with a stack of weights and bends is surprisingly hard, and gradients through many layers vanish or explode, as [The chain rule](/lesson/chain-rule) showed.

## Residual connections

A **residual block** adds its input back to its output:

`output = x + F(x)`

where F is a few layers, such as two convolutions or an attention step and a small network.

- The block only has to learn a **change** F(x) to its input, not a whole new representation. If nothing useful can be added, F can learn to output nearly zero, and the block passes its input through.
- In the backward pass, the gradient flows straight through the "+ x" shortcut, unchanged, from the last layer to the first. Gradients no longer have to survive a long chain of multiplications.

With residual connections, networks of 100 and even 1,000 layers became trainable. ResNet won the ImageNet contest in 2015 with 152 layers.

A useful picture: the network has a main road, the **residual stream**, running from input to output, and each block reads from it and adds its contribution back.

## Normalisation

Even with shortcuts, the scale of values drifts through many layers. **Normalisation** layers rescale them:

- **Batch normalisation**: for each feature, subtract the mean and divide by the standard deviation computed over the batch, as in [Expectation and variance](/lesson/expectation). Then apply a learned scale and shift. Common in convolutional networks.
- **Layer normalisation**: do the same over the features of each single example, not over the batch. It works the same with any batch size and sequence length, which is why transformers use it.
- **RMSNorm**: a simpler version of layer norm that only divides by the root mean square. Used in many recent language models.

Normalised inputs keep each layer working in a sensible range, which allows larger learning rates and makes training more stable.

## Where they go

In a modern transformer block:

`x = x + Attention(Norm(x))`
`x = x + FeedForward(Norm(x))`

The normalisation comes before each part, and the residual connection around it. This "pre-norm" arrangement is the most common today because it trains more stably at great depth.

## Remember

- Plain deep networks train badly: gradients vanish or explode through many layers.
- Residual connections add the input to each block's output: blocks learn changes, and gradients flow freely.
- Normalisation keeps values at a steady scale. Layer norm and RMSNorm suit transformers.
- A transformer block is norm, then attention or feed-forward, wrapped in a residual connection.

::quiz
? A residual block has learned F(x) = 0 for every input. What does the block do?
+ It passes its input through unchanged
- It outputs zero
- It doubles its input
! output = x + F(x) = x.
? Why do transformers use layer normalisation rather than batch normalisation?
+ It normalises within each example, so it works the same for any batch size or sequence length
- It is the only kind that exists
- It removes the need for residual connections
! Batch statistics are awkward for variable-length sequences and small batches.
::end
