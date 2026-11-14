---
minutes: 8
tech: []
refs:
  - islp: Section 4.3, “Logistic Regression”
  - d2l: Section 4.1, “Softmax Regression”
---
Linear regression predicts any number. For a yes-or-no question, such as "is this email spam?", you want a **probability** between 0 and 1. **Logistic regression** takes the weighted sum from [linear regression](/lesson/linear-regression) and squeezes it into that range. Despite its name, it is a method for classification, and it is exactly what a single neuron in a neural network does.

## The model

1. Compute a weighted sum, the **score** or **logit**: `z = w · x + b`.
2. Pass it through the **sigmoid**: `p = 1 / (1 + e⁻ᶻ)`.

The sigmoid, from [Functions and graphs](/lesson/math-functions), maps any score to a probability:

- z = 0 gives p = 0.5.
- Large positive z gives p near 1.
- Large negative z gives p near 0.

To make a decision, compare p with a **threshold**, usually 0.5.

## The loss

Use **cross-entropy** (also called log loss), from [Cross-entropy and KL divergence](/lesson/cross-entropy):

- If the true answer is yes: loss = -log p.
- If it is no: loss = -log(1 - p).

Confident and right gives a loss near zero; confident and wrong gives a large loss. The problem is [convex](/lesson/convexity), and training with gradient descent finds the best weights. The gradient has a clean form: for each example, `(p - y) × x`, where y is 1 or 0.

## The decision boundary

The points where p = 0.5 are where `w · x + b = 0`: a straight line (or flat plane) through the input space. On one side the model says yes; on the other, no. So logistic regression separates classes with a straight boundary. Curved boundaries need curved features, or a neural network.

## More than two classes

For several classes, compute one score per class and turn them into probabilities with [softmax](/lesson/softmax). This is **multinomial** logistic regression, or **softmax regression**. The last layer of most classifiers, and of every language model, is exactly this.

## Reading it

Each weight shows how an input moves the odds. A positive weight on "contains the word prize" pushes towards spam. Specifically, increasing that input by one multiplies the odds `p / (1 - p)` by e^w.

## Choosing the threshold

0.5 is not always right. For a disease screen, missing a case is worse than a false alarm, so you might flag anyone above 0.2. For a filter that deletes emails, you might require 0.95. The threshold is a business decision, made with the measures in [Measuring a model](/lesson/metrics).

## Remember

- Logistic regression: weighted sum, then sigmoid, gives a probability.
- It is trained with cross-entropy; the problem is convex.
- Its decision boundary is a straight line or plane.
- With softmax it handles many classes; it is the last layer of most classifiers.

::quiz
? A logistic regression computes a score z = 0. What probability does it give?
+ 0.5
- 0
- 1
! The sigmoid of 0 is 1 / (1 + 1) = 0.5.
? Missing a fraud costs far more than checking a false alarm. How should the threshold change?
+ Lower it, so more cases are flagged
- Raise it to 0.99
- Keep it at 0.5
! A lower threshold catches more of the costly cases, at the price of more false alarms.
::end
