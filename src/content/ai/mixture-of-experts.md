---
minutes: 8
tech: []
refs:
  - moe: Sections 1 and 2, the sparsely-gated layer and its router
  - switchtf: Section 2, “Switch Transformer”, including the load-balancing loss
  - mixtral: Section 2, “Architectural details”
---
A [transformer](/lesson/transformer) spends most of its parameters in its feed-forward networks: the small networks after each attention step. In a normal, **dense** model, every token goes through all of them. A **mixture of experts** (MoE) layer has many feed-forward networks, the **experts**, and sends each token to only a few. The model can hold far more parameters, while each token costs about the same work as a much smaller model.

## The layer

A mixture-of-experts layer replaces one feed-forward network with:

- **E experts**: E separate feed-forward networks, often 8 to more than 100.
- A **router**: a small layer that gives each expert a score for the current token. A [softmax](/lesson/softmax) turns the scores into weights.

For each token, the layer runs only the **k** experts with the highest scores, often 1 or 2. It adds up their outputs, each multiplied by its weight. The other experts do nothing for that token.

Each token is routed on its own, in each layer. The tokens of one sentence can use different experts, and one token can use different experts in different layers.

::fig ai-moe | Select a token to see the experts that the router picks. Change the number of experts and k.

## What it buys

- **Total parameters** grow with E: more room to store knowledge.
- **Work per token** grows with k only: the cost of the attention and k experts.

A model with 8 experts and k = 2 might hold about 47 billion parameters but use about 13 billion for each token. It can then match a dense model of a much larger size on many tasks, at the compute cost of a smaller one. For a fixed training budget, this often gives a lower loss than a dense model, which is why many recent large models use it.

## What it costs

- **Memory.** Every expert must be in memory, although each token uses few of them. The model is as heavy to store as its total size.
- **Load balance.** If the router sends most tokens to a few favourite experts, those experts are a bottleneck and the rest learn little. Training adds an extra loss term that rewards an even spread, and each expert has a **capacity**: a limit on tokens per batch.
- **Communication.** In large models the experts sit on different chips. Tokens must travel to their experts and back in every layer, as [Many chips together](/lesson/many-chips) explains.
- **Training stability.** Routers can be unstable, and MoE models can be harder to fine-tune than dense ones.

> **For new readers.** The experts do not become experts in topics such as "history" or "maths". Studies of trained routers find that they mostly specialise in patterns of tokens, such as punctuation, code syntax or parts of words. The name is older than the finding.

## Dense or mixture?

- On one GPU or a laptop, memory is the limit, so a dense model of the same memory size is often the better choice.
- In a datacentre that serves many users, compute per token sets the cost, and MoE models give more quality for each unit of compute.

## Remember

- An MoE layer has many experts and a router that sends each token to the top k.
- Total parameters grow with the number of experts; work per token grows only with k.
- All experts must be in memory.
- Training adds a load-balancing loss so that tokens spread across the experts.

::quiz
? A model has 64 experts per layer and uses 2 for each token. Compared with a dense model of the same total size, what is true?
+ It needs about the same memory, but much less compute per token
- It needs much less memory and much less compute
- It needs the same compute per token
! All 64 experts must be stored, but each token runs through only 2 of them.
? During training, almost every token goes to experts 3 and 7. What is the usual fix?
+ An extra loss term that rewards spreading tokens evenly across experts
- Remove experts 3 and 7
- Use a higher learning rate for the router
! The load-balancing loss pushes the router towards an even spread, so all experts train and none becomes a bottleneck.
::end
