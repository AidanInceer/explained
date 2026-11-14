---
minutes: 8
tech: []
refs:
  - cot: Sections 1 and 2, on chain-of-thought prompting
  - verifystep: Sections 1 and 2, on rewarding each step
  - aieng: Ch. 5, “Prompt Engineering”, on breaking tasks into steps
---
A person solving a hard maths problem does not write the answer at once. They work through it, try something, check, and correct. Early language models answered in one go. **Reasoning models** are trained to produce a long chain of intermediate thinking before they answer, and they do much better on maths, coding, science and planning.

## Chain of thought

The idea started with prompting: asking a model to "think step by step" improved its answers on multi-step problems. Why? Each generated token is one pass through the model. A problem that needs many steps of computation cannot be solved in one token; writing out intermediate steps gives the model more passes, and each step can use the results written before it. The text becomes a working memory.

## Training models to reason

Reasoning models go beyond the prompt trick. They are trained, often with [reinforcement learning](/lesson/rl), to produce useful reasoning:

1. Give the model problems whose answers can be **checked automatically**: maths with known answers, code with tests, puzzles with verifiable solutions.
2. Let it generate long reasoning and a final answer.
3. **Reward** correct final answers, and sometimes correct steps.
4. Repeat at scale.

Through this, models learn behaviours that nobody wrote into them: breaking problems down, checking intermediate results, noticing mistakes and backtracking, trying another approach.

## Spending more at answer time

Reasoning models make a new trade-off possible: **more compute at inference time for better answers**. A model can think for a few hundred tokens on an easy question or tens of thousands on a hard one. Many APIs let you set a budget for thinking. More thinking generally helps on hard, checkable problems, with diminishing returns.

Other ways to spend inference compute:

- Generate several answers and pick the most common one, or the one a checker scores highest.
- Search over partial solutions, with a model that scores steps.

## Costs and limits

- **Slower and costlier**: thinking tokens take time and are usually billed.
- **Not always better**: for simple lookups, quick chat or creative writing, extra reasoning adds cost with little gain.
- **The visible reasoning is not a guaranteed explanation.** A model's written chain of thought may not faithfully reflect the internal process that produced the answer, as [Looking inside a model](/lesson/interpretability) cautioned.
- **Verification is easier in some areas.** Rewards are clear for maths and code; harder for essays or advice, where reasoning training helps less directly.

## Remember

- Writing out steps gives the model more computation and a working memory.
- Reasoning models are trained, often with RL on checkable problems, to think before answering.
- They trade inference time and cost for accuracy, adjustable with a thinking budget.
- Use them for hard, multi-step problems; the written reasoning is not a guaranteed explanation.

::quiz
? Why does writing intermediate steps help a model solve multi-step problems?
+ Each token is another pass through the model, and earlier steps can be used by later ones
- It makes the answer longer, which scores better
- The model reads its own training data
! The steps act as working memory and give the model more computation.
? For which task is a reasoning model most clearly worth the extra cost?
+ A competition maths problem with many steps
- Translating a short greeting
- Looking up a country's capital
! Hard, multi-step, checkable problems benefit most from extra thinking.
::end
