---
minutes: 7
tech: []
refs:
  - nucleus: Sections 1, 3 and 3.1, on degeneration and nucleus sampling
  - aieng: Ch. 2, “Understanding Foundation Models”, section on sampling
---
At each step of [generation](/lesson/generation), the model gives a probability to every possible next token. Something must choose one. That choice, **sampling**, decides whether the output is predictable or creative, repetitive or varied, and it is controlled by a few settings you will see in every model API.

## Greedy: always the most likely

**Greedy decoding** picks the highest-probability token every time. Same prompt, same answer. Good for short, factual outputs and extracting data. For longer text it tends to be dull, and often falls into loops, repeating a phrase again and again, because a repeated phrase becomes ever more probable.

## Random sampling

Pick each token at random, in proportion to its probability. A token with probability 0.3 is chosen 30% of the time. Output is varied and natural, but occasionally the model picks a very unlikely token, and one strange choice can derail the rest of the text.

## Temperature

Divide the scores by a **temperature** T before [softmax](/lesson/softmax):

- **T = 0** (in practice): the same as greedy.
- **T below 1**: sharpens the distribution. Likely tokens become even more likely. More focused, more predictable.
- **T = 1**: the model's own distribution.
- **T above 1**: flattens it. Unlikely tokens get more chance. More surprising, and more likely to go wrong.

## Top-k and top-p

These cut off the long tail of unlikely tokens before sampling:

- **Top-k**: keep only the k most likely tokens, such as 40, and sample among them.
- **Top-p** (nucleus sampling): keep the smallest set of tokens whose probabilities add up to p, such as 0.9, and sample among them. When the model is confident, that set is small; when many continuations fit, it is larger. This adapts better than a fixed k.

Temperature and top-p are often used together.

::fig ai-sampling | Set the temperature and top-p, then draw the next word 50 times.

## Choosing settings

| Task | Typical setting |
|---|---|
| Extracting data, classifying, code fixes | Temperature 0 or low |
| Answering questions, summaries | Low to moderate |
| Brainstorming, stories, varied wording | Higher temperature, top-p around 0.9 |

Even at temperature 0, outputs are not always exactly the same between runs, because of tiny numeric differences in how GPUs batch and add numbers. Do not rely on byte-for-byte repeatability.

## Other controls

- **Stop sequences**: end generation when a given string appears.
- **Maximum tokens**: a hard limit on answer length.
- **Penalties** for repetition: lower the probability of tokens already used.

> **For experienced readers.** Reasoning models and some APIs fix or restrict sampling settings, because their training assumed particular values. Check the provider's guidance before changing them.

## Remember

- Greedy picks the top token: repeatable, dull, and prone to loops.
- Random sampling follows the probabilities; temperature sharpens or flattens them.
- Top-k and top-p remove unlikely tokens before sampling; top-p adapts to the model's confidence.
- Use low temperature for exact tasks and higher for creative ones; do not expect perfect repeatability.

::quiz
? A tool extracts dates from invoices into JSON. Which setting fits?
+ Temperature 0 or very low
- Temperature 1.5
- Top-p 0.99 with high temperature
! Extraction needs the single most likely, consistent answer.
? With top-p = 0.9, the top three tokens have probabilities 0.6, 0.25 and 0.1. Which are kept?
+ All three, since 0.6 + 0.25 + 0.1 = 0.95 is the first total to reach 0.9
- Only the first
- The first two
! The first two add up to 0.85, which is below 0.9, so the third is needed too.
::end
