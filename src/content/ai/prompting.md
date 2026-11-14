---
minutes: 8
tech: []
refs:
  - claudedocs: Prompt engineering overview, and “Be clear and direct”
  - aieng: Ch. 5, “Prompt Engineering”
  - gpt3: Section 2, on zero-, one- and few-shot prompting
---
A **prompt** is everything you give a model: instructions, context, examples and the question. The same model can give a poor answer or an excellent one depending on how the task is described. Prompting is not about magic words. It is about giving a capable reader, who knows nothing about your situation, what they need to do the job well.

## Be clear and specific

Imagine briefing a smart new colleague who has never seen your project:

- **Say what you want**, and what the result is for. "Summarise this for a customer who is angry about a late delivery" beats "Summarise this".
- **Give the constraints**: length, format, tone, what to include and leave out.
- **Give the context** that the model cannot know: your audience, your rules, the facts of the case.
- **Say what to do when unsure**: "If the document does not say, answer 'not stated'." This reduces [made-up answers](/lesson/hallucination).

## Structure the prompt

- Put long documents in clearly marked sections, for example inside tags such as `<contract>` … `</contract>`, and the question after them.
- Separate instructions from data, so text inside a document is not mistaken for an instruction. This also helps against [prompt injection](/lesson/prompt-injection).
- Use a **system prompt** for standing instructions: the role, rules and style that apply to every turn.

## Show examples

**Few-shot prompting**: include a few examples of input and the ideal output. The model picks up the format and the standard from them, through the in-context learning of [Predict the next token](/lesson/next-token). Choose examples that are varied and cover the tricky cases; the model may copy their quirks too.

## Let it think

For problems with several steps, ask the model to work through them before giving the answer, or use a [reasoning model](/lesson/reasoning-models). If you need only the final answer in your program, ask for it in a clearly marked part of the reply.

## Break big tasks up

One prompt that must research, plan, write and check is hard to get right. A **chain** of simpler prompts, each doing one step and passing its result on, is easier to test and improve. The lesson on [tools and agents](/lesson/tools-agents) takes this further.

## Test prompts like code

A prompt that works on three examples may fail on the fourth. Keep a small set of test inputs with expected outputs, run the prompt on all of them after every change, and compare. This is the [evaluation](/lesson/evals) habit, applied early.

> **Pitfall.** A prompt tuned for one model may work worse on another, or on a new version of the same model. Re-run your tests when you change models.

## Remember

- Brief the model like a capable newcomer: goal, audience, constraints, context.
- Separate instructions from data; mark documents clearly; use a system prompt for standing rules.
- Show a few varied examples; let the model think for multi-step tasks.
- Break big tasks into steps, and test prompts on a fixed set of inputs.

::quiz
? Which prompt is likely to give the most useful result?
+ "Summarise this support ticket in 3 bullet points for the engineer who will fix it. Include the error message and steps to reproduce."
- "Summarise."
- "You are the best summariser in the world. Summarise this perfectly."
! Specific goal, audience and content requirements tell the model what good looks like.
? Why mark a pasted document with tags and put the question after it?
+ It separates instructions from data, and the question comes where the model uses it best
- Tags make the model run faster
- Models cannot read untagged text
! Clear structure avoids confusion between the document and your instructions.
::end
