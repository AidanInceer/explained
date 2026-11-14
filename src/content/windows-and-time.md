---
title: Windows, event time and watermarks
summary: To aggregate an endless stream you cut it into windows. Events arrive late, so you must choose which clock to trust and how long to wait.
track: processing
level: core
minutes: 9
at: [1, 2]
prereqs: [message-brokers]
tech: [stream, brokers]
refs:
  - streaming: Ch. 1 to 3
  - dataflow: Sections 1 and 2
---
"How many orders were there?" has no answer on a stream, because the stream does not end. You must ask "how many orders *in each minute*?" The parts that you cut the stream into are **windows**. Deciding which window an event belongs to is the central problem of stream processing.

## Three kinds of window

::fig windows | Ten events on one timeline. Change the window type and see how the same events are grouped and counted.

- **Tumbling** windows have a fixed size and do not overlap. Each event is in exactly one window.
- **Sliding** windows have a fixed size and start at a shorter interval, so they overlap. An event is in several windows. Some systems name these hopping windows.
- **Session** windows have no fixed size. A window continues while events keep arriving, and closes after a gap with no events. Each key, such as each user, has its own sessions.

## Two clocks

Each event has two times:

- **Event time**: when the event occurred, recorded at the source.
- **Processing time**: when your pipeline saw it.

They are different, and the difference is not constant. A phone records a purchase at 12:03 in a tunnel and sends it at 12:19. A service is restarted and sends ten minutes of events in one burst.

If you make windows by processing time, the purchase is counted in the 12:19 window. The result depends on network conditions, and if you process the same data again tomorrow you get a different result. If you make windows by **event time**, the purchase is counted at 12:03, where it belongs, and a replay gives the same result.

For any result that must be correct, use event time. Processing time is acceptable for monitoring the pipeline itself.

## The cost of event time: when is a window complete?

With event time there is a new problem. It is 12:10. Can you publish the count for the window 12:00 to 12:05? An event from 12:03 could still arrive. You cannot know that it will not.

A **watermark** is the pipeline's estimate of completeness. A watermark of 12:05 means: "I expect that all events with an event time before 12:05 have now arrived." When the watermark passes the end of a window, the engine closes the window and emits the result.

A watermark is a heuristic. A common one is "the largest event time seen so far, minus a fixed delay". The delay is a trade-off:

| Watermark delay | Result |
|---|---|
| Short, for example 5 seconds | Results are published quickly. More events arrive after their window is closed |
| Long, for example 10 minutes | Few late events. Every result is 10 minutes later |

## Late data

An event that arrives after the watermark has passed its window is **late**. You must choose what to do with it:

1. **Drop it.** Simple. The counts are slightly low.
2. **Allow lateness.** Keep the window's state for an added period. When a late event arrives, emit a corrected result. The target must be able to accept an update to a result it already has.
3. **Send it to a side output.** Store late events separately and correct the data later with a batch job.

*Streaming Systems* arranges the subject as four questions. They are a good checklist for any streaming design:

- **What** is computed? The aggregation.
- **Where** in event time? The windows.
- **When** in processing time are results emitted? The watermark and triggers.
- **How** do later results relate to earlier ones? Discard, accumulate, or retract and replace.

## State

A streaming job must remember things between events: the running count for each open window, for each key. This is **state**. The engine saves it to durable storage at intervals, in a *checkpoint*, so that a restarted job continues from where it stopped. State that grows without limit is a common production problem. A session window that never closes, or a join with no time limit, are typical causes. Each piece of state needs a rule for when it is removed.

> **For experienced readers.** The Dataflow Model paper is the origin of this vocabulary. Its main argument is that batch is a special case of streaming, in which the watermark moves from the start to the end of time in one step. Apache Beam, Flink and Spark Structured Streaming all implement versions of the model.

## Remember

- Tumbling, sliding and session windows cut a stream into parts that can be aggregated.
- Use event time for correct results. Processing time gives results that depend on delays.
- A watermark estimates when a window is complete. A shorter delay gives faster and less complete results.

::quiz
? An event occurred at 12:03 and reached the pipeline at 12:19. With 5-minute tumbling windows on event time, which window is it in?
+ 12:00 to 12:05
- 12:15 to 12:20
- Both
! Event time is the time at which the event occurred. The delay does not change the window.
? What is the effect of a longer watermark delay?
- Results are faster and less complete
+ Results are slower and more complete
- There is no effect on results
! The engine waits longer before it closes each window, so more late events are included and each result is published later.
? Which window type is best to measure how long each user is active on a website?
- Tumbling
- Sliding
+ Session
! Activity has no fixed length. A session window continues while events arrive and closes after a period with none.
::end
