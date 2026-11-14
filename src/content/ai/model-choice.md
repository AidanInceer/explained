---
minutes: 8
tech: []
refs:
  - aieng: Ch. 4, “Evaluate AI Systems”, on model selection, and Ch. 9, “Inference Optimization”
---
There are many models to choose from: large and small, from different providers, hosted or open, general or specialised. The best model on a leaderboard is rarely the best choice for a product. The right choice balances **quality**, **cost**, **speed** and **control** for your specific task.

## The trade-offs

| | Larger model | Smaller model |
|---|---|---|
| Quality on hard tasks | Higher | Lower |
| Cost per request | Higher | Often many times lower |
| Speed | Slower | Faster |
| Good for | Complex reasoning, writing, coding, agents | Classification, extraction, simple chat, high volume |

Cost is counted in tokens, as [Tokens and tokenisers](/lesson/tokens) explained: usually a price per million input tokens and a higher price per million output tokens. A task that sends long documents is dominated by input cost; one that writes long answers, by output cost.

## Hosted or open

- **Hosted models through an API**: strongest models, no infrastructure, pay per use. Your data goes to the provider, under their terms. You depend on their availability and on version changes.
- **Open-weight models** that you run yourself, or through a hosting service: full control, can be fine-tuned freely, data stays where you choose, costs depend on your hardware and volume. Usually somewhat behind the strongest hosted models, and you run the infrastructure. The lesson [Running models on your machine](/lesson/local-models) covers the small end of this.

## How to choose

1. **Define the task and the quality bar** with an evaluation set of real examples, as [Evaluating models](/lesson/evals) explains.
2. **Start with a strong model** to see what is possible.
3. **Try smaller, cheaper models** on the same set. Many tasks lose little quality.
4. **Compare cost and speed** at your expected volume, including input and output tokens.
5. **Check the non-functional needs**: data location and privacy, latency, rate limits, uptime, licence.

## Combine models

- **Routing**: send easy requests to a small model and hard ones to a large one, decided by rules or by a small classifier.
- **Cascades**: try the small model first; if its answer fails a check, or it is not confident, escalate.
- **Specialists**: a fine-tuned small model for one high-volume task, as in [Fine-tuning and instructions](/lesson/fine-tuning), and a general model for the rest.

## Cut costs without changing models

- Shorter prompts; send only relevant context.
- **Prompt caching** for long shared prefixes, as in [How text is generated](/lesson/generation).
- Shorter outputs: ask for concise answers or structured data.
- **Batch** processing for work that does not need an instant answer, often at lower prices.

> **Pitfall.** Models are updated and retired. Pin the exact model version in production, and re-run your evaluation set before you switch.

## Remember

- Choose for your task: quality, cost, speed and control, not leaderboard rank.
- Hosted APIs offer the strongest models; open weights offer control and privacy.
- Evaluate on your own examples; try smaller models; check volume costs.
- Route and cascade between models; cut tokens; pin versions and re-test on change.

::quiz
? A task classifies 2 million short support messages per day into 8 categories. Which approach is likely best?
+ Test a small, cheap model, possibly fine-tuned, against the evaluation set
- Always use the largest available model
- Use a reasoning model with a large thinking budget
! High-volume, simple tasks often run well on small models at a fraction of the cost.
? Why pin a specific model version in production?
+ A provider's update can change behaviour, so you re-test before switching
- Pinned versions are free
- Newer versions are always worse
! Version changes can break prompts and outputs. Control when the change happens.
::end
