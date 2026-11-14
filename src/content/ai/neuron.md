---
minutes: 8
tech: []
refs:
  - udl: Ch. 3, “Shallow Neural Networks”
  - dlbook: Ch. 6, “Deep Feedforward Networks”, Section 6.1
---
Every neural network, from a digit reader to a large language model, is built from one simple unit repeated millions of times: the **artificial neuron**. It takes a weighted sum of its inputs, adds a constant, and passes the result through a bend. Put many side by side and you have a **layer**.

## One neuron

A neuron with inputs x₁, x₂, …, xₙ:

1. Multiply each input by its weight and add them up, plus a bias: `z = w · x + b`. This is the [dot product](/lesson/dot-product) plus a constant, the same as in [Logistic regression](/lesson/logistic-regression).
2. Pass z through an **activation function** f: `output = f(z)`.

If f is the sigmoid, one neuron is exactly logistic regression. Modern networks usually use simpler bends, such as ReLU, which outputs `max(0, z)`.

**Example.** Inputs [2, 1], weights [0.5, -1], bias 0.5:
z = 0.5×2 + (-1)×1 + 0.5 = 0.5. With ReLU, the output is 0.5.

## What a neuron "looks for"

The weights define a direction in input space. The neuron gives a large output when the input points that way, and a small (or zero) output otherwise. You can think of each neuron as a detector for one pattern in its inputs: a certain edge in an image, a certain combination of words.

The name comes from a loose analogy with brain cells, which receive signals and fire when stimulated enough. Real neurons are far more complicated; the analogy should not be taken further than that.

::fig ai-neuron | One neuron with two inputs. Change the weights and the bias and watch the boundary line move.

## A layer

A **layer** is many neurons that all see the same inputs, each with its own weights and bias. With 3 inputs and 4 neurons, the weights form a 4 × 3 matrix W, the biases a vector b of 4, and the whole layer computes:

`output = f(W x + b)`

One [matrix multiplication](/lesson/matrix-multiply), one vector addition, and the activation applied to each value. This is why AI hardware is built for matrix multiplication.

A layer where every input connects to every neuron is called **fully connected**, **dense**, or **linear** in most libraries.

## Counting parameters

A dense layer from n inputs to m neurons has n × m weights plus m biases. From 784 pixel inputs to 128 neurons: 784 × 128 + 128 = 100,480 parameters. Parameters add up fast; large language models have billions.

## What one layer can and cannot do

One layer of neurons can only draw straight boundaries between classes, like logistic regression. The power comes from stacking layers with bends between them, as [Activation functions](/lesson/activations) and [Deep networks](/lesson/deep-networks) explain.

## Remember

- A neuron computes a weighted sum plus a bias, then applies an activation function.
- With a sigmoid, one neuron is logistic regression.
- A layer is many neurons on the same inputs: f(W x + b), one matrix multiplication.
- A dense layer from n to m units has n × m + m parameters.

::quiz
? A neuron has weights [1, 2], bias -3, and ReLU. What is its output for input [1, 1]?
+ 0
- 3
- -3
! z = 1 + 2 - 3 = 0, and ReLU of 0 is 0.
? How many parameters does a dense layer from 100 inputs to 10 neurons have?
+ 1,010
- 1,000
- 110
! 100 × 10 weights plus 10 biases.
::end
