---
minutes: 9
tech: []
refs:
  - ragpaper: Sections 1 and 2
  - aieng: Ch. 6, “RAG and Agents”
---
A model knows only what was in its training data, up to its cut-off, and it [makes things up](/lesson/hallucination) when it does not know. Your company's policies, this week's prices and a customer's account are not in its weights. **Retrieval-augmented generation** (RAG) fixes this by finding the relevant documents at the moment of the question, and putting them in the prompt.

## The idea

1. A user asks a question.
2. A **retriever** searches your documents and returns the most relevant passages.
3. The passages are placed in the prompt, with the question and an instruction to answer from them.
4. The model answers, ideally citing the passages it used.

The model does the reading and writing; your documents provide the facts. Update the documents, and the answers change at once, with no retraining.

## Preparing the documents

- **Split** documents into **chunks** of a few hundred tokens, often with some overlap, so each chunk is about one thing. Keep headings and source information with each chunk.
- **Embed** each chunk into a vector with an embedding model, as in [Embeddings](/lesson/embeddings).
- **Store** the vectors in a vector index or database, with the text and metadata.

## Retrieving

- Embed the question the same way, and find the chunks whose vectors are closest: **semantic search**, by cosine similarity.
- Semantic search finds meaning, but can miss exact terms such as product codes or names. **Hybrid search** combines it with keyword search.
- A **reranker**, a model that compares the question with each candidate passage closely, can reorder the top results for better precision.
- **Filter** by metadata where it matters: only this customer's documents, only current policies, only what this user may see.

## Generating

Instruct the model to answer only from the provided passages, to cite them, and to say when the answer is not there. Put the passages in clearly marked sections, as in [Prompting](/lesson/prompting), and keep only the most relevant ones: more is not better, as [Context windows](/lesson/context-window) explained.

## What goes wrong

- **Retrieval misses**: the right passage is not found, so the model answers without it, or says it cannot. Most RAG failures are retrieval failures. Measure retrieval separately.
- **Bad chunks**: a table split in half, or a passage cut away from the heading that gives it meaning.
- **Conflicting or stale documents**: the model may pick the wrong version.
- **Access leaks**: retrieval that ignores permissions can show users documents they must not see.

> **Rule of thumb.** Build an evaluation set of real questions with the passages that should be found and the answers that should be given. Test retrieval and answers separately, as the lesson on [evaluating models](/lesson/evals) describes.

## Remember

- RAG retrieves relevant passages at question time and puts them in the prompt.
- Chunk, embed and index documents; search by meaning, combined with keywords and reranking.
- Tell the model to answer from the passages and cite them.
- Most failures are retrieval failures. Respect permissions, and evaluate retrieval and answers separately.

::quiz
? A RAG assistant gives a wrong answer, and the right passage was not among those retrieved. Where should you look first?
+ Retrieval: chunking, the embedding model, search settings or reranking
- The model's temperature
- The model's training data
! If the right text never reached the model, the generation step could not use it.
? Semantic search fails to find documents mentioning product code "XK-4471". What could help?
+ Hybrid search that also matches exact keywords
- Larger chunks
- A longer answer
! Embeddings capture meaning but can miss exact rare strings. Keyword search finds them.
::end
