---
minutes: 8
tech: []
refs:
  - pragprog: Topic 23, “Design by Contract”, and Topic 24, “Dead Programs Tell No Lies”
  - sre: Ch. 22, “Addressing Cascading Failures”
---
In [Errors and exceptions](/lesson/errors) you saw how one function handles a failure. Design for failure is the same question for a whole system: what happens when a part breaks, and who decides? Systems built only for the happy path fail in confusing ways. Systems designed for failure fail clearly, contain the damage, and recover.

## Fail early

Check inputs and assumptions at the edge of each module, and refuse bad ones at once:

```python
def transfer(amount_pence, from_account, to_account):
    if amount_pence <= 0:
        raise ValueError(f"amount must be positive, got {amount_pence}")
    if from_account == to_account:
        raise ValueError("cannot transfer to the same account")
    ...
```

A bad value refused at the edge is easy to trace. The same value accepted and passed on fails three modules later, with a message that points to the wrong place.

These checks are a **contract**: what the caller must provide (preconditions), and what the module promises in return (postconditions). Writing them down makes the module's expectations clear to every reader.

## Fail loudly

A failure that nobody sees is the worst kind. Log it with enough detail to act on, raise an alert if it matters, and never return a silent default that looks like success. A report that shows £0 because a query failed is worse than a report that says "could not load sales".

## Let the caller decide

A low-level module rarely knows the right response to a failure. A database client does not know whether a timeout means "retry", "show a message" or "use yesterday's figures". So it should report the failure clearly, with its type and details, and let the code that knows the situation decide. Catching and hiding failures deep inside takes that decision away from the people who have the context.

## Contain the damage

In a system of many parts, stop one failure from spreading:

- **Timeouts** on every call to another service. Waiting for ever ties up resources.
- **Bulkheads**: separate pools of threads or connections for different work, so a slow partner does not use up the capacity that everything else needs.
- **Circuit breakers**, as in [Distributed systems basics](/lesson/distributed): stop calling a failing service for a while.
- **Graceful degradation**: if recommendations are down, show the page without them, rather than an error.

> **Rule of thumb.** For each dependency, write down what the product does when it is slow, and when it is down. If the answer is "the whole site fails", decide whether that is acceptable.

## Make recovery easy

- Make operations **idempotent**, so they can be retried safely.
- Keep state in durable stores, so a restarted process loses nothing.
- Practise: turn parts off in a test environment and watch what happens.

## Remember

- Check inputs and assumptions at the edges. Fail early, with a clear message.
- Never hide a failure. Fail loudly, and log what is needed to act.
- Report failures up and let the caller with context decide.
- Contain failures with timeouts, bulkheads, circuit breakers and graceful degradation.

::quiz
? A function receives a negative quantity and silently treats it as zero. Why is this risky?
+ The real bug that produced the negative value stays hidden, and data may be wrong elsewhere
- It makes the function slower
- Zero is not a valid number
! Silent correction hides the cause. Refuse the bad value at the edge with a clear error.
? A shop page fails completely when the recommendations service is down. What would be better?
+ Show the page without recommendations
- Retry the recommendations service forever
- Show a blank page
! Graceful degradation keeps the main task working when an optional part fails.
::end
