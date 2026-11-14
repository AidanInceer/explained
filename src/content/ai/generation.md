---
minutes: 8
tech: []
refs:
  - aieng: Ch. 9, “Inference Optimization”
  - flashattention: Section 1, “Introduction”
---
A trained language model writes text **one token at a time**: predict a distribution for the next token, pick one, add it to the text, and repeat. Each step needs a full pass through the model. Making this fast and cheap is a large part of running models in practice.

## The loop

1. Tokenise the prompt.
2. Run the model on all the tokens and get a probability for every possible next token.
3. Choose one, by the method in [Sampling](/lesson/sampling).
4. Append it to the sequence.
5. Repeat from step 2, until the model produces an end token or a length limit is reached.

This is **autoregressive** generation: each output depends on all the outputs before it.

## Two phases

- **Prefill**: process the whole prompt at once. All prompt tokens go through the model in parallel, like training, which uses the GPU well. A long prompt takes longer, but not proportionally longer.
- **Decode**: generate the answer token by token. Each step processes only one new token per sequence, which is slow per token, because every step must read all the model's weights, as [Memory is the bottleneck](/lesson/memory-bandwidth) explained.

So you see two delays: the **time to first token**, mostly prefill, and the **time per output token**, mostly decode.

## The KV cache

At each decode step, the new token attends to all earlier tokens, using their keys and values from [Attention](/lesson/attention). Those do not change, so recomputing them every step would waste huge amounts of work. Instead, the model **caches** each layer's keys and values for every token so far: the **KV cache**. Each step computes keys and values only for the new token and reuses the rest.

The cache is large: it grows with the number of tokens, the number of layers and the hidden size. For long contexts and many simultaneous users, the KV cache, not the weights, can fill the GPU's memory. Grouped-query attention, from [Heads and positions](/lesson/multi-head), shrinks it.

## Making it fast

- **Batching**: serve many users' requests together, so each read of the weights produces many tokens. **Continuous batching** adds and removes requests from the batch as they start and finish.
- **Quantisation**: fewer bytes per weight to read, as [Numbers in hardware](/lesson/numbers-in-hardware) explained.
- **Speculative decoding**: a small, fast model guesses the next several tokens; the large model checks them all in one pass and keeps the ones it agrees with. The output is the same, and often several tokens are produced per large-model pass.
- **Prompt caching**: reuse the prefill work for a prompt prefix that many requests share, such as a long system prompt.
- **Streaming**: send tokens to the user as they are generated, so the answer starts appearing at once.

## Remember

- Text is generated one token at a time; each token needs a pass through the model.
- Prefill handles the prompt in parallel; decode produces tokens one by one and is memory-bound.
- The KV cache stores earlier tokens' keys and values, and can fill memory for long contexts.
- Batching, quantisation, speculative decoding, prompt caching and streaming make it faster.

::quiz
? Why do models cache the keys and values of earlier tokens during generation?
+ They do not change, so recomputing them at every step would waste work
- To reduce the size of the model's weights
- To change the answer
! Each new token only needs its own keys and values; earlier ones are reused from the cache.
? A model answers with a long delay before the first word, then fast. What is the delay mostly?
+ Prefill: processing the prompt before the first output token
- The KV cache being deleted
- Sampling
! Time to first token is mostly the prefill of the prompt.
::end
