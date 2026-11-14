---
minutes: 8
tech: []
refs:
  - hnsw: Sections 1 and 4, the layered graph and its search
  - faiss: Section 3, “Problem statement”, on inverted-file indexes and product quantisation
  - aieng: Ch. 6, “RAG and Agents”, on retrieval
---
[Retrieval-augmented generation](/lesson/rag) finds the document chunks whose [embeddings](/lesson/embeddings) are closest to the question's embedding. With a thousand chunks, compare the question with each one. With a hundred million, that is too slow for every question. **Vector search** finds near neighbours fast by checking only a small part of the collection. The price: it sometimes misses the very closest one.

## Exact search

The direct way: compute the similarity, usually [cosine similarity](/lesson/dot-product) or a dot product, between the question and every stored vector, and keep the best few.

The cost grows with the number of vectors times their size. One hundred million vectors of 1,000 numbers is 10¹¹ multiplications for each question. Exact search is right for small collections, for tests, and to measure how good a faster method is.

## Approximate search

An **approximate nearest neighbour** (ANN) index arranges the vectors so that a search can skip most of them. Two families are common.

### Cells

Split the vectors into groups with [k-means](/lesson/clustering-ml): each group, or **cell**, has a centre. Each vector is stored in the list of its cell. This is an **inverted file** (IVF) index.

To search, compare the question with the cell centres, then check only the vectors in the nearest few cells. Searching more cells finds more of the true neighbours and costs more time.

::fig ai-ann | 400 vectors split into 16 cells. Search more cells, or ask a new question, and watch what the index finds.

### Graphs

Connect each vector to some of its near neighbours. To search, start somewhere and keep moving to the neighbour that is closer to the question, until no neighbour is closer. **HNSW** (hierarchical navigable small world) adds layers: a top layer with few vectors and long links for big jumps, and lower layers with more vectors for the fine search. HNSW is fast and accurate, and is the default in many vector databases. Its cost is memory for all the links, and slower inserts.

## Smaller vectors

Memory is often the limit: 100 million vectors × 1,000 numbers × 4 bytes is 400 GB. **Quantisation** stores each vector in fewer bytes, as [Numbers in hardware](/lesson/numbers-in-hardware) did for weights. **Product quantisation** cuts each vector into short pieces and stores each piece as the number of the nearest entry in a small codebook. The distances become approximate, so a common pattern is: find many candidates with the small vectors, then **re-score** the best ones with the full vectors.

## Recall, speed and memory

Every index has settings, such as the number of cells to search. Each one trades:

- **Recall**: the share of the true nearest neighbours that the search returns.
- **Speed**: questions per second, and the time for each.
- **Memory**: the size of the index.

Measure recall on your own data: run exact search on a sample of real questions, and compare.

> **Pitfall.** A vector index finds what is near in the embedding space, not what is right. If the embedding model is poor for your documents, a perfect index returns the wrong chunks fast. Check the retrieved chunks, not only the recall of the index.

## Filters

Real searches often add conditions: only this customer's documents, only this year. Filtering after the vector search can leave too few results; filtering before can make the index useless. Vector databases handle this inside the search, and it is worth testing with your real filters.

## Remember

- Exact search compares the question with every vector: correct, but too slow for large collections.
- Approximate indexes, with cells or graphs, check only a small part and sometimes miss the closest vector.
- Quantised vectors save memory; re-score the best candidates with full vectors.
- Tune for recall, speed and memory, and measure recall on your own questions.

::quiz
? An IVF index searches 1 of 100 cells per question. Recall is too low. What is the usual first change?
+ Search more cells for each question
- Use fewer cells in the index
- Remove the cell centres
! Searching more cells checks more candidates, so it finds more true neighbours, at more cost per question.
? Why measure recall with exact search on a sample of questions?
+ Exact search gives the true nearest neighbours to compare the index against
- Exact search is faster
- The index cannot return results without it
! Recall is the share of the true nearest neighbours that the index returns. Only exact search knows the true ones.
::end
