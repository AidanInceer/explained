---
minutes: 7
tech: []
refs:
  - mackay: Ch. 5, “Symbol Codes”, and Ch. 6, “Stream Codes”, on arithmetic coding
  - cover: Ch. 5, “Data Compression”
---
There is a deep link between predicting and compressing. A model that predicts the next symbol well can be turned into a compressor that stores text in very few bits, and a good compressor contains a good predictor. This explains why a model trained only to predict the next token learns so much about the world.

## Short codes for likely things

Morse code gives the most common English letter, E, the shortest code: a single dot. Rare letters get longer codes. On average, messages are shorter than with codes of equal length.

The ideal length of a code for an outcome with probability p is its surprise, `-log₂ p` bits, as [Bits and information](/lesson/bits) showed. Common outcomes get short codes; rare outcomes get long ones. Averaged over the distribution, the length is the [entropy](/lesson/entropy), the best possible.

## Prediction gives compression

To compress text with a predictor, go through it one token at a time:

1. The model gives a probability to every possible next token.
2. Encode the actual next token with about `-log₂ p` bits, using the model's probability. A method called **arithmetic coding** does this almost exactly.
3. The decoder runs the same model, gets the same probabilities, and decodes the token.

The total size is the sum of the surprises: the model's [cross-entropy](/lesson/cross-entropy) on the text, in bits. **The better the model predicts, the smaller the file.** A model that gives the true next token probability 0.5 on average needs about 1 bit per token.

## Compression needs understanding

To predict the next word of a physics textbook well, it helps to know physics. To predict the next move in a chess game, it helps to know chess. To predict the next line of code, it helps to know what the program does. So a model pushed to lower its prediction loss on huge amounts of text is pushed to model the structure behind the text: grammar, facts, reasoning patterns.

This is one way to understand why next-token prediction, a simple objective, produces models with broad abilities. The lesson “Predict the next token”, on the Language models line, takes this further.

> **For experienced readers.** Large language models used with arithmetic coding beat general-purpose compressors on text by a wide margin, though they are far too slow and large to be practical compressors. The point is the equivalence, not the product.

## The limits

- A compressor's knowledge is only as good as its training data. Prediction rewards modelling the text, including its errors and biases.
- Being good at predicting what people write is not the same as being right. A model can learn to predict a common misconception very well.

## Remember

- The best code length for an outcome is its surprise, -log₂ p. Average: the entropy.
- A predictor plus arithmetic coding is a compressor; file size equals cross-entropy.
- Better prediction means better compression, and needs more understanding of the data.
- This helps explain why next-token prediction teaches models so much.

::quiz
? A model's average cross-entropy on a text is 2 bits per token. About how big is the text when compressed with this model and arithmetic coding?
+ About 2 bits per token
- About 16 bits per token
- It cannot be compressed
! With arithmetic coding, the compressed size matches the model's cross-entropy.
? Why might next-token prediction lead a model to learn facts about the world?
+ Predicting text well requires modelling what the text is about
- Facts are stored separately in the model
- Prediction ignores meaning
! Lower prediction loss on varied text rewards modelling the structure behind it.
::end
