---
minutes: 8
tech: []
refs:
  - gpt3: Sections 1 and 2, on language modelling and in-context learning
  - karpathy: '“Let''s build GPT: from scratch, in code, spelled out”'
---
A large language model is trained on one simple task: given the text so far, predict the next token. That is all. From this one task, repeated over trillions of tokens, models learn grammar, facts, styles, translation, and patterns that look like reasoning. Understanding why is the key to understanding what these models are, and what they are not.

## The task

Take a sentence from the training text: "The cat sat on the mat." The model sees "The" and must predict "cat"; sees "The cat" and must predict "sat"; and so on. At each position, it outputs a probability for every token in its vocabulary, through [softmax](/lesson/softmax), and the loss is the [cross-entropy](/lesson/cross-entropy) of the true next token.

One document gives thousands of training examples, one per position, and no human labels are needed: the text is its own answer key. This is the **self-supervised** learning of [Supervised, unsupervised, reinforcement](/lesson/kinds-of-learning).

## Why so much is learned

To predict well across varied text, a model has to capture whatever helps:

- "The capital of France is …" → knowledge of geography.
- "She picked up the glass, and it …" → physical common sense.
- "def add(a, b): return …" → how code works.
- "17 × 3 = …" → arithmetic, at least for patterns it has seen.
- A detective story's last chapter → following the clues.

As [Prediction is compression](/lesson/compression) explained, the better a model predicts, the more structure of the world behind the text it must represent. Nobody programs these abilities; they are by-products of lowering the loss.

## In-context learning

A surprise from large models: they can do new tasks from instructions or examples given in the prompt, with no change to their weights. Show three examples of English → French, and a fourth English sentence, and the most likely continuation is its translation. Predicting the next token, applied to a well-shaped prompt, becomes a general tool. The lesson on prompting builds on this.

## What it does not give

- **Truth**, as such. The model learns what text tends to say, which is usually, not always, what is true. Common misconceptions are predictable too.
- **An assistant.** A model that only predicts text will continue a question with more questions, or with whatever usually follows such text on the internet. Turning it into a helpful assistant takes further training, as the lessons on fine-tuning and on learning from preferences explain.
- **Knowledge after its training data was collected.** It knows nothing newer, unless given it in the prompt.

## Generating text

To write, the model predicts a distribution for the next token, one token is chosen from it, added to the text, and the process repeats. How the token is chosen is the subject of [Sampling](/lesson/sampling); how this is made fast is in [How text is generated](/lesson/generation).

## Remember

- A language model is trained to predict the next token, using text as its own labels.
- Doing this well across varied text requires modelling grammar, facts and reasoning patterns.
- Large models can do new tasks from examples in the prompt: in-context learning.
- Next-token prediction alone does not give truth, helpfulness or recent knowledge.

::quiz
? Why does next-token training need no human labels?
+ The next token in the text itself is the correct answer
- Labels are added automatically by the tokeniser
- The model labels its own data randomly
! Every position in a document is a training example with its answer already in the text.
? A base model, trained only on next-token prediction, is asked "What is the capital of Peru?" What might it do?
+ Continue with more quiz questions, because that is a likely continuation of such text
- Always answer "Lima" and stop
- Refuse to answer
! A base model continues text. Instruction tuning teaches it to answer as an assistant.
::end
