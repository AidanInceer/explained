---
minutes: 9
tech: []
refs:
  - attention: Section 3.2, “Attention”
  - udl: Ch. 12, “Transformers”, sections on self-attention
---
In "The animal did not cross the street because it was too tired", what does "it" refer to? To understand a word, you must look at other words, sometimes far away. **Attention** lets every token in a sequence look at every other token, decide which ones matter for it, and take information from them. It is the central idea of the transformer.

## Query, key, value

Each token's vector is turned, by three learned weight matrices, into three new vectors:

- A **query**: what this token is looking for.
- A **key**: what this token offers, as a label.
- A **value**: the information this token passes on if chosen.

For the token "it", the query might in effect ask "which noun am I referring to?". The keys of "animal" and "street" both say "I am a noun"; context makes "animal" the better match.

## The computation

For each token:

1. **Score** every token by the [dot product](/lesson/dot-product) of this token's query with that token's key. Higher means more relevant.
2. **Scale** the scores by dividing by √d, where d is the vector size, to keep them in a range where softmax works well.
3. **Softmax** the scores into weights that add up to 1, as in [Softmax](/lesson/softmax).
4. **Mix**: take the weighted average of all the value vectors.

The result is a new vector for this token, made of information from the tokens it attended to. For all tokens at once, in matrix form:

`Attention(Q, K, V) = softmax(Q Kᵀ / √d) V`

This is two [matrix multiplications](/lesson/matrix-multiply) and a softmax, which GPUs do very well.

::fig ai-attention | Select a word to see which words it attends to.

## Masking

When a model predicts the next token, a token must not look at tokens that come after it, or it would see the answer. A **causal mask** sets those scores to minus infinity before the softmax, so their weights become zero. Each token attends only to itself and earlier tokens.

## Why it was a breakthrough

Compared with [recurrent networks](/lesson/rnn):

- **Direct connections.** Any two tokens are one step apart, however far they are in the text. No fading memory.
- **Parallel.** All positions are computed at once in training, so GPUs are fully used.
- **Flexible.** Which tokens matter is decided by the content, differently for every input.

## The cost

Every token scores every other: for a sequence of n tokens, n² scores. Double the context, and attention costs four times as much compute; the score matrix also needs n² memory unless computed in tiles, as FlashAttention does, mentioned in [Memory is the bottleneck](/lesson/memory-bandwidth). This is why long contexts are expensive, as the lesson on context windows explains.

## Remember

- Attention lets each token gather information from the tokens most relevant to it.
- Queries and keys are compared by dot products; softmax turns scores into weights; values are averaged.
- A causal mask stops tokens from seeing the future during next-token prediction.
- Direct, parallel and content-based, but its cost grows with the square of the sequence length.

::quiz
? In attention, what decides how much token A takes from token B?
+ The softmax of the dot product of A's query with B's key
- The distance between A and B in the text
- B's value vector alone
! Scores come from query–key dot products, turned into weights by softmax.
? A context grows from 2,000 to 8,000 tokens. Roughly how does the cost of computing attention scores change?
+ It grows about 16 times
- It grows about 4 times
- It stays the same
! Scores grow with n²: (8,000 / 2,000)² = 16.
::end
