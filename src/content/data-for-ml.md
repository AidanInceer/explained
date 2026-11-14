---
title: Data for machine learning and AI
summary: Models need point-in-time correct training data, the same features at training and at serving, and for language models a search index over documents.
track: architecture
level: deeper
minutes: 9
at: [0, 6]
prereqs: [privacy-in-practice]
tech: [ml, nosql]
refs:
  - mlsys: Ch. 4, Training Data, and Ch. 5, Feature Engineering
  - fode: Ch. 9, “Machine learning”
---
Machine learning and AI systems are consumers of data, with requirements that are different from those of a dashboard. A wrong number on a dashboard is seen by a person. A wrong number in training data makes a model that is wrong in a way that nobody sees. Data engineers build the supply side of these systems.

## What a model needs from data

1. **Training data**: a large table of past examples. Each row has **features** (the inputs) and, for supervised learning, a **label** (the correct answer).
2. **The same features at prediction time**: when the model is used, it must get inputs that were computed in exactly the same way.
3. **Feedback**: the real outcome, joined to the prediction later, to measure and to train again.

## Point-in-time correctness

This is the most important idea in the lesson.

Suppose you train a model to predict if a customer will cancel. For a customer who cancelled on 10 March, the features must be the values **as they were before 10 March**. If you join to the customer table as it is today, you include information from after the event: the account is marked closed, and the number of logins in the last 30 days is zero. The model learns that closed accounts cancel. It is perfect in the test and useless in production.

This is **data leakage**. To avoid it, each feature needs its history with timestamps, and each training row is joined to the feature values that were valid at its own time. This is a temporal join against [Type 2 history](/lesson/scd), or against snapshots.

```sql
select e.customer_id, e.event_time, e.cancelled as label, f.logins_30d
from events e
join customer_features_history f
  on  f.customer_id = e.customer_id
  and f.valid_from <= e.event_time
  and e.event_time <  f.valid_to
```

A state table that is overwritten each day cannot support this. It is one more reason to keep history.

## Training-serving skew

During training, a feature is computed by a batch job in SQL on the warehouse. During serving, the same feature is computed by application code on live data. If the two computations differ in any detail, such as a time zone, a rounding rule or the treatment of nulls, the model gets inputs it never saw. Its quality falls, and no error is raised.

A **feature store** is built to prevent this. It has:

- **Feature definitions** written once.
- An **offline store** (warehouse or lake) with the full history, for training with point-in-time joins.
- An **online store** (a key-value database) with the latest value for each entity, for reads in milliseconds.
- Jobs that fill the two from the same definition.

Products include Feast, Tecton, and the feature stores of Databricks, SageMaker and Vertex AI. A small team does not need one: a well-named table of features in the warehouse and a nightly copy to a key-value store gives the same result for batch features. The principle matters more than the product: **one definition, used for training and for serving**.

## Batch and online prediction

| | Batch prediction | Online prediction |
|---|---|---|
| When | On a schedule, for all entities | On request, for one entity |
| Features | From the warehouse | From an online store, in milliseconds |
| Result goes to | A table, then [reverse ETL](/lesson/serving-reverse-etl) | The calling application |
| Example | Risk of cancellation for each customer, each night | Fraud score during a payment |
| Complexity | A normal batch pipeline | A streaming and serving system |

Chip Huyen makes the point in *Designing Machine Learning Systems* that many uses work well with batch prediction, and it is much simpler. Ask the same freshness question as for any pipeline.

## Data quality for models

Models add failure modes that normal tests do not cover.

- **Distribution shift**: the values of a feature move over time. The mean order value was 40 and is now 55. No row is invalid, and the model is less accurate. Monitor the distribution of each feature and of the predictions.
- **Label quality and delay**: labels can be wrong, and they can arrive weeks late.
- **Changes upstream**: a source changes a unit or a category. For a dashboard this is a visible step. For a model it is quiet damage.
- **Reproducibility**: to explain or to repeat a result you must know which version of the data trained the model. Use snapshots or the time travel of a [table format](/lesson/table-formats), and record the version with the model.

## Data for language models

Applications built on large language models need a different supply of data. The common design is **retrieval-augmented generation** (RAG): before the model answers, the system finds relevant passages in the company’s documents and gives them to the model as context.

The pipeline behind it is ordinary data engineering with new parts:

1. **Ingest** documents from wikis, tickets, files and databases. Keep the source, the owner and the access rights of each one.
2. **Parse and clean**: extract text from PDF and HTML. Remove menus and repeated headers.
3. **Chunk**: split the text into passages of a few hundred words.
4. **Embed**: an embedding model turns each passage into a vector, a list of numbers that represents its meaning.
5. **Index**: store the vectors in a vector index (pgvector, OpenSearch, Pinecone, Qdrant and others), with the text and the metadata.
6. **Keep it current**: when a document changes or is deleted, update or remove its chunks. This is incremental loading with deletes.

The usual data rules apply with more force. Old documents give old answers. Duplicates give repeated context. Access control must be applied at retrieval, or the assistant will show a user a document that the user has no right to read.

Structured data matters as well. A model that writes SQL gives better answers when it has a [semantic layer](/lesson/semantic-layer) with named metrics than when it must guess from raw tables.

> **Pitfall.** Features computed with today’s data for past events. Check each feature in a training set: could its value have been known at the time of the row?

> **Pitfall.** A model trained once and never monitored. The world changes and the model does not. Plan the feedback path from the first day.

## Remember

- Training data must be point-in-time correct: only information that existed before each event.
- Use one feature definition for training and for serving, or the model sees inputs it was not trained on.
- Prefer batch prediction when the use permits it.
- Monitor distributions, not only null and unique tests.
- RAG pipelines are ingestion pipelines: freshness, deletes and access rights decide their quality.

::quiz
? A model predicts late payments. A feature is “number of reminders sent”, read from today’s customer table. Why is this a problem?
+ Reminders are sent after a payment is late, so the feature contains information from the future of each training row
- The feature has too many distinct values
- The customer table is too small
! This is leakage. The feature must be the count as it was at the time of each prediction, from a history table.
::end
