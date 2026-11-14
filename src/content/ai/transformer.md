---
minutes: 9
tech: []
refs:
  - attention: Section 3, “Model Architecture”
  - udl: Ch. 12, “Transformers”
  - karpathy: '“Let''s build GPT: from scratch, in code, spelled out”'
---
The **transformer**, introduced in 2017 in the paper "Attention Is All You Need", is the architecture behind almost every large language model, and many image, audio and video models too. Its design is surprisingly simple: one block, made of [attention](/lesson/attention) and a small feed-forward network, repeated many times, joined by [residual connections and normalisation](/lesson/residual).

## The whole model, end to end

For a language model of the GPT kind:

1. **Tokens in.** The text is cut into tokens, as in [Tokens and tokenisers](/lesson/tokens).
2. **Embeddings.** Each token becomes a vector from the embedding table, plus information about its position, as [Heads and positions](/lesson/multi-head) explains.
3. **Blocks.** The vectors pass through a stack of identical blocks, often 30 to 100 or more. Each block updates every token's vector.
4. **Output.** A final normalisation, then a linear layer turns each token's vector into a score for every token in the vocabulary, and [softmax](/lesson/softmax) turns those into probabilities for the next token.

## One block

```
x = x + Attention(Norm(x))
x = x + FeedForward(Norm(x))
```

- **Attention** moves information **between** tokens: each token gathers what it needs from the others.
- **Feed-forward** (an MLP) processes each token **on its own**: two dense layers with an activation between, usually about four times wider in the middle. Much of the model's stored knowledge is thought to live in these layers.
- **Residual connections** keep a main stream of vectors flowing through, with each part adding its contribution, as [Residual connections and normalisation](/lesson/residual) explained.

So the model alternates: share information across positions, then think about each position, and repeat.

## Where the parameters are

For a typical model, most parameters are in the feed-forward layers and the attention projections, repeated in every block. A model with a hidden size of 4,096 and 32 blocks has roughly 12 × 4,096² ≈ 200 million parameters per block, and about 6.4 billion in all its blocks, plus the embedding table.

## Variants

- **Decoder-only** (GPT, Llama and most chat models): causal attention, predicts the next token. The kind described here.
- **Encoder-only** (BERT): attention in both directions, used to understand text, for classification and embeddings.
- **Encoder–decoder** (the original transformer, T5): an encoder reads the input, a decoder writes the output while attending to it. Used for translation.

Many recent large models are also **mixture of experts**: each feed-forward layer has many expert networks, and each token is routed to only a few of them. More total parameters, with similar compute per token.

## Why it won

- Attention connects any two tokens directly.
- Everything in training runs in parallel across the sequence, so it uses GPUs fully.
- It scales smoothly: more layers, width and data keep improving it, as [Scaling laws](/lesson/scaling-laws) described.
- The same block works for text, images (as patches), audio and more.

## Remember

- A transformer: embeddings, then a stack of identical blocks, then a projection to token probabilities.
- Each block: attention mixes information across tokens; a feed-forward network processes each token.
- Residual connections and normalisation wrap both.
- Decoder-only models predict the next token; it scales well and works across many kinds of data.

::quiz
? In a transformer block, which part lets tokens exchange information?
+ Attention
- The feed-forward network
- Layer normalisation
! The feed-forward network works on each token separately; attention mixes across tokens.
? Roughly how many parameters are in 32 blocks of a transformer with hidden size 4,096, at about 12 × d² per block?
+ About 6.4 billion
- About 130 million
- About 64 billion
! 12 × 4,096² ≈ 201 million per block, × 32 ≈ 6.4 billion.
::end
