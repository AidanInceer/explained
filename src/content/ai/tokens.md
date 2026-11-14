---
minutes: 8
tech: []
refs:
  - bpe: Sections 1 and 3, on byte-pair encoding
  - aieng: Ch. 2, “Understanding Foundation Models”, section on tokenisation
---
A language model does not read letters or words. It reads **tokens**: pieces of text, each with a number. A **tokeniser** cuts text into tokens before the model sees it, and joins them back afterwards. Tokens decide how much a model can read at once, what it costs, and some of its strangest mistakes.

## Why not letters or words?

- **Letters** give very long sequences: a page becomes thousands of steps, which is slow and makes long-range patterns harder.
- **Whole words** give a vocabulary of millions, including every name, typo and new word. Any word not in the list cannot be read.

**Subword** tokens sit in between. Common words are one token; rare words are split into pieces that the model has seen before. `unbelievable` might become `un`, `believ`, `able`. Nothing is ever unknown, because in the worst case text falls back to single characters or bytes.

## Byte-pair encoding

Most tokenisers use **byte-pair encoding** (BPE) or a close relative:

1. Start with single characters (or bytes) as the vocabulary.
2. Count every pair of neighbouring tokens in a large training text.
3. Merge the most frequent pair into a new token, such as `t` + `h` → `th`.
4. Repeat until the vocabulary reaches the chosen size, typically 32,000 to 200,000 tokens.

The result: frequent strings, such as ` the` (often with its leading space), become single tokens; rare strings need several.

::fig ai-bpe | Step through byte-pair encoding on a tiny training text.

## Rules of thumb

- In English, one token is about **4 characters** or about **¾ of a word** on average. 1,000 tokens ≈ 750 words.
- Other languages, especially those less common in the tokeniser's training text, often need **more tokens** for the same meaning. Users of those languages pay more and fit less into the same context.
- Numbers and code split in uneven ways. "2024" might be one token or two, depending on the tokeniser.

## What tokens explain

- **Cost and limits.** Model prices and context limits are counted in tokens, not words, as the lesson on context windows explains.
- **Spelling and counting mistakes.** Asked how many "r"s are in "strawberry", a model sees a few tokens, not ten letters, and can get it wrong. Letter-level tasks are hard when letters are hidden inside tokens.
- **Arithmetic quirks.** If digits are grouped into tokens inconsistently, column-by-column arithmetic is harder to learn.

## From tokens to numbers

Each token's number is an index into a table of vectors: the **embedding** table, the subject of the next lesson, [Embeddings](/lesson/embeddings). That vector, not the token text, is what the model works with.

> **In practice.** Use the model provider's tokeniser library to count tokens exactly before sending a request. Estimates from word counts can be far off for code, numbers and non-English text.

## Remember

- Models read tokens: subword pieces with numbers, made by a tokeniser.
- BPE builds the vocabulary by merging the most frequent pairs again and again.
- In English, about 4 characters or ¾ of a word per token; other languages often need more.
- Tokens explain costs, context limits, and mistakes with spelling and digits.

::quiz
? About how many tokens is a 3,000-word English report?
+ About 4,000
- About 750
- About 12,000
! Roughly ¾ of a word per token, so 3,000 / 0.75 ≈ 4,000 tokens.
? Why might a model miscount the letters in a word?
+ It sees the word as a few tokens, not as individual letters
- It cannot count at all
- The word is not in its training data
! Letters are hidden inside tokens, so letter-level questions are harder than they look.
::end
