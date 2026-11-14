---
minutes: 8
tech: []
refs:
  - dlbook: Section 15.2, “Transfer Learning and Domain Adaptation”
  - d2l: Section 14.2, “Fine-Tuning”
  - lora: Sections 1 and 4
---
Training a large model from nothing needs huge amounts of data and compute. Most practical work does not start from nothing. It starts from a model that someone already trained on a large, general dataset, and adapts it to a specific task with much less data. This is **transfer learning**, and it is how most AI products are built today.

## Why it works

A model trained on millions of images learns general [features](/lesson/features): edges, textures, shapes, parts of objects. A language model trained on trillions of words learns grammar, facts and patterns of reasoning. These are useful for almost any image or text task. Your task, such as spotting defects in a factory or sorting support tickets, needs only a little more on top.

## Ways to adapt

**Use it as a feature extractor.** Run your data through the pretrained model, take its internal vectors (embeddings), and train a small model, such as [logistic regression](/lesson/logistic-regression), on those. Fast and cheap; needs very little data.

**Fine-tune the top.** Replace the last layer with one for your classes, freeze the rest, and train only the new layer. Then optionally unfreeze more layers and train them with a small learning rate.

**Fine-tune everything.** Train all the weights on your data, with a much smaller learning rate than for training from scratch, so that useful knowledge is adjusted rather than overwritten.

**Parameter-efficient fine-tuning.** Keep the original weights frozen and train a small number of new ones. **LoRA** adds small low-rank matrices next to each large weight matrix, as [Eigenvectors and decompositions](/lesson/eigen) described, and trains only those, often under 1% of the parameters. It needs far less memory, and one base model can serve many tasks, each with its own small adapter.

**Prompting**, with no training at all, is often the first thing to try with large language models, as the lesson on prompting shows.

## Choosing

| You have | Try |
|---|---|
| Very little labelled data (tens to hundreds) | Prompting, or embeddings with a small classifier |
| Some data (thousands) | Fine-tune the top layers, or LoRA |
| Lots of data, a specialised domain | Full fine-tuning |

## Risks

- **Forgetting**: fine-tuning too hard on narrow data can damage the model's general abilities. Small learning rates and fewer trained parameters reduce this.
- **Domain gap**: a model pretrained on photos helps less with X-rays or satellite images, though usually still more than starting from random weights.
- **Inherited flaws**: biases and errors of the base model carry over, as [Bias in data](/lesson/data-bias) warned. So do its licence terms.

> **Rule of thumb.** Start from the strongest pretrained model that you can afford to run, and the least invasive adaptation that reaches your quality target.

## Remember

- Transfer learning adapts a model pretrained on general data to a specific task.
- Options: embeddings plus a small model, fine-tune the top, fine-tune everything, or LoRA.
- Use small learning rates; parameter-efficient methods save memory and preserve knowledge.
- Watch for forgetting, domain gaps and inherited flaws.

::quiz
? A team has 200 labelled support tickets to sort into 5 categories. What is a sensible first approach?
+ Use a pretrained model's embeddings with a small classifier, or prompt a language model
- Train a large transformer from random weights
- Collect a million more tickets first
! With little data, reuse what a pretrained model already knows.
? Why does LoRA need much less memory than full fine-tuning?
+ It trains only small added matrices, so far fewer gradients and optimiser states are stored
- It deletes most of the model
- It uses no GPU
! The original weights stay frozen; only the small adapters are trained.
::end
