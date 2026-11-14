---
minutes: 8
tech: []
refs:
  - gendershades: Whole paper
  - datasheets: Section 1, “Introduction”
  - nistrmf: Part 1, Section 3, “AI Risks and Trustworthiness”, on harmful bias
---
A model learns the world as its data shows it. If the data under-represents some people, reflects past unfair decisions, or measures the wrong thing, the model repeats those patterns, often at large scale and with an air of objectivity. **Bias in data** is one of the most common ways AI systems cause harm.

## Where bias comes from

- **Who is in the data.** A face dataset that is mostly light-skinned men gives a model that is far more accurate for them. A 2018 study found commercial gender classifiers with error rates under 1% for lighter-skinned men and up to about 35% for darker-skinned women.
- **Historical decisions.** A hiring model trained on past hires learns past preferences. If a company mostly hired men, the model may learn to rank men higher, even without a "gender" feature, through proxies such as hobbies or colleges.
- **What is measured.** "Arrests" is not "crimes"; "cost of care" is not "need for care". A model trained on a convenient stand-in learns the stand-in's distortions.
- **How labels were made.** Annotators bring their own views to judgements such as "toxic" or "professional".
- **What text says.** Language models learn associations from human writing, including stereotypes.

## Proxies

Removing a sensitive feature, such as race or gender, rarely removes the bias. Other features, such as postcode, name, school or shopping history, correlate with it, and the model finds them. Fairness has to be measured, not assumed.

## Measuring it

Compare the model's behaviour across groups:

- Accuracy, precision and recall for each group, as in [Measuring a model](/lesson/metrics).
- The rate of positive decisions (approvals, flags) for each group.
- The error types: who gets more false positives, who more false negatives.

Different definitions of fairness, such as equal positive rates or equal error rates, can conflict, and in general cannot all be met at once. Choosing which matters is a decision about values and law, not only a technical one.

## Reducing it

- **Better data**: collect more examples from under-represented groups; check how labels were made.
- **Reweighting**: give under-represented groups more weight in the loss.
- **Evaluate by group** before release, and after, in production.
- **Human review** for high-stakes decisions, and a way for people to contest them.
- **Decide not to automate** when the data cannot support a fair model.

> **In practice.** Write down which groups you checked, what you found, and what you decided. Regulators increasingly require it for high-risk uses, as the lesson on rules and responsibility explains.

## Remember

- Models repeat the patterns in their data: who is included, past decisions, what is measured.
- Removing a sensitive feature does not remove bias; proxies remain.
- Measure performance and decisions by group. Fairness definitions can conflict.
- Improve the data, reweight, evaluate by group, keep humans in high-stakes loops.

::quiz
? A loan model has no gender feature, yet approves women less often than equally qualified men. How is that possible?
+ Other features act as proxies for gender, and the training data reflects past biased decisions
- The model is broken
- Models cannot be biased without the feature
! Correlated features carry the pattern. Bias must be measured, not assumed away.
? What is the most direct way to find whether a model works worse for some group?
+ Evaluate its accuracy and error types separately for each group
- Look at overall accuracy only
- Remove the group from the test set
! Overall numbers hide differences. Per-group measures reveal them.
::end
