---
minutes: 8
tech: []
refs:
  - hallusurvey: Sections 1, 2 and 4, on definitions, causes and mitigation
  - aieng: Ch. 4, “Evaluate AI Systems”, on factual consistency
---
Language models sometimes state false things with complete confidence: a court case that never existed, a quote nobody said, a function that is not in the library, a wrong date. This is called **hallucination**. It is not a rare bug that will soon be fixed. It follows from how the models work, and every application must be designed around it.

## Why it happens

- **Fluency is trained; truth is not directly.** [Next-token prediction](/lesson/next-token) rewards text that is likely given the context. A plausible-sounding citation is likely text, whether or not the paper exists.
- **Knowledge is compressed.** Facts seen rarely in training are stored weakly. The model fills gaps with plausible patterns: a real author's name with an invented title.
- **The model must say something.** Generation always produces a next token. Unless trained otherwise, "I do not know" is often less likely than a confident guess.
- **Pressure from the prompt.** A question that assumes a false premise, "Why did Einstein win the Nobel Prize for relativity?", invites an answer that accepts it.
- **Missing or outdated knowledge.** Questions about events after the cut-off, or about private information, have no true answer in the weights.

## Where it is most likely

- Specific details: numbers, dates, names, citations, URLs, quotes.
- Rare topics, niche facts and new events.
- Long answers, where an early small error is built on.
- Summaries of long documents, where details get mixed up or added.

## Reducing it

- **Give the facts.** Put the source documents in the context and ask the model to answer only from them, with [retrieval](/lesson/rag). This is the most effective step for factual questions.
- **Ask for sources and quotes**, and check that they exist and say what is claimed.
- **Allow "I don't know".** Tell the model explicitly that admitting uncertainty is fine.
- **Use tools**: a calculator for arithmetic, a search or database for facts, code execution for code, as the lesson on tools and agents explains.
- **Check automatically**: compare claims against sources with a second step; test generated code.
- **Training**: models trained with feedback that rewards admitting uncertainty hallucinate less, though not never.

## Design for it

Assume that some answers will be wrong. Then:

- Show sources, so users can check.
- Keep a person in the loop for decisions that matter: legal, medical, financial.
- Make it easy to report errors.
- [Evaluate](/lesson/evals) factual accuracy on your own questions, not only general benchmarks.

> **Pitfall.** Confidence in wording is not evidence. A model's tone is equally sure when it is right and when it is wrong.

## Remember

- Hallucination: fluent, confident, false output. It follows from next-token training.
- Most common with specific details, rare facts, long answers and false premises.
- Provide sources, allow "I don't know", use tools, and check claims.
- Design applications assuming some answers will be wrong.

::quiz
? A model is asked for references on a niche topic and lists five papers. What should you do?
+ Check that each paper exists and says what is claimed
- Trust them: the model gave authors and years
- Ask the model if it is sure, and trust the reply
! Citations are a common form of hallucination. Verify each one.
? Which change most reduces hallucination when answering questions about a company's policies?
+ Retrieve the relevant policy text and instruct the model to answer only from it
- Raise the temperature
- Ask for longer answers
! Grounding the answer in provided documents gives the model the facts instead of making it recall them.
::end
