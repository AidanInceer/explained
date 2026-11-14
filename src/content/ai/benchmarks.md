---
minutes: 8
tech: []
refs:
  - helm: Section 1, “Introduction”, on why single numbers mislead
  - labelerrors: Whole paper
  - gpt3: Section 4, “Measuring and Preventing Memorization Of Benchmarks”
---
New models are announced with tables of **benchmark** scores: maths, coding, knowledge, reasoning. Benchmarks are useful: shared tests that let people compare models and track progress. But a high score is not the whole story, and sometimes not the story at all.

## What a benchmark is

A fixed set of questions or tasks with a scoring method: multiple-choice exams across many subjects, maths competition problems, coding tasks with hidden tests, questions designed to catch common misconceptions. A model answers them all, and its score is reported.

## Why scores mislead

- **Contamination.** Benchmark questions are published, so they may appear in a model's web pretraining data, as [Data quality and leakage](/lesson/ml-data-quality) explained. A model can then score well by memory.
- **Saturation.** When the best models score near 100%, the benchmark no longer separates them. Many famous benchmarks became saturated within a few years of release.
- **Wrong answers in the key.** Benchmarks contain labelling errors; above a certain level, a "mistake" may be the model being right.
- **Narrowness.** A multiple-choice exam does not measure writing a good email, using tools over many steps, or knowing when to say "I don't know".
- **Prompt sensitivity.** Scores can change by several points with the wording of the prompt or the number of examples given. Comparisons across reports may not use the same set-up.
- **Teaching to the test.** When a benchmark becomes a target, effort goes into raising it, which may not improve the ability it was meant to measure.

## Reading results well

- Prefer **recent** benchmarks, ideally with **private** or regularly refreshed questions.
- Look at **many** benchmarks, and at the spread across tasks, not a single average.
- Check that comparisons used the **same** settings.
- Prefer benchmarks close to **real tasks**: complete software issues, multi-step agent tasks, expert-written questions.
- Remember that **human preference rankings**, from people comparing answers side by side, capture something different again, with their own biases, such as a taste for style.

## Your benchmark matters most

General benchmarks tell you which models are worth trying. Only your own evaluation set, from [Evaluating models](/lesson/evals), tells you which model works for your users, your data and your quality bar.

> **Rule of thumb.** Treat a benchmark as a filter, not a verdict. Shortlist with public scores; decide with your own tests.

## Remember

- Benchmarks are shared tests that allow comparison and track progress.
- They can mislead through contamination, saturation, label errors, narrowness and prompt sensitivity.
- Read many recent benchmarks under the same settings, close to real tasks.
- Choose models with your own evaluation set.

::quiz
? A new model scores 95% on an old, famous benchmark. What should make you cautious?
+ The questions may be in its training data, and the benchmark may be saturated
- 95% is too low
- Benchmarks are always contaminated
! Old, public benchmarks are prone to contamination and no longer separate strong models.
? Two reports give different scores for the same model on the same benchmark. A likely reason?
+ Different prompts or numbers of examples were used
- The benchmark changed its answers
- One report used a different model on purpose
! Scores are sensitive to the evaluation set-up.
::end
