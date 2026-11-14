The lesson on [windows, event time and watermarks](/lesson/windows-and-time) gave the definitions. Definitions of streaming are hard to hold in the mind, so this lesson traces eight events through one small job and shows the state after each one.

::fig windows | The three kinds of window. This lesson uses the first one, tumbling.

## The job

Count the payments of each minute. In streaming SQL:

```sql
select window_start, count(*) as payments
from table(tumble(table payments, descriptor(event_time), interval '1' minute))
group by window_start
```

The settings:

| Setting | Value | Meaning |
|---|---|---|
| Window | Tumbling, 1 minute, on **event time** | Each event belongs to the minute in which it occurred, not the minute in which it arrived |
| Watermark | Largest event time seen, minus **10 seconds** | “I believe that no event older than this will still arrive” |
| Allowed lateness | **30 seconds** | After a window closes, keep its state for 30 more seconds and correct the result if a late event comes |

## The events

Each event has two times. **Event time** is when the payment was made. **Arrival** is when the job received it. Events 4 and 7 arrive out of order.

| # | Event time | Arrives at | Window it belongs to |
|---|---|---|---|
| 1 | 12:00:05 | 12:00:06 | 12:00 |
| 2 | 12:00:40 | 12:00:41 | 12:00 |
| 3 | 12:00:58 | 12:00:59 | 12:00 |
| 4 | 12:00:50 | 12:01:04 | 12:00, arrives after the minute ended |
| 5 | 12:01:09 | 12:01:10 | 12:01 |
| 6 | 12:01:15 | 12:01:16 | 12:01 |
| 7 | 12:00:30 | 12:01:45 | 12:00, very late |
| 8 | 12:01:50 | 12:01:51 | 12:01 |

## The trace

The **watermark** is the largest event time seen so far, minus 10 seconds. It never goes back. A window **closes** when the watermark passes its end.

| After event | Largest event time | Watermark | State: window → count | Output |
|---|---|---|---|---|
| 1 | 12:00:05 | 11:59:55 | 12:00 → 1 | |
| 2 | 12:00:40 | 12:00:30 | 12:00 → 2 | |
| 3 | 12:00:58 | 12:00:48 | 12:00 → 3 | |
| 4 | 12:00:58 | 12:00:48 | 12:00 → **4** | |
| 5 | 12:01:09 | 12:00:59 | 12:00 → 4, 12:01 → 1 | |
| 6 | 12:01:15 | **12:01:05** | 12:00 → 4, 12:01 → 2 | **12:00 = 4** |
| 7 | 12:01:15 | 12:01:05 | 12:00 → **5**, 12:01 → 2 | **12:00 = 5** (correction) |
| 8 | 12:01:50 | 12:01:40 | 12:01 → 3 | state of 12:00 is deleted |

Read it row by row.

**Events 1 to 3** arrive in order. The window 12:00 collects them. Nothing is output, because the watermark has not passed 12:01:00.

**Event 4** arrives at 12:01:04 by the clock on the wall. If the job used **processing time**, it would put this payment in the 12:01 window, which is wrong. With event time, it goes to 12:00. The window is still open, because the watermark is at 12:00:48. This is an event that is out of order and **not late**. The watermark delay of 10 seconds exists to absorb it.

**Event 5** moves the watermark to 12:00:59. That is one second before the end of the window. Still no output.

**Event 6** moves the watermark to 12:01:05, past 12:01:00. The window 12:00 **closes**, and the job outputs **4**. The result came about 16 seconds after the minute ended. That delay is the price of waiting for events that are out of order.

**Event 7** has event time 12:00:30. Its window is closed. This event is **late**. But the state of the window is kept for the allowed lateness of 30 seconds after the end, so until the watermark reaches 12:01:30. The watermark is at 12:01:05, so the event is accepted: the count becomes 5, and the job outputs a **correction**.

**Event 8** moves the watermark to 12:01:40, past 12:01:30. The state of window 12:00 is **deleted**. An event for 12:00 that arrives now is dropped, or sent to a side output for late data.

## What the trace shows

**1. The watermark is driven by the data.** It advances only when events with newer times arrive. If the source goes quiet, the watermark stops, and the last window is never output. Real engines have an “idle source” timeout for this.

**2. Two settings, two different jobs.**

| Setting | Controls | If too small | If too large |
|---|---|---|---|
| **Watermark delay** | How long to wait before the *first* result | Many events are late. Many corrections | Every result is delayed |
| **Allowed lateness** | How long to accept corrections after | Late events are dropped. Counts are too low | State is kept for longer. More memory |

Choose them from a measurement. For each event, compute arrival time minus event time, and look at the distribution. If 99% arrive within 8 seconds, a watermark delay of 10 seconds is reasonable.

**3. The sink must accept corrections.** Window 12:00 was output twice: first 4, then 5. If the sink only appends, it now has two rows for 12:00 and a total of 9. The sink must **upsert** by the window start. This is the same [idempotent write](/lesson/merge-patterns) as in batch. If the consumer cannot handle corrections at all, for example a system that sends an alert once, set the allowed lateness to zero and send late events to a side output.

**4. State is the cost.** The job keeps one counter for each open window. With a key, such as “payments for each minute **for each merchant**”, it keeps one counter for each window for each merchant. State grows with the number of keys × the number of open windows. The lateness settings decide how long each one is kept.

**5. After a failure, the trace repeats exactly.** A [checkpoint](/lesson/stream-engines) saves the state table and the position in the input together. If the job fails after event 6, it loads the state as it was at the checkpoint and reads the events again from there. Because event time comes from the data and not from the clock, the replay gives the same windows.

## The same data in a batch job

A batch job that runs at 12:05 for the minute 12:00 sees all five events and outputs 5, once. It has no watermark and no corrections, because it waited long enough for the data to be complete.

Streaming gives the result at 12:01:16 in place of 12:05, and it pays with this machinery. That is the choice described in [batch and streaming](/lesson/batch-vs-streaming), now in concrete terms.

> **Pitfall.** A test with events in perfect order. The job passes, and in production the first mobile client with no network sends events from yesterday. Test with events that are late, repeated and out of order.

## Remember

- Event time puts each event in the window in which it occurred, in any order of arrival.
- The watermark is the largest event time seen, minus a delay. A window closes when the watermark passes its end.
- The watermark delay absorbs disorder before the first result. Allowed lateness permits corrections after it.
- Corrections need a sink that upserts by window.
- State is kept for each key and each open window, until the lateness period ends.

::quiz
? In the trace, why is event 4 not “late”, though it arrived after 12:01:00?
+ The watermark was still at 12:00:48, so the window was open
- Its event time was after 12:01:00
- Late events are always accepted
! A window closes when the watermark passes its end, not when the wall clock does. The 10-second delay kept it open.
::end
