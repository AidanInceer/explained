---
minutes: 8
tech: []
refs:
  - adam: Section 2, “Algorithm”
  - dlbook: Section 8.3.2, “Momentum”, and Section 8.5, “Algorithms with Adaptive Learning Rates”
---
Plain [stochastic gradient descent](/lesson/sgd) uses only the current gradient, and the same step size for every weight. Two improvements fix its main weaknesses. **Momentum** remembers the direction of recent steps, so progress builds up along a valley. **Adaptive** methods give each weight its own step size. **Adam** combines both, and is the default optimiser for most deep learning today.

## Momentum

Imagine a ball rolling downhill. It does not stop and restart at each point; it builds up speed in a steady direction, and small bumps do not turn it.

Momentum keeps a running average of past gradients, the **velocity** v:

`v ← β × v + gradient`
`w ← w - η × v`

with β often 0.9. Effects:

- **In a narrow ravine**, the gradients across the valley point back and forth, and largely cancel in the average. The gradients along the valley agree, and add up. The zig-zag shrinks and progress speeds up.
- **Noise** from small batches is smoothed.
- **Flat stretches** are crossed using the speed built up before.

## Adaptive step sizes

Some weights get large gradients all the time; others get small or rare ones, such as the embedding of a rare word. One learning rate cannot suit both. Adaptive methods keep a running average of each weight's **squared** gradients, and divide its step by the square root of that. Weights with big, steady gradients take smaller steps; weights with small, rare gradients take relatively larger ones. RMSProp works this way.

## Adam

**Adam** (adaptive moment estimation), published in 2014, keeps two running averages for every weight:

- m: the average gradient (momentum), with β₁ usually 0.9.
- v: the average squared gradient (adaptive scale), with β₂ usually 0.999.

Each step moves the weight by about `η × m / (√v + ε)`, with a small correction at the start, because both averages begin at zero. The small ε avoids division by zero.

Adam works well with little tuning across a wide range of models, which is why it is the common default. **AdamW** is a version that handles weight decay, a form of regularisation, more correctly, and is the usual choice for training transformers.

::fig ai-momentum | A long, narrow valley seen from above. Compare the paths of plain gradient descent, momentum and Adam.

## The cost

Adam stores two extra numbers for every weight. For a model with 7 billion weights, that is 14 billion extra numbers, often in 32-bit precision: about 56 GB of memory for optimiser state alone, more than the weights themselves in 16-bit precision. This matters a lot when training large models, as the lesson on many chips explains.

> **For experienced readers.** Well-tuned SGD with momentum can still match or beat Adam on some vision tasks, and generalise slightly better. For transformers and language models, AdamW is the standard.

## Remember

- Momentum averages recent gradients: faster along valleys, less zig-zag, less noise.
- Adaptive methods give each weight its own step size from its gradient history.
- Adam combines both. AdamW is the usual choice for transformers.
- Adam's per-weight state costs a lot of memory for large models.

::quiz
? In a narrow ravine, gradients point alternately left and right across it, and slightly forward along it. What does momentum do?
+ The sideways parts cancel in the average, and the forward parts add up, so progress along the ravine speeds up
- It makes the zig-zag worse
- It stops all movement
! Averaging over steps cancels the alternating component and accumulates the consistent one.
? How many extra numbers per weight does Adam store?
+ Two: an average gradient and an average squared gradient
- None
- One
! Adam keeps the first and second moment estimates for each weight.
::end
