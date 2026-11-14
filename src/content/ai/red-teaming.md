---
minutes: 8
tech: []
refs:
  - owaspllm: The Top 10 list, on misuse and attacks against LLM applications
  - nistrmf: Part 2, “Measure” and “Manage” functions
  - constitutional: Section 1, on red-teaming prompts
---
Before a model or an AI product is released, someone should try hard to make it fail: to get it to give dangerous instructions, leak private data, produce abusive content, or take harmful actions. **Red teaming** means attacking your own system on purpose, so that you find the failures before real attackers or real users do.

## What red teamers look for

- **Harmful content**: instructions for weapons, self-harm encouragement, harassment, sexual content involving minors.
- **Jailbreaks**: prompts that get around the model's safety training, such as role-play ("pretend you are a character with no rules"), many examples of misbehaviour in a long prompt, or harmful requests hidden in other languages or encodings.
- **Data leaks**: revealing the system prompt, other users' data, or memorised private information.
- **Unsafe actions** by agents: deleting files, sending messages, spending money without permission.
- **Bias and unfairness**: different treatment of groups, as [Bias in data](/lesson/data-bias) explained.
- **Misleading outputs**: confident false claims in high-stakes areas such as medicine and law.

## How it is done

- **Experts**: people with domain knowledge, in security, biology, child safety, or a particular language, probe the areas where harm would be greatest.
- **Diverse testers**: people with different backgrounds find different failures.
- **Automated red teaming**: models generate many attack prompts, and other models judge whether the target failed. This scales up coverage; people still find the most creative attacks.
- **Structured plans**: list the harms that matter for this product, then test each one, rather than trying things at random.

## After finding failures

- Fix with more training, better system prompts, input and output filters, or by removing a capability or tool.
- Add every successful attack to the [evaluation set](/lesson/evals), so it is tested again after every change.
- Decide whether the remaining risk is acceptable for release, and document the decision.

## Misuse, not just mistakes

Some risks come from users who intend harm, not from accidents:

- Generating spam, scams and disinformation at scale.
- Impersonation with cloned voices and fake images, as [Speech in and out](/lesson/speech) noted.
- Help with cyber-attacks or other dangerous activities.

Defences include usage policies, monitoring for abuse patterns, rate limits, identity checks for sensitive capabilities, and cooperation with other organisations to share what is found.

> **Pitfall.** No model is impossible to jailbreak. Design products so that a successful jailbreak does limited damage: least privilege, confirmations for sensitive actions, and monitoring.

## Remember

- Red teaming attacks your own system before release to find failures.
- Look for harmful content, jailbreaks, data leaks, unsafe actions, bias and misleading answers.
- Combine experts, diverse testers and automated attacks, with a structured plan.
- Fix, add attacks to evaluations, monitor for misuse, and limit the damage of what gets through.

::quiz
? What should happen to a jailbreak prompt found during red teaming?
+ Fix the weakness, and add the prompt to the evaluation set to test after every change
- Delete it and forget it
- Publish it before fixing
! Every found failure becomes a permanent regression test.
? Why can automated red teaming not fully replace human red teamers?
+ People find creative and domain-specific attacks that automated methods miss
- Automated methods are illegal
- Models cannot write prompts
! Automation scales coverage; experts find the most important and unusual failures.
::end
