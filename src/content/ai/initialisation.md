---
minutes: 7
tech: []
refs:
  - glorot: Sections 4 and 4.2.1, on variance through layers and normalised initialisation
  - heinit: Section 2.2, “Initialization of Filter Weights for Rectifiers”
  - udl: Ch. 7, “Gradients and Initialization”, on initialisation
---
Before training starts, every weight needs a value. That choice looks minor, and for small networks it often is. For deep networks it decides whether training works at all. Start the weights too small and signals fade to nothing as they pass through the layers; too large and they explode.

## Why not zeros?

If every weight starts at zero, or at the same value, every neuron in a layer computes the same thing and gets the same gradient. They stay identical for ever, and the layer behaves like a single neuron. So weights must start **random**, to break the symmetry.

Biases can usually start at zero.

## Why the size matters

Each layer multiplies its input by a weight matrix. With n inputs per neuron, the output's spread grows with n and with the weights' spread, as [Expectation and variance](/lesson/expectation) described:

- Weights too small: each layer shrinks the signal. After 50 layers, the activations are nearly zero, and so are the gradients.
- Weights too large: each layer grows it. After 50 layers, values overflow.

The aim is to keep the **variance of the activations** about the same from layer to layer, both forward and backward.

## The standard recipes

Draw weights from a normal (or uniform) distribution with a variance that depends on the number of inputs to the layer, called its **fan-in**:

- **Xavier (Glorot) initialisation**: variance about 1 / fan-in (or 2 / (fan-in + fan-out)). Suits tanh and sigmoid.
- **He (Kaiming) initialisation**: variance 2 / fan-in. Suits ReLU, which sets about half its inputs to zero, so the variance needs to be twice as large to compensate.

**Example.** A ReLU layer with 512 inputs: weights from a normal distribution with standard deviation √(2/512) = 0.0625.

Deep learning libraries use sensible defaults for each layer type, so you rarely set this yourself. You need to know it when you design a new layer, or when training a deep model fails from the first steps.

## Large models

Very deep transformers add further care: residual branches are often scaled down at the start, so that each block initially adds only a small change to the [residual stream](/lesson/residual). With residual connections and normalisation, training is much less sensitive to initialisation than for plain deep networks, but not immune.

> **Pitfall.** If a deep network's loss does not move at all from the first step, or turns into NaN within a few steps, check the initialisation and the scale of the inputs before anything else.

## Remember

- Weights start random, to break symmetry. Biases can start at zero.
- The scale must keep activation variance steady through layers.
- Xavier for tanh and sigmoid, He for ReLU: variance based on the number of inputs.
- Libraries set good defaults; residual connections and normalisation reduce the sensitivity.

::quiz
? Every weight of a layer starts at the same value. What happens?
+ All neurons in the layer stay identical, so it acts like one neuron
- Training is faster
- The network learns normally
! Identical neurons get identical gradients, so the symmetry is never broken.
? A ReLU layer has 200 inputs. What is the He initialisation standard deviation?
+ 0.1
- 0.01
- 2
! √(2 / 200) = √0.01 = 0.1.
::end
