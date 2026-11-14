---
minutes: 9
tech: []
refs:
  - euaiact: Chapter II, “Prohibited AI Practices”, Chapter III, “High-Risk AI Systems”, and Chapter V, “General-Purpose AI Models”
  - nistrmf: Part 2, the “Govern”, “Map”, “Measure” and “Manage” functions
---
When an AI system denies someone a loan, misreads a medical scan, or produces a defamatory claim, who is responsible? **AI governance** is the set of laws, standards and internal practices that answer this: what may be built, what must be checked, what must be disclosed, and who answers when it goes wrong. It is changing quickly, and it already affects how ordinary products are built.

## Laws

Rules differ by country and change often, so always check current law for your situation. Two well-known examples:

- **The EU AI Act** (adopted in 2024, applying in stages) sorts AI systems by risk:
  - **Prohibited** practices, such as social scoring that leads to unfair treatment, and some kinds of manipulation.
  - **High-risk** systems, such as those used in hiring, credit, education, critical infrastructure and law enforcement, which must meet requirements for risk management, data quality, documentation, human oversight, accuracy and security.
  - **Transparency** duties, such as telling people they are talking to an AI, and marking AI-generated content.
  - Obligations for providers of **general-purpose AI models**, such as documentation and, for the most capable models, risk assessment.
- **Existing laws still apply**: data protection (such as the GDPR), anti-discrimination, consumer protection, copyright, product liability and sector rules for finance and health. Using AI does not exempt anyone from them.

## Frameworks and standards

Voluntary frameworks help organisations manage AI risk in practice. The **NIST AI Risk Management Framework** organises the work into four functions:

- **Govern**: policies, roles and accountability.
- **Map**: understand the context, uses and possible harms.
- **Measure**: test and track risks, with [evaluation](/lesson/evals) and [red teaming](/lesson/red-teaming).
- **Manage**: decide, act on and monitor risks over time.

International standards, such as ISO/IEC 42001 for AI management systems, give similar structures.

## In practice, for a team

- **Know your use case's risk level.** A writing helper and a hiring screener are regulated very differently.
- **Document**: what the system is for, what data it uses, how it was tested, its known limits. [Datasheets](/lesson/datasets) and model cards are common formats.
- **Keep humans accountable**: decisions that affect people should have a clear owner and a way to appeal.
- **Protect data**: lawful basis, minimisation, retention limits, and care with what is sent to model providers.
- **Be transparent with users** about AI involvement and its limits.
- **Monitor after launch**, keep logs, and have a process for incidents, as in software [postmortems](/lesson/postmortems).

> **Pitfall.** "The model decided" is not an answer to a regulator, a court or a customer. An organisation that deploys an AI system is responsible for its use.

## Remember

- Governance covers what may be built, what must be checked and disclosed, and who is accountable.
- The EU AI Act sorts systems by risk; existing laws on data, discrimination and liability still apply.
- Frameworks such as NIST's AI RMF organise the work: govern, map, measure, manage.
- Know your risk level, document, keep humans accountable, protect data, monitor after launch.

::quiz
? A company uses an AI model to screen job applicants in the EU. How is this likely treated under the EU AI Act?
+ As a high-risk system, with requirements for risk management, documentation and human oversight
- As unregulated, because it is only software
- As always prohibited
! Employment and recruitment uses are listed among high-risk areas.
? An AI system wrongly rejects a customer's claim. Who is responsible?
+ The organisation that deployed the system
- The model itself
- Nobody
! Using AI does not move accountability away from the organisation that uses it.
::end
