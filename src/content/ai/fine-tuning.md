---
minutes: 8
tech: []
refs:
  - instructgpt: Sections 1, 3.1 and 3.5, on supervised fine-tuning
  - aieng: Ch. 7, “Finetuning”
  - lora: Section 4, “Our Method”
---
A base model from [pretraining](/lesson/pretraining) continues text; it does not reliably follow instructions or answer as a helpful assistant. **Fine-tuning** continues training on a much smaller, carefully chosen dataset, to change how the model behaves. Turning a base model into an assistant is the best-known example; adapting a model to a company's tasks and style is another.

## Instruction tuning

Collect examples of the behaviour you want: a prompt and an ideal response.

- "Summarise this email in two sentences." → a good two-sentence summary.
- "Write a Python function that reverses a list." → correct code with a short explanation.
- "How do I pick a lock to break into my neighbour's house?" → a refusal that explains why.

Train the model on these with the same next-token loss as pretraining, but only on the response tokens. This **supervised fine-tuning** (SFT) teaches the format of a conversation, how to follow instructions, and a default tone. Tens of thousands of good examples change behaviour a great deal, because the base model already has the knowledge; fine-tuning mostly teaches how to use it.

## Chat format

Conversations are written with special tokens that mark who is speaking: system, user, assistant. The model learns to generate only the assistant's turns. Using the exact format a model was trained with matters; libraries and APIs handle it for you.

## Fine-tuning for your own use

You can fine-tune a model, open or through a provider's API, on your own data, for example to:

- Follow a strict output format, every time.
- Write in a company's tone.
- Handle a narrow task, such as classifying support tickets, with a smaller, cheaper model.

**LoRA** and similar methods, from [Transfer learning](/lesson/transfer), make this affordable.

## When fine-tuning is the wrong tool

- **To add knowledge**, especially facts that change. Fine-tuning on documents teaches style more reliably than facts, and the model can still mix them up. Giving the model the documents at the time of the question, with [retrieval](/lesson/rag), is usually better.
- **Before trying prompting.** A clear prompt with a few examples often reaches the same quality with no training, as the lesson on prompting shows.

> **Rule of thumb.** Prompt first; add retrieval for knowledge; fine-tune for consistent format, style or a narrow task at lower cost.

## What comes next

Supervised examples show one good answer, but cannot easily teach "this answer is better than that one". [Learning from preferences](/lesson/preferences) adds that.

## Remember

- Fine-tuning continues training on a small, chosen dataset to change behaviour.
- Instruction tuning on prompt–response pairs turns a base model into an assistant.
- Fine-tune for format, style and narrow tasks; use retrieval for knowledge.
- Prompt first. LoRA makes fine-tuning affordable.

::quiz
? A company's product prices change every week. How should a chat assistant answer price questions?
+ Retrieve current prices and give them to the model in the prompt
- Fine-tune the model on the price list every week
- Pretrain a new model
! Facts that change belong in the context at question time, not in the weights.
? During supervised fine-tuning, which tokens is the loss usually computed on?
+ The response tokens
- The prompt tokens
- Every token in the training data equally
! The model learns to produce good responses; the prompt is given, not predicted.
::end
