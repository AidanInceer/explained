---
minutes: 8
tech: []
refs:
  - dlbook: 'Ch. 10, “Sequence Modeling: Recurrent and Recursive Nets”'
  - lstm: Whole paper
  - attention: Section 1, “Introduction”, on the limits of recurrent models
---
Text, speech and time series come as **sequences**: one item after another, where order matters. Before transformers, the main tool for sequences was the **recurrent neural network** (RNN): a network that reads one item at a time and carries a memory forward. RNNs explain a lot about why transformers replaced them.

## Reading one step at a time

An RNN keeps a **hidden state** h, a vector that summarises everything read so far. At each step t:

`hₜ = f(W × hₜ₋₁ + U × xₜ + b)`

The new state mixes the previous state with the new input, through weights W and U that are the **same at every step**. After reading the whole sentence, the final state is meant to hold its meaning, and can be used to classify the sentence, or to generate the next word.

Like the shared filter of a [convolutional network](/lesson/cnn), sharing weights across positions lets the same rule work on sequences of any length.

## Why the memory fades

To learn, the gradient must travel back through every step, multiplying by W each time. Over long sequences, this product, as in [The chain rule](/lesson/chain-rule), tends to **vanish**, so the network cannot learn links between words far apart, such as a subject at the start of a long sentence and its verb at the end. Or it **explodes**, and training breaks.

## LSTMs and GRUs

The **long short-term memory** (LSTM), from 1997, added a separate **cell state** and **gates**: small learned switches that decide what to forget, what to add and what to output at each step. Information can travel along the cell state with little change, so gradients survive much longer. The **GRU** is a simpler variant. From about 2014 to 2017, LSTMs powered most machine translation, speech recognition and text prediction.

## The limits that remained

- **One step at a time.** Step t needs step t - 1 first. Training cannot be spread across the sequence in parallel, so GPUs are poorly used, and training on huge datasets is slow.
- **A single bottleneck.** Everything about the past must squeeze through one fixed-size state vector. Long documents overflow it.
- **Distance still hurts.** Gates help, but information from hundreds of steps back is still hard to use.

## What replaced them

**Attention**, and then the **transformer**, as the lessons on attention and the transformer explain, let every position look directly at every other position, and process a whole sequence in parallel during training. That fixed all three limits at once, at the cost of work that grows with the square of the sequence length.

> **For experienced readers.** Recurrent ideas are returning in new forms. State-space models and modern linear recurrent models aim to combine fast parallel training with a fixed-size state at inference time, which makes very long sequences cheaper.

## Remember

- An RNN reads a sequence one item at a time, carrying a hidden state forward with shared weights.
- Gradients through many steps vanish or explode, so long-range links are hard to learn.
- LSTMs and GRUs use gates to keep information longer.
- Sequential steps, one fixed-size state and distance limits led to attention and transformers.

::quiz
? Why are RNNs slow to train on long sequences, even on GPUs?
+ Each step depends on the previous one, so steps cannot be computed in parallel
- Their weights are too large
- They have no hidden state
! The recurrence forces sequential computation across the sequence.
? What problem were LSTM gates designed to solve?
+ Vanishing gradients, which stop RNNs from learning long-range dependencies
- Too many parameters
- Slow inference on phones
! Gates let information and gradients pass along the cell state with little change.
::end
