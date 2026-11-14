---
minutes: 8
tech: []
refs:
  - attention: Section 3.2.2, “Multi-Head Attention”, and Section 3.5, “Positional Encoding”
  - rope: Sections 1 and 3
---
Two details make [attention](/lesson/attention) work in practice. **Multiple heads** let a layer look for several kinds of relationship at once. **Position information** tells the model the order of the tokens, which attention on its own cannot see.

## Many heads

One attention computation finds one pattern of relevance. But a token may need several things at once: the subject of its verb, the noun that "it" refers to, the opening bracket that it closes.

**Multi-head attention** runs several attention computations in parallel, each with its own query, key and value matrices, on smaller vectors. With a hidden size of 4,096 and 32 heads, each head works on vectors of 128. The heads' outputs are joined and mixed by one more matrix.

Studies of trained models find heads that seem to specialise: some attend to the previous token, some to matching brackets or quotation marks, some copy a name seen earlier. Many heads do things that are harder to describe, as [Looking inside a model](/lesson/interpretability) discusses.

The total compute is about the same as one big head: the work is split, not repeated.

> **For experienced readers.** To save memory at inference time, many models share key and value vectors across groups of query heads: **grouped-query attention**. Fewer keys and values to cache, with little loss of quality.

## Attention does not know order

Attention compares every token with every other by content. If you shuffle the tokens, each still gets the same attention weights, just in a different place. "Dog bites man" and "man bites dog" would look alike. Word order must be added.

## Ways to add position

- **Absolute position embeddings**: a vector for each position, 1, 2, 3, …, added to the token's embedding. Learned during training, or fixed patterns of sine and cosine waves, as in the original transformer. Simple; limited to the positions seen in training.
- **Relative positions**: make the attention score depend on the distance between two tokens rather than on their absolute places. What matters is usually "three words back", not "word 1,742".
- **Rotary position embeddings (RoPE)**: rotate each query and key vector by an angle that depends on its position. The dot product of a query and a key then depends on the difference between their positions. Used in many recent models, and can be stretched to longer contexts with adjustments.

## Why position methods matter for long contexts

A model trained on 8,000-token texts may handle 100,000 tokens poorly if its position scheme has never seen such distances. Much work on long contexts is about position encodings that extend well, as [Context windows](/lesson/context-window) explains.

## Remember

- Multi-head attention runs several smaller attentions in parallel, each free to find a different relationship.
- Some heads have recognisable jobs; many are hard to describe.
- Attention alone ignores order, so position information must be added.
- Absolute, relative and rotary (RoPE) encodings; the choice affects how far contexts can stretch.

::quiz
? A model has hidden size 2,048 and 16 heads. What size of vector does each head work on?
+ 128
- 2,048
- 16
! The hidden size is split across heads: 2,048 / 16 = 128.
? Why does a transformer need position information?
+ Attention compares tokens by content only, so without it word order would be lost
- To make the model larger
- Because tokens have no embeddings
! Shuffled tokens would get the same attention patterns. Positions make order visible.
::end
