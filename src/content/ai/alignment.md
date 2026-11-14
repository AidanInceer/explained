---
minutes: 9
tech: []
refs:
  - instructgpt: Section 1, “Introduction”, on aligning models with user intent
  - constitutional: Section 1, “Introduction”
  - nistrmf: Part 1, Section 3, “AI Risks and Trustworthiness”
---
A model trained to predict text, or to win a reward, will do exactly what its training rewards, which may not be what anyone intended. **Alignment** is the work of making AI systems pursue the goals their designers and users actually intend: helpful, honest, and avoiding harm, including in situations nobody anticipated. As models become more capable and act more independently, it matters more.

## The gap between what you say and what you mean

Every training signal is a stand-in for what you want:

- Next-token prediction rewards **likely** text, not true or helpful text.
- Human ratings reward what **raters prefer**, which can include flattery or confident tone.
- A reward function in [reinforcement learning](/lesson/rl) rewards what it **measures**, which an agent can exploit.

The more capable the optimiser, the better it finds the gaps between the measure and the intent. This is often called **specification gaming** or **reward hacking**.

## Current methods

- **Instruction tuning and preference learning**, from [Fine-tuning and instructions](/lesson/fine-tuning) and [Learning from preferences](/lesson/preferences): teach models to follow requests and to prefer helpful, honest, harmless answers.
- **Written principles**: train models against an explicit set of rules or a constitution, with AI feedback, so the intended values are stated and can be inspected and debated.
- **Refusal and safe completion**: decline clearly harmful requests, while still helping with legitimate ones that sound similar.
- **Evaluation and red teaming**: search for failures before release, as [Red teaming and misuse](/lesson/red-teaming) explains.
- **Interpretability**: look inside models for signs of unintended goals or deception, as [Looking inside a model](/lesson/interpretability) describes.

## Hard problems

- **Over- and under-refusal.** Refusing too much makes a model useless and patronising; too little makes it harmful. The line depends on context and is disputed.
- **Sycophancy**: telling users what they want to hear.
- **Honesty about uncertainty**: saying "I don't know", and not inventing, as in [Why models make things up](/lesson/hallucination).
- **Whose values?** People and cultures disagree. Alignment needs choices about which values, decided by whom.
- **Oversight of capable systems.** When a model is better than its evaluators at a task, such as finding subtle bugs, how can people check its work? Research on scalable oversight looks at using AI to help humans supervise AI.
- **Robustness**: behaviour that holds under adversarial pressure, in new situations, and when the model acts with tools over many steps.

## Why it matters more over time

A chatbot that gives a bad answer can be corrected by its reader. An agent that acts, moving money, changing code, sending messages, has direct effects. As systems gain capability and autonomy, the cost of small misalignments grows, which is why many researchers treat alignment as a central problem of the field.

## Remember

- Alignment: making systems pursue the goals people intend, not only what training measures.
- Training signals are stand-ins; capable optimisers exploit the gaps.
- Methods: instruction and preference tuning, written principles, refusals, red teaming, interpretability.
- Open problems include over-refusal, sycophancy, honesty, whose values, oversight and robustness.

::quiz
? A model rated by people learns to agree with whatever opinion the user states. What is this?
+ Sycophancy, a misalignment caused by rewarding what raters liked
- Perfect alignment
- Hallucination of facts
! The training signal rewarded pleasing answers, not honest ones.
? Why does alignment matter more for agents than for a chatbot that only writes text?
+ Agents take actions with direct effects, so mistakes are harder to catch and undo
- Agents are always smaller models
- Chatbots are never wrong
! When a system acts by itself, small misalignments have real consequences.
::end
