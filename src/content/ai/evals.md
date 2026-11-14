---
minutes: 9
tech: []
refs:
  - aieng: Ch. 3, “Evaluation Methodology”, and Ch. 4, “Evaluate AI Systems”
  - helm: Sections 1 and 3, on evaluating across many scenarios and measures
---
For a classifier, testing is simple: compare the predicted label with the true one, as in [Measuring a model](/lesson/metrics). For a model that writes free text, many answers can be right, and "right" can mean accurate, complete, safe, well written and in the correct format. **Evaluating** open-ended output is harder, and it is the most important habit in building with AI: without it, you cannot tell whether a change made things better or worse.

## Build your own evaluation set

Public benchmarks measure general ability. Your product needs its own test set:

- **Real inputs**: questions and documents like those your users send, including difficult and unusual ones.
- **What a good answer must contain**, or a reference answer.
- **Edge cases**: questions the system should refuse, inputs with missing information, attempts to misuse it.
- Start with 50 to 100 examples; grow it with every failure found in production.

## Ways to score

- **Exact checks**, where possible: is the JSON valid? Is the extracted date right? Does the generated code pass its tests? Does the answer cite a real document? Cheap, reliable, and should be used wherever they fit.
- **Human review**: people grade answers against a written rubric. The most trustworthy for quality, and slow and costly. Use it to build and check the other methods.
- **Model as judge**: a strong model grades answers against a rubric or a reference. Fast and cheap at scale. It has biases, such as preferring longer answers, its own style, or the first of two options, so check its judgements against human ones on a sample, and use clear rubrics.
- **Pairwise comparison**: "which of these two answers is better?" is easier for people and for models than an absolute score, as in [Learning from preferences](/lesson/preferences).

## Evaluate the parts

A system has several steps. Measure each:

- For [RAG](/lesson/rag): was the right passage retrieved? Was the answer faithful to it?
- For [agents](/lesson/tools-agents): did it choose the right tools? Did it finish the task? How many steps, how much cost?

When the final answer is wrong, step-level results tell you where to fix.

## Use it all the time

- Run the evaluation set on every change of prompt, model, retrieval or code, like tests in CI.
- Compare against the current version, not against an absolute number.
- Watch for noise: with a small set, small differences can be chance, as [Significance and confidence](/lesson/significance) explained.
- In production, sample real conversations, collect user feedback, and turn failures into new test cases.

> **Pitfall.** "It looked good on the five examples I tried" is how most AI features fail after launch. Vibes are not evaluation.

## Remember

- Open-ended outputs need their own evaluation methods, and your own evaluation set.
- Use exact checks where possible, human review for trust, model judges for scale, checked against humans.
- Evaluate each step of a system, not only the final answer.
- Run evaluations on every change and grow the set from real failures.

::quiz
? A team uses a model to judge which of two answers is better, and it almost always prefers the longer one. What should they do?
+ Check the judge against human ratings, and adjust the rubric to control for length
- Trust the judge
- Make all answers longer
! Model judges have known biases. Calibrate them against people.
? A RAG system gives wrong answers. Why measure retrieval separately?
+ To know whether the failure comes from finding the passages or from using them
- Retrieval cannot fail
- It is required by law
! Step-level measures point to where the fix belongs.
::end
