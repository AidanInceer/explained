---
minutes: 8
tech: []
refs:
  - mlsys: Ch. 4, “Training Data”, section on labelling
  - instructgpt: Section 3.4, “Human data collection”
---
Supervised learning needs **labels**: the right answer for each example. Somebody, or something, must provide them. Labels are often the most expensive part of a project, and their quality sets an upper limit on the model's quality: a model cannot be more consistent than the labels it learns from.

## Where labels come from

- **People**: annotators read each example and choose the answer. Experts for medical or legal data; trained crowd workers for simpler tasks.
- **Natural labels**: the outcome happens by itself. Did the user click? Did the package arrive late? Did the loan get repaid? Cheap and plentiful, but they often arrive late, and they measure what happened, not what should have happened.
- **Rules**: heuristics label data automatically, for example "emails from these domains are spam". Fast, noisy, and limited to what the rules know.
- **Models**: a strong model labels data for a smaller one. Cheap at scale; the labels inherit the strong model's mistakes and biases.

## Good labelling

- **Clear instructions** with examples of hard cases. "Is this review positive?" is unclear for "The food was great but the service was awful." Decide, and write it down.
- **Measure agreement.** Give some examples to two or more people. Where they disagree often, the instructions are unclear, or the task is truly ambiguous.
- **Check quality** on a sample with known answers, and give annotators feedback.
- **Record who labelled what, and when**, so you can trace and fix problems.

## Labels for language models

Language models after pretraining are tuned with human-made data:

- **Demonstrations**: people write good answers to prompts.
- **Comparisons**: people see two answers and choose the better one. Comparing is easier and more consistent than writing or scoring from 1 to 10.

These comparisons train the reward models of reinforcement learning from human feedback, as the lesson on learning from preferences explains.

## Labels are often wrong

Even well-known benchmark test sets contain wrong labels: one study estimated an average of at least 3% across ten popular test sets. On a large dataset that is thousands of errors. A model that is "wrong" on those examples may be right.

> **Pitfall.** When a model and the label disagree, look at the example before blaming the model. Systematic label errors teach the model the error.

## Spend labels wisely

Labelling everything is rarely needed:

- **Active learning**: let the model choose which examples it is least sure about, and label those first.
- **Start small**: a few hundred well-labelled examples, with a pretrained model, often go a long way, as the lesson on transfer learning explains.

## Remember

- Labels come from people, natural outcomes, rules or other models. Each has costs and flaws.
- Write clear instructions, measure agreement, and check quality.
- Comparisons between answers are easier and more consistent than scores.
- Labels contain errors. Look at disagreements, and label the most useful examples first.

::quiz
? Two annotators agree on only 60% of examples. What does this suggest?
+ The instructions are unclear, or the task is genuinely ambiguous
- The annotators are lazy
- The model will be 60% accurate
! Low agreement is a signal about the task definition. Fix it before collecting more labels.
? Why are pairwise comparisons often used to collect preferences for language models?
+ Choosing the better of two answers is easier and more consistent than giving absolute scores
- They are faster to train on
- They need no people
! People agree more on "A is better than B" than on "this answer is a 7".
::end
