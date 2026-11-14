---
minutes: 9
tech: []
refs:
  - gpt3: Section 2.2, “Training Dataset”, and Section 2.3, “Training Process”
  - chinchilla: Section 3, on choosing model size and tokens for a budget
  - aieng: Ch. 2, “Understanding Foundation Models”, on training data and pretraining
---
**Pretraining** is the first and by far the largest stage of making a language model: a [transformer](/lesson/transformer) learns to [predict the next token](/lesson/next-token) across trillions of tokens of text. It takes thousands of GPUs for weeks or months, and produces a **base model** that knows a great deal and is not yet an assistant.

## The data

Pretraining data is a carefully built mix, usually including:

- **Web pages**, from crawls, filtered heavily.
- **Books**, **scientific papers** and **encyclopaedias**.
- **Code** from public repositories.
- Text in **many languages**, and sometimes synthetic text written by other models.

Building it is a major engineering task, as [Where datasets come from](/lesson/datasets) introduced:

- **Filter** out spam, boilerplate, machine-generated junk, and harmful or private content.
- **Remove duplicates**, which otherwise are memorised and over-weighted.
- **Choose the mix**: how much code, how much of each language, how many times to repeat high-quality sources.
- **Clean** formatting so the text is useful.

Data quality often matters as much as model size. Small changes to the mix can change what the model is good at.

## The run

Following the [scaling laws](/lesson/scaling-laws), the team chooses a model size and a number of tokens for its compute budget. Then:

- Training runs on thousands of GPUs, with the parallelism of [Distributed training](/lesson/distributed-training).
- The learning rate warms up, then decays over the run.
- The loss is watched for spikes and divergence; checkpoints are saved regularly.
- Each token is usually seen once or a few times. The model learns from breadth, not repetition.

Training a frontier model can cost tens or hundreds of millions of dollars in compute.

## What comes out

A **base model** continues text. Give it the start of an email and it writes the rest; give it a question and it may answer, or write five more questions, depending on what such text usually looks like. It has broad knowledge and skill, which later stages shape into an assistant, as [Fine-tuning and instructions](/lesson/fine-tuning) explains.

Base models also have a **knowledge cut-off**: they know nothing about events after their data was collected.

## Later stages build on it

- **Mid-training** or continued pretraining on special data: long documents, code, maths, a particular domain.
- **Fine-tuning** on instructions and examples of good answers.
- **Learning from preferences**, and reinforcement learning for reasoning.

These stages use far less compute than pretraining, but change the model's behaviour a great deal.

## Remember

- Pretraining: next-token prediction on trillions of filtered, de-duplicated tokens.
- The data mix and its quality matter as much as model size.
- It takes thousands of GPUs for weeks or months and produces a base model.
- A base model continues text, has a knowledge cut-off, and is shaped into an assistant later.

::quiz
? Why are duplicate documents removed from pretraining data?
+ Repeated text is memorised and over-weighted, wasting compute and skewing the model
- Duplicates make the files too large to store
- Tokenisers cannot handle duplicates
! De-duplication improves both efficiency and what the model learns.
? A base model was pretrained on data collected up to 2023. What does it know about events in 2025?
+ Nothing, unless the information is given to it in the prompt
- Everything, because it predicts the future
- Only major events
! A model only knows what was in its training data, up to its cut-off.
::end
