---
minutes: 8
tech: []
refs:
  - cover: Section 2.3, “Relative Entropy and Mutual Information”
  - dlbook: Section 3.13, “Information Theory”, and Section 6.2.1.1, “Learning Conditional Distributions with Maximum Likelihood”
---
To train a model that outputs probabilities, you need one number that says how far its guesses are from the truth. **Cross-entropy** is that number. It is the loss that trains nearly every classifier and every language model. Its close relative, **KL divergence**, measures how different two distributions are.

## Cross-entropy

If the true distribution is p and the model's is q, the cross-entropy is the average surprise of the model, on outcomes drawn from the truth:

`H(p, q) = -Σ p(x) log q(x)`

In classification, the truth puts probability 1 on the correct answer and 0 elsewhere. Then the sum has only one term:

`loss = -log q(correct answer)`

That is the [surprise](/lesson/bits) of the model at the right answer.

## An example

The correct answer is "cat".

| Model's probability for "cat" | Loss (natural log) |
|---|---|
| 0.9 | 0.105 |
| 0.5 | 0.693 |
| 0.1 | 2.303 |
| 0.01 | 4.605 |

The loss is near zero when the model is confident and right, and grows without limit as the model gives the right answer less probability. Being confidently wrong is punished hard.

## Why this loss

- It is the **negative log-likelihood** from [Likelihood](/lesson/likelihood). Minimising it is maximum likelihood training.
- Combined with [softmax](/lesson/softmax), its gradient for each score is simply `predicted probability - true probability`: clean, and well behaved for training.
- For a language model, the average cross-entropy per token is how its training progress is measured. Lower means it predicts real text better.

**Perplexity**, often reported for language models, is the exponential of the average cross-entropy. A perplexity of 20 means the model is, on average, as uncertain as if it chose uniformly among 20 tokens.

## KL divergence

The **Kullback–Leibler divergence** measures how much worse it is to use q when the truth is p:

`KL(p ‖ q) = H(p, q) - H(p) = Σ p(x) log (p(x) / q(x))`

- It is zero only when q equals p.
- It is always zero or more.
- It is **not symmetric**: KL(p ‖ q) is not KL(q ‖ p). It is not a true distance.

Since H(p), the [entropy](/lesson/entropy) of the truth, does not depend on the model, minimising cross-entropy and minimising KL divergence give the same model.

## Where KL appears

- **Fine-tuning with feedback**: a penalty on the KL divergence between the new model and the original keeps it from drifting too far while it learns preferences.
- **Distillation**: a small model is trained to match a large model's whole output distribution, by minimising the KL between them.
- **Variational methods** in generative models.

## Remember

- Cross-entropy: the model's average surprise at the true outcomes. For classification, -log q(correct).
- It punishes confident mistakes hard, and is the negative log-likelihood.
- Perplexity is the exponential of average cross-entropy.
- KL divergence = cross-entropy minus the truth's entropy. Not symmetric. Used to keep models close.

::quiz
? A model gives the correct class a probability of 1.0. What is its cross-entropy loss on that example?
+ 0
- 1
- Infinite
! -log 1 = 0. No surprise at all.
? Model A gives the right answer probability 0.4; model B gives 0.04. Which loss is higher, and by about how much (natural log)?
+ B, by about 2.3
- A, by about 2.3
- They are the same
! -ln 0.04 ≈ 3.22 and -ln 0.4 ≈ 0.92. The difference is ln 10 ≈ 2.3.
::end
