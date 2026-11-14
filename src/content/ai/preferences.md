---
minutes: 9
tech: []
refs:
  - instructgpt: Sections 3.5 and 4, on reward models and PPO training
  - dpo: Sections 1 and 4
  - constitutional: Sections 1 and 3
---
[Fine-tuning](/lesson/fine-tuning) on examples teaches a model what one good answer looks like. But "good" has many shades: helpful, accurate, honest, kind, safe, concise. People find it much easier to say which of two answers is **better** than to write the perfect one. **Learning from preferences** uses these comparisons to tune a model. The best-known method is **reinforcement learning from human feedback** (RLHF).

## Collecting preferences

1. Give the model a prompt and generate two or more answers.
2. A person chooses the better one, following written guidelines, as [Labels and labelling](/lesson/labelling) described.
3. Repeat for many thousands of prompts.

The result is a dataset of pairs: for this prompt, answer A is preferred to answer B.

## RLHF: reward model, then reinforcement learning

**Step 1: train a reward model.** A separate model, often a copy of the language model with a new output layer, learns to give each answer a score, so that preferred answers score higher than rejected ones.

**Step 2: optimise the language model against it.** The model generates answers; the reward model scores them; a [reinforcement learning](/lesson/rl) algorithm, often PPO, adjusts the language model to produce higher-scoring answers.

A **KL penalty**, from [Cross-entropy and KL divergence](/lesson/cross-entropy), keeps the tuned model close to the original. Without it, the model drifts towards strange text that happens to fool the reward model.

## Direct preference optimisation

**DPO** skips the separate reward model and the reinforcement learning loop. It uses the preference pairs directly, with a loss that raises the probability of the preferred answer relative to the rejected one, compared with the original model. Simpler and more stable to run, it is widely used, along with many related methods.

## AI feedback

Collecting human comparisons is slow and costly, and people are inconsistent. In **constitutional AI** and **RLAIF**, a model compares answers itself, guided by a written set of principles, and its judgements train the reward model or the preference loss. People still write the principles and check the results.

## What it changes

Preference tuning makes models more helpful, more willing to follow instructions, better at refusing harmful requests, and more pleasant to talk to. It is a large part of the difference between a base model and a product.

## Known problems

- **Reward hacking**: the model learns what the reward model likes, not what people want. Longer answers, confident tone, or excessive caveats can score well without being better.
- **Sycophancy**: agreeing with the user's stated views, or praising their work, because raters tended to prefer it.
- **Whose preferences?** Guidelines and raters bring particular values; different groups prefer different things.

> **For experienced readers.** Reinforcement learning with **verifiable rewards**, such as checking a maths answer or running code tests, avoids the reward model's weaknesses where a correct answer can be checked automatically. It is central to [Reasoning models](/lesson/reasoning-models).

## Remember

- People compare answers; comparisons are easier and more consistent than writing ideal answers.
- RLHF: train a reward model on comparisons, then optimise the model with RL and a KL penalty.
- DPO learns from preference pairs directly; AI feedback scales the comparisons.
- Watch for reward hacking and sycophancy, and ask whose preferences are encoded.

::quiz
? What does the KL penalty in RLHF prevent?
+ The model drifting far from its original behaviour to exploit the reward model
- The reward model from training
- The model from learning anything
! It keeps the tuned model close to the starting point, limiting reward hacking.
? After preference tuning, a model gives ever longer answers that users find tiring. A likely cause?
+ The reward model or raters favoured longer answers, and the model learned that
- The context window is too small
- The temperature is too low
! Models optimise what is rewarded. A bias towards length is a common form of reward hacking.
::end
