---
minutes: 8
tech: []
refs:
  - word2vec: Sections 1 and 4, on word vectors and their arithmetic
  - udl: Ch. 12, “Transformers”, section on embeddings
---
A token's number, say 3,412, says nothing about its meaning. Number 3,413 might be a completely different word. So the first thing a language model does is look up each token in a table and replace it with a **vector**: its **embedding**. These vectors are learned so that tokens with similar meanings and uses end up close together.

## The embedding table

The table has one row per token in the vocabulary and, for example, 4,096 columns. Looking up token 3,412 means taking row 3,412: a vector of 4,096 numbers. With a vocabulary of 100,000, the table holds 409.6 million numbers, all learned during training.

At the start of training the rows are random. As the model learns to predict text, gradients flow back into the rows of the tokens it saw, and each row moves to a position that helps prediction.

## Meaning as position

Words used in similar ways get similar vectors, because swapping them changes predictions little. So in a trained table:

- "cat" is close to "dog" and "kitten", far from "algebra".
- Similarity is measured by angle, with cosine similarity from [The dot product](/lesson/dot-product).
- Directions can carry meaning. In early word vectors, `king - man + woman` landed near `queen`, and similar arithmetic captured country–capital and verb-tense relationships.

The space has hundreds or thousands of dimensions, where, as [Many dimensions](/lesson/dimensions) explained, there is room for a vast number of nearly independent directions.

## From word embeddings to contextual ones

A single vector per token cannot handle words with several meanings: "bank" of a river and "bank" with money get the same row. In a transformer, the embedding is only the **starting point**. Each layer updates every token's vector using the surrounding tokens, through [deep networks](/lesson/deep-networks) and attention. By the middle layers, "bank" in "river bank" has a different vector from "bank" in "bank account". These **contextual embeddings** are what make modern language models work.

## Embeddings of whole texts

**Embedding models** are trained to turn a whole sentence, paragraph or document into one vector, so that texts with similar meanings are close. They are the base of:

- **Semantic search**: find documents whose meaning matches a question, not just its words.
- **Retrieval-augmented generation**, as a later lesson explains.
- **Clustering**, deduplication and recommendation.

Images, audio and code can be embedded too, sometimes into a shared space with text, so a text query can find a picture.

## Remember

- An embedding table maps each token to a learned vector.
- Similar meanings end up close together; directions can carry relationships.
- Transformers turn static embeddings into contextual ones, layer by layer.
- Embedding models turn whole texts into vectors for search, retrieval and clustering.

::quiz
? A vocabulary has 50,000 tokens and the embedding size is 1,024. How many numbers are in the embedding table?
+ About 51 million
- About 1 million
- 51,024
! 50,000 × 1,024 = 51,200,000.
? Why does "bank" have different vectors in "river bank" and "bank account" inside a transformer?
+ Each layer updates the token's vector using the words around it
- The tokeniser splits it differently
- The embedding table has two rows for it
! The starting embedding is the same; context changes it through the layers.
::end
