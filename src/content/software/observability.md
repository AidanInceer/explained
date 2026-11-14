---
minutes: 9
tech: []
refs:
  - sre: Ch. 6, “Monitoring Distributed Systems”, on the four golden signals
  - twelve: XI, “Logs”
---
Once a system runs in production, you cannot step through it with a debugger. Users report "it is slow" or "it failed", and you must find out why from the outside. **Observability** is how well you can understand what a running system is doing from what it reports. The three main sources are **logs**, **metrics** and **traces**.

## Logs: what happened

A **log** is a record of an event: "order 8841 created", "payment failed: card declined". Good logs:

- Are **structured**: key-value pairs or JSON, not free text, so you can search and filter: `level=error order_id=8841 reason=card_declined`.
- Have a **level**: debug, info, warning, error.
- Include **context**: a request id, the user id where allowed, the operation.
- Never include secrets or more personal data than needed, as [Secrets and keys](/lesson/secrets) warned.

Programs write logs to standard output; the platform collects them into one searchable place.

## Metrics: how much and how fast

A **metric** is a number measured over time: requests per second, errors per minute, response time, queue length, memory used. Metrics are cheap to store and fast to query, so they drive dashboards and alerts.

For any service, watch the **four golden signals**:

1. **Latency**: how long requests take. Look at percentiles, such as the 99th, not only the average, because the average hides the slow requests that users notice.
2. **Traffic**: how many requests.
3. **Errors**: how many fail.
4. **Saturation**: how full the service is: CPU, memory, connections, queue depth.

## Traces: where the time went

A request to a modern system may pass through a load balancer, three services, a cache and two databases. A **trace** follows one request across all of them: each step is a **span** with a start, an end and its parent. A trace shows at once that, of 900 ms, 820 were spent waiting for one slow query.

Tracing needs each service to pass a trace id along with every call. **OpenTelemetry** is the open standard for producing logs, metrics and traces in a common way, whichever tool you use to view them.

## Alerts

Alert on **symptoms that users feel**, not on every cause:

- Good: "more than 1% of checkout requests failed in the last 5 minutes".
- Poor: "CPU above 80%" — high CPU may be harmless.

Every alert must need a human action. Alerts that fire often and need nothing teach people to ignore them, and then the real one is missed. Many teams set **service level objectives** (SLOs), such as "99.9% of requests succeed in under 300 ms", and alert when they are at risk.

> **Rule of thumb.** For every important operation, ask: if this broke at 3 a.m., what would tell us, and what would we look at first? Build that before you need it.

## Remember

- Logs say what happened; metrics say how much and how fast; traces say where the time went.
- Use structured logs with context, and no secrets.
- Watch latency, traffic, errors and saturation. Use percentiles.
- Alert on user-facing symptoms, and only when a person must act.

::quiz
? The average response time is 120 ms, but users complain that the site is often slow. What should you look at?
+ The 95th or 99th percentile of latency
- The average again
- The number of servers
! The average hides slow requests. High percentiles show what the slowest users experience.
? Which is the better alert?
+ More than 2% of payment requests failed in the last five minutes
- CPU is above 75%
- A log line contains the word "warning"
! Alert on symptoms users feel. High CPU or a warning may need no action.
::end
