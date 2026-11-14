---
minutes: 8
tech: []
refs:
  - mml: Section 5.1, “Differentiation of Univariate Functions”
  - d2l: Section 2.4.1, “Derivatives and Differentiation”
---
The **derivative** of a function tells you how fast its output changes when its input moves a little. It is the slope of the graph at a point. Training a model is, at heart, repeatedly asking "if I nudge this setting, does the error go up or down, and how fast?". The derivative is that answer.

## Slope

For a straight line, the slope is the same everywhere: `f(x) = 3x + 1` rises by 3 for each step of 1. Its derivative is 3.

For a curve, the slope changes from point to point. On `f(x) = x²`:

- At x = 1, the curve rises gently.
- At x = 3, it rises steeply.
- At x = 0, it is flat for an instant: the bottom of the U.

The derivative is the slope of the straight line that just touches the curve at a point, the **tangent**.

## How to find it

Move the input by a tiny amount h, and see how much the output changes:

`slope ≈ (f(x + h) - f(x)) / h`

As h gets smaller and smaller, this gets closer to the exact derivative, written `f'(x)` or `df/dx`.

Try it for `f(x) = x²` at x = 3 with h = 0.001: `(3.001² - 3²) / 0.001 = (9.006001 - 9) / 0.001 = 6.001`. The exact answer is 6.

## Rules to know

You rarely compute derivatives by hand; libraries do it. But a few rules make the ideas clear:

| Function | Derivative |
|---|---|
| A constant, such as 5 | 0 (it does not change) |
| `x` | 1 |
| `x²` | `2x` |
| `xⁿ` | `n xⁿ⁻¹` |
| `eˣ` | `eˣ` |
| `log(x)` | `1/x` |
| `a × f(x)` | `a × f'(x)` |
| `f(x) + g(x)` | `f'(x) + g'(x)` |

So the derivative of `x²` is `2x`: at x = 3 it is 6, as computed above.

## What the derivative tells you

- **Positive**: the output rises as the input grows. To lower the output, move the input down.
- **Negative**: the output falls as the input grows. To lower it, move the input up.
- **Zero**: a flat point, possibly a minimum, a maximum, or a pause.
- **Large size**: the output is sensitive to this input.

This is the whole idea of [gradient descent](/lesson/gradient-descent) later on: look at the slope of the error, and step the opposite way.

> **For experienced readers.** Libraries such as PyTorch and JAX compute exact derivatives of whole programs with **automatic differentiation**, which applies these rules and the chain rule step by step. Numeric estimates with a small h are mostly used to check that code.

## Remember

- The derivative is the slope of a function at a point: how fast the output changes.
- It is the limit of (change in output) / (small change in input).
- Its sign says which way the output moves; zero means a flat point.
- To make an output smaller, move the input against the slope.

::quiz
? What is the derivative of `f(x) = x²` at x = 5?
- 5
+ 10
- 25
! The derivative of x² is 2x, so at x = 5 it is 10.
? The derivative of a model's error with respect to one setting is -4. To reduce the error, which way should the setting move?
+ Up: increase it a little
- Down: decrease it a little
- Leave it
! A negative slope means the error falls as the setting grows. Step against the slope.
::end
