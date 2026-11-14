---
minutes: 8
tech: []
refs:
  - mml: Section 5.2.2, “Chain Rule”, and Section 5.6, “Backpropagation and Automatic Differentiation”
  - karpathy: '“The spelled-out intro to neural networks and backpropagation: building micrograd”'
---
A neural network is a chain of functions, as [Functions and graphs](/lesson/math-functions) showed: each layer takes the output of the one before. To train it, you need to know how a change at the start of the chain affects the end. The **chain rule** answers this: the rate of change through a chain is the rates of change of each link, multiplied together.

## The rule

If y depends on u, and u depends on x, then:

`dy/dx = dy/du × du/dx`

**Example.** Let `u = 3x` and `y = u²`.

- `du/dx = 3`: u changes 3 times as fast as x.
- `dy/du = 2u`: y changes 2u times as fast as u.
- So `dy/dx = 2u × 3 = 6u = 18x`.

Check it directly: `y = (3x)² = 9x²`, whose derivative is 18x. The same answer.

## An everyday picture

A car's speed depends on how hard you press the pedal, and fuel use depends on speed. If pressing 1 cm more adds 10 km/h, and each extra km/h uses 0.02 more litres per hour, then pressing 1 cm more uses `10 × 0.02 = 0.2` more litres per hour. Rates multiply along the chain.

## Longer chains

The rule extends to any length. For `x → a → b → c → loss`:

`d loss/dx = d loss/dc × dc/db × db/da × da/dx`

## Computing backwards

Here is the trick that makes training possible. Suppose a network has many layers and millions of weights, and you want the derivative of the loss with respect to every weight.

1. **Forward pass**: run the input through the network, layer by layer, and keep each intermediate result.
2. **Backward pass**: start at the loss, where `d loss/d loss = 1`. Move backwards through the layers. At each step, multiply by that layer's local derivative. Each layer receives "how much does the loss change if my output changes?" from the layer after it, and passes "how much does the loss change if my input changes?" to the layer before it.

Along the way, each weight's derivative is computed from the value flowing past it. One backward pass gives the derivative for every weight, for about the cost of the forward pass. This is **backpropagation**, which the Neural networks line covers in full.

> **For experienced readers.** This is reverse-mode automatic differentiation. It is efficient because a network has many inputs (weights) and one output (the loss): going backwards computes all input derivatives in one pass.

## Products can explode or vanish

Because derivatives multiply along the chain, long chains are fragile. If each link multiplies by 0.5, after 30 layers the signal is about a billionth of its size: it **vanishes**. If each multiplies by 2, it **explodes** to about a billion. Much of the design of deep networks, such as choice of activations, initialisation and residual connections, exists to keep these products near 1.

## Remember

- Through a chain, rates of change multiply: dy/dx = dy/du × du/dx.
- A network is a chain of layers, so the rule applies layer by layer.
- Backpropagation applies it backwards from the loss, giving every weight's derivative in one pass.
- Long products can vanish or explode; network design keeps them stable.

::quiz
? If `u = 2x + 1` and `y = 5u`, what is `dy/dx`?
- 5
+ 10
- 2
! dy/du = 5 and du/dx = 2, so dy/dx = 5 × 2 = 10.
? In a 40-layer chain, each layer's local derivative is about 0.8. What happens to the derivative at the first layer?
+ It becomes tiny: 0.8 to the power 40 is about 0.0001
- It stays about 0.8
- It becomes very large
! Multiplying many numbers below 1 shrinks the product towards zero: the vanishing gradient problem.
::end
