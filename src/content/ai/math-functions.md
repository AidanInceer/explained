---
minutes: 7
tech: []
refs:
  - mml: Section 5.1, “Differentiation of Univariate Functions”, opening
  - d2l: Section 2.4, “Calculus”
---
A **function** takes an input and gives an output by a fixed rule. A machine learning model is a function too: pixels in, "cat" or "dog" out; a sentence in, the next word out. Calculus, the next few lessons, is the study of how a function's output changes when its input changes, which is exactly what training needs to know.

## Input, rule, output

`f(x) = 2x + 1`

Give it 3, get 7. Give it 0, get 1. The same input always gives the same output.

A function can take many inputs: `area(width, height) = width × height`. Or one vector, as in [Vectors](/lesson/vectors): a model takes a vector of 784 pixel values and gives a vector of 10 scores.

## Graphs

A **graph** draws a function: the input along the horizontal axis, the output up the vertical one. The graph shows the shape of the rule at a glance:

- `2x + 1` is a straight line: a **linear** function. Each step to the right adds the same amount.
- `x²` is a U-shaped curve, a **parabola**, with its lowest point at 0.
- `eˣ`, the **exponential**, grows faster and faster.
- `log(x)`, the **logarithm**, grows ever more slowly. It is the reverse of the exponential.

## Some shapes that AI uses everywhere

- **The sigmoid**, `1 / (1 + e⁻ˣ)`: an S-shaped curve that squeezes any number into the range 0 to 1. Useful to turn a score into a probability.
- **ReLU**, `max(0, x)`: zero for negative inputs, the input itself for positive ones. A bend, used between layers of neural networks.
- **The logarithm**: it turns products into sums, `log(a × b) = log(a) + log(b)`, and it is how models measure how wrong a probability was.

## Composition: functions in a chain

The output of one function can be the input of the next:

`g(f(x))`: first apply f, then g.

If `f(x) = 2x + 1` and `g(y) = y²`, then `g(f(3)) = g(7) = 49`.

A neural network is a long chain like this: each layer is a function applied to the output of the one before. To train it, you need to know how a small change in the first input, or in any setting along the way, changes the final output. The [chain rule](/lesson/chain-rule) answers that.

## Minimum and maximum

The lowest point of a function, its **minimum**, is where the output is smallest. Training a model means finding the settings where its error is at a minimum. For `x²` the minimum is at x = 0. For a model with millions of settings, finding it is the whole problem that the Optimisation line addresses.

## Remember

- A function maps each input to one output. A model is a function.
- Graphs show shape: linear, curved, exponential, logarithmic.
- Sigmoid, ReLU and logarithm appear throughout AI.
- Networks are chains of functions. Training looks for the minimum of the error.

::quiz
? With `f(x) = x + 4` and `g(y) = 3y`, what is `g(f(2))`?
- 10
+ 18
- 14
! f(2) = 6, then g(6) = 18.
? What does ReLU give for an input of -3 and an input of 5?
+ 0 and 5
- -3 and 5
- 0 and 1
! ReLU is max(0, x): negative inputs become 0, positive ones pass through.
::end
