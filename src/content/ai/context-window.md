---
minutes: 8
tech: []
refs:
  - lostmiddle: Sections 1 and 3, on where in a long context information is used
  - aieng: Ch. 5, “Prompt Engineering”, on context length and efficiency
---
A language model can only see a limited amount of text at once: its **context window**, measured in [tokens](/lesson/tokens). Everything the model uses to answer, the instructions, the conversation so far, any documents, and its own answer as it writes, must fit inside it. Anything outside the window does not exist for the model.

## What fills the window

In a chat, every request typically sends:

- A **system prompt**: instructions from the application.
- The **conversation history**: earlier user messages and model replies.
- Any **documents, search results or tool outputs** added for this turn.
- The **answer** being generated, token by token.

Models do not remember previous conversations by themselves. The "memory" in a chat is the history being sent again with each message. When it grows too long, something must be dropped or summarised.

## Sizes

Context windows have grown from a few thousand tokens to hundreds of thousands, and in some models a million or more. At about ¾ of a word per token, 200,000 tokens is roughly a 500-page book.

## Why long contexts cost more

- **Attention** compares every token with every other, as [Attention](/lesson/attention) explained: the work grows with the square of the length.
- The **KV cache**, from [How text is generated](/lesson/generation), grows with the length, using GPU memory for every token kept.
- **Prefill** of a long prompt takes time before the first token appears.
- **Price**: providers charge per input token, so sending a whole book with every question is expensive. Prompt caching helps when the same long prefix is reused.

## Long is not the same as well used

A model that accepts 200,000 tokens does not use all of them equally well:

- Studies found models use information near the **start and end** of a long context better than in the **middle**, though newer models have improved.
- Many irrelevant passages can distract the model from the one that matters.
- Instructions given early in a very long conversation may be followed less closely later.

Test the model on your own long inputs. A "needle in a haystack" test, finding one planted sentence, is easier than real tasks that need many pieces combined.

## Working within the window

- **Send only what is relevant.** Retrieve the passages that matter instead of whole document sets, as [Retrieval-augmented generation](/lesson/rag) explains.
- **Summarise** old conversation turns.
- **Put key instructions and questions where they are used best**, often at the end, after long documents.
- **Keep the system prompt short and clear.**

> **Pitfall.** When a conversation exceeds the window, applications often cut the oldest messages silently. The model then "forgets" instructions or facts from earlier, with no warning to the user.

## Remember

- The context window is everything the model can see at once, in tokens, including its answer.
- Chat memory is the history re-sent each time; models have no memory of their own.
- Longer contexts cost more compute, memory, time and money.
- Long contexts are not used evenly. Send relevant text, and place key instructions well.

::quiz
? A chat app works well for short conversations, but after a long one the model ignores an instruction from the first message. A likely cause?
+ The early messages no longer fit in the context window and were dropped
- The model got tired
- The instruction expired after an hour
! When the history exceeds the window, the oldest parts are often cut.
? Why does sending a 100,000-token document with every question cost a lot?
+ Each request processes and pays for all those input tokens again
- Documents are stored permanently in the model
- Long documents are compressed
! The model re-reads the whole context on each request, unless a prefix cache can be reused.
::end
