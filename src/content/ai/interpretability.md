---
minutes: 8
tech: []
refs:
  - superposition: Sections 1 and 2, on features and superposition
  - udl: Ch. 21, “Deep Learning and Ethics”, section on explainability
---
A trained model is billions of numbers. It works, but nobody wrote down how. **Interpretability** research tries to find out what is going on inside: which internal parts represent which ideas, and how they combine to produce an answer. It matters for trust, for debugging, and for safety, and it is still a young field.

## Two kinds of question

- **Why this output?** Which parts of the input mattered for this answer? Methods such as attribution highlight the words or pixels that most affected a prediction.
- **How does it work in general?** What does each part of the network compute? This is often called **mechanistic interpretability**: reverse-engineering the model like an unknown program.

## What has been found

- **Features as directions.** Many concepts appear to be represented as directions in the model's vector space, as [Embeddings](/lesson/embeddings) suggested. A direction can correspond to "this text is in French", "this is a city", or something much more abstract.
- **Superposition.** Models represent far more features than they have dimensions, by packing them into nearly perpendicular directions, which [Many dimensions](/lesson/dimensions) showed is possible. This is a major reason why single neurons are hard to read: one neuron takes part in many features.
- **Sparse dictionaries.** Training a separate, wide, sparse model (a **sparse autoencoder**) on a layer's activations can pull these overlapping features apart into many more readable ones, such as a feature for code with a security bug, or for a famous landmark.
- **Circuits.** Small groups of attention heads and neurons that do a specific job have been traced: for example, heads that find an earlier occurrence of a token and copy what followed it, which helps explain in-context learning.
- **Steering.** Adding or removing a feature's direction during a forward pass can change the model's behaviour in predictable ways, which is evidence that the feature is real and used.

## Limits

- Most findings cover a small part of a model's behaviour. Large models remain far from fully understood.
- Explanations can be convincing and wrong. A highlight map or a feature label is a hypothesis to test, not proof.
- A model's own explanation of its reasoning, in words, may not reflect what actually happened inside it.

## Why it matters

- **Debugging**: find why a model fails, or relies on a shortcut, such as a hospital's label in the corner of X-rays.
- **Trust and oversight**: check what a model is using before relying on it in high-stakes settings.
- **Safety**: detect deception, hidden goals or dangerous knowledge, which behaviour tests alone might miss, as [Alignment](/lesson/alignment) discusses.

## Remember

- Interpretability asks what a model's internal parts represent and how they produce answers.
- Concepts often appear as directions; superposition packs many features into fewer dimensions.
- Sparse autoencoders, circuits and steering are active tools; coverage of large models is still partial.
- Treat explanations as hypotheses, and do not rely only on a model's own account of itself.

::quiz
? Why is it hard to understand a model by looking at single neurons?
+ Many features share each neuron, packed in superposition
- Neurons are too small to measure
- Models have no neurons
! One neuron takes part in many features, so its activity mixes several meanings.
? A heat map shows which words most affected a classifier's decision. How should you treat it?
+ As a hypothesis about the model's reasoning, to be tested
- As proof of how the model works
- As useless
! Attribution methods can mislead. Check them with other evidence.
::end
