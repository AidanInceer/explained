---
minutes: 9
tech: []
refs:
  - mdn: “The event loop”, in JavaScript execution model, and “Asynchronous JavaScript”
---
JavaScript in the browser has one surprising property: it runs on a **single thread**, the same thread that draws the page and responds to clicks. Everything about how to write good browser code follows from this. A slow piece of code does not just run slowly. It freezes the whole page.

## Events

Browser code mostly reacts. You register a function, a **handler**, to run when something happens:

```javascript
button.addEventListener('click', () => {
  basket.add(item)
  updateBasketCount()
})
```

Clicks, key presses, a finished network request, a timer: each is an **event**, and each runs its handlers.

## The event loop

The browser keeps a **queue** of tasks: events to handle, timers that are due, network responses that arrived. The **event loop** does this, again and again:

1. Take the next task from the queue.
2. Run it **to the end**. Nothing else runs meanwhile.
3. Let the browser update the screen, if needed.
4. Go back to step 1.

Step 2 is the key. While one task runs, no click is handled and nothing on screen changes. A task that takes 2 seconds freezes the page for 2 seconds.

> **Rule of thumb.** Keep each task short. A task longer than about 50 ms is noticeable to a user. Split long work into pieces, or move it off the main thread.

There is a second, smaller queue: the **microtask queue**. Promise callbacks wait there. After each task, the event loop runs every waiting microtask before it takes the next task. So a promise callback always runs before a timer, even a timer with a delay of 0.

::fig sw-event-loop | Step through four lines of JavaScript and watch the stack and the two queues.

## Waiting without blocking

Slow things in the browser, such as network requests, do not run on the main thread. You start them, and the browser puts a task in the queue when they finish. Modern JavaScript writes this with **promises** and `async`/`await`:

```javascript
async function loadOrders() {
  const response = await fetch('/api/orders')
  const orders = await response.json()
  render(orders)
}
```

`await` does not block the thread. The function pauses, the event loop handles other tasks, and the function continues when the response arrives. The code reads from top to bottom, even though it runs in pieces.

## Heavy work

For real computation, such as processing a large image or a big file, use a **Web Worker**: a separate thread with no access to the DOM. The page sends it data in a message, the worker computes, and it sends back the result. The main thread stays free for the user.

## Common mistakes

- **Forgetting that `await` is needed.** Without it, you get a promise, not the data.
- **Requests in a loop, one after the other.** Ten requests that each wait for the last take ten round trips. Start them together with `Promise.all` if they do not depend on each other.
- **Not handling failure.** `fetch` only fails on network errors. A `404` or `500` response arrives as a normal response, so check `response.ok`.

## Remember

- Browser JavaScript runs on one thread, shared with drawing the page and handling input.
- The event loop runs one task at a time, to the end. A long task freezes the page.
- `async` and `await` wait for slow things without blocking.
- Move heavy computation to a Web Worker. Check `response.ok`.

::quiz
? A button's click handler loops over 50 million items. What does the user see?
- The page keeps working while the loop runs
+ The page freezes until the loop ends
- The browser runs the loop on another core automatically
! The handler runs on the main thread, to the end, so nothing else can happen until it finishes.
? `fetch('/api/x')` returns a response with status 500. Does the promise fail?
- Yes, every non-200 status rejects the promise
+ No: only network errors reject it, so check `response.ok`
- It retries automatically
! An HTTP error status is still a response. Code must check the status itself.
::end
