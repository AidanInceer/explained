---
minutes: 7
tech: []
refs:
  - mackay: Ch. 1, “Introduction to Information Theory”, and Ch. 4, “The Source Coding Theorem”
  - cover: Ch. 2, “Entropy, Relative Entropy, and Mutual Information”
---
How much information is in a message? Claude Shannon gave a precise answer in 1948: count the yes-or-no questions it would take to learn it. The unit is the **bit**. This idea, information as reduced uncertainty, is the base of the losses that train language models, and of the link between prediction and compression.

## Information as questions

I pick a number from 1 to 8. How many yes-or-no questions do you need to find it? Halve each time: "Is it 4 or less?", then "2 or less?", then one more. Three questions. Each answer halves the possibilities: 8 → 4 → 2 → 1. Learning my number gives you **3 bits** of information.

In general, picking one of N equally likely options carries `log₂ N` bits. One of 2: 1 bit. One of 1,024: 10 bits.

## Surprise

When outcomes are not equally likely, rare outcomes carry more information than common ones. The information, or **surprise**, of an outcome with probability p is:

`information = -log₂ p` bits

- Probability ½: 1 bit.
- Probability ¼: 2 bits.
- Probability 1/1,024: 10 bits.
- Probability 1: 0 bits. A certain outcome tells you nothing.

"The sun rose today" carries almost no information. "It snowed in the Sahara" carries a lot.

## Bits for storage, bits for information

The word "bit" means two related things. In storage, as in the software lesson [Bits, bytes and encodings](/lesson/binary-data), a bit is one binary digit in memory. In information theory, a bit is a measure of uncertainty removed. They meet in compression: a file can be stored in about as many binary digits as the information it really contains, and no fewer.

## Why AI cares

A language model, at each step, gives a probability to every possible next token. When the real next token arrives, its surprise is `-log p` of the probability the model gave it:

- The model gave the right token 0.5: 1 bit of surprise.
- It gave it 0.01: about 6.6 bits.

Training a language model is lowering its average surprise on real text. That average is the **cross-entropy**, which the lesson on cross-entropy and KL divergence defines. And because predicting well means needing few bits, a good predictor is also a good compressor, as the lesson on prediction and compression explains.

> **For experienced readers.** With natural logarithms instead of base 2, the unit is the **nat**. Deep learning code usually uses natural logs, so its losses are in nats. One nat is about 1.44 bits.

## Remember

- Information is measured in bits: the yes-or-no questions needed.
- Choosing one of N equal options carries log₂ N bits.
- The surprise of an outcome with probability p is -log₂ p. Rare means informative.
- A language model's loss is its average surprise on real text.

::quiz
? How many bits of information are in one choice among 64 equally likely options?
- 8
+ 6
- 64
! log₂ 64 = 6, since 2⁶ = 64.
? A model gave the correct next word a probability of 0.25. What was its surprise?
+ 2 bits
- 0.25 bits
- 4 bits
! -log₂ 0.25 = 2.
::end
