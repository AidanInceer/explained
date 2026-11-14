---
title: "Worked example: an API extract that survives"
summary: A small Python extract with pagination, rate limits, retries, a saved cursor and an idempotent load. Each part exists because of one specific failure.
track: pipelines
level: deeper
minutes: 10
at: [1, 5]
prereqs: [merge-patterns]
tech: [ingestion, orchestrators, saas]
refs:
  - fode: Ch. 7, “APIs”, “Ingestion considerations”
---
The usual advice is to buy connectors for common sources. But sooner or later there is a source with no connector: a partner’s system, an internal tool, a small vendor. Then you write an extract. This lesson builds one in Python, and each part is added because of one specific failure.

The source is an invented HTTP API that returns invoices.

## Version 0: what a first attempt looks like

```python
import requests

rows = requests.get("https://api.example.com/invoices").json()
load_to_warehouse(rows)
```

It works on the first day. It has six defects, and each of the next sections removes one.

## 1. Pagination: the API does not return everything

An API returns a page, for example 100 records, with a pointer to the next page. Version 0 loads 100 invoices and reports success.

```python
def fetch_all(session, url, params):
    while url:
        resp = session.get(url, params=params, timeout=30)
        resp.raise_for_status()
        body = resp.json()
        yield from body["data"]
        url = body.get("next")      # absolute URL of the next page, or None
        params = None               # the next URL already contains them
```

Prefer **cursor** pagination (an opaque pointer to the next page) to **offset** pagination (`?page=7`). With offsets, a record that is inserted while you read moves every later record by one position, and you get one record twice and miss another.

Note `timeout=30`. Without a timeout, a request to a server that stops answering waits without end, and the pipeline hangs with no error.

## 2. Incremental extraction: do not fetch all history each run

Ask only for what changed since the last run.

```python
params = {"updated_since": cursor, "sort": "updated_at"}
```

The **cursor** is the highest `updated_at` that was loaded successfully. Where is it kept? Not in the memory of the job, and not derived from the clock. It is stored in a small state table, or derived from the target: `select max(updated_at) from raw.invoices`.

Two safety rules from [incremental loading](/lesson/incremental-loading):

- **Overlap.** Start a little before the cursor, for example five minutes. Records committed late with an earlier timestamp are then not missed. The load in part 5 makes the repeated records harmless.
- **Save the cursor only after the load succeeded.**

## 3. Rate limits: the API tells you to slow down

An API permits a number of requests in a period. Beyond it, it answers with status `429 Too Many Requests`, often with a `Retry-After` header.

```python
import time

def get(session, url, **kw):
    for attempt in range(6):
        resp = session.get(url, timeout=30, **kw)
        if resp.status_code == 429:
            wait = float(resp.headers.get("Retry-After", 2 ** attempt))
            time.sleep(wait)
            continue
        return resp
    raise RuntimeError("rate limited after 6 attempts")
```

Respect the header. A client that ignores it can be blocked for a day.

## 4. Transient failures: try again, with backoff

Networks fail and servers return `500`, `502` or `503` for a moment. A retry usually succeeds. But the type of error decides.

| Response | Meaning | Action |
|---|---|---|
| Timeout, connection error, `5xx` | Probably temporary | Retry, with a longer wait each time |
| `429` | Too fast | Wait as told, then retry |
| `401`, `403` | Credentials are wrong or expired | Refresh the token once. Then fail |
| `400`, `404`, `422` | Your request is wrong | Fail at once. A retry gives the same answer |

**Exponential backoff** doubles the wait after each failure: 1, 2, 4, 8 seconds. Add a random part (**jitter**), so that many clients that failed together do not all retry at the same moment. Libraries such as `tenacity`, or the retry support of `urllib3`, do this for you.

Limit the number of attempts. A job that retries without end hides a real outage.

## 5. An idempotent load

Because of the overlap and the retries, the same invoice can be fetched twice. The load must not create duplicates.

1. **Land the raw response** in object storage or a raw table, unchanged, with metadata: the time of the load and the run ID. If a later step has a defect, you can process again without a new call to the API.
2. **[Merge](/lesson/merge-patterns) into the target by the invoice ID**, keeping the row with the newest `updated_at`.

```python
record = {
    "invoice_id": item["id"],
    "payload": json.dumps(item),         # the full original record
    "updated_at": item["updated_at"],
    "_loaded_at": run_started_at,
    "_run_id": run_id,
}
```

Keeping the full payload means that a new field in the API is not lost. This is the “evolve” policy from [schema evolution](/lesson/schema-evolution).

## 6. Deleted records

`updated_since` never returns an invoice that was deleted. Find out how the API reports deletes. The usual forms are a `deleted` flag on the record, a separate endpoint for deleted IDs, or nothing. In the last case, a periodic **full comparison** of IDs is the only method: fetch all IDs once a week and mark those that are missing.

## 7. Checks at the end

A run that returns zero rows with no error looks the same as success.

- Compare the row count with the usual count for that weekday. Alert when it is far from normal.
- If the API returns a total (`"total": 1482`), compare it with the number of records fetched.
- Validate the required fields of each record. Send bad records to a reject table with the reason. Do not drop them in silence, and do not let one bad record stop 10,000 good ones.

## The whole flow

```python
def run(run_id):
    cursor = read_cursor("invoices")                     # from the state table
    since = cursor - timedelta(minutes=5)                # overlap
    session = make_session(token=get_secret("api_token"))

    records = list(fetch_all(session, URL, {"updated_since": since.isoformat()}))
    write_raw(records, run_id)                           # 1. land raw
    good, bad = validate(records)                        # 2. check
    write_rejects(bad, run_id)
    merge_into_target(good)                              # 3. idempotent load
    check_volume(len(records))                           # 4. alert if unusual

    if good:
        save_cursor("invoices", max(r["updated_at"] for r in good))   # 5. last
```

The order matters. The cursor is saved last. If any earlier step fails, the next run starts from the old cursor and repeats the work, and the merge makes the repetition harmless.

The token comes from a [secrets manager](/lesson/secrets-access), not from the code.

## What the orchestrator adds

Run this as a task in an [orchestrator](/lesson/orchestration). It gives the schedule, a retry of the whole task, a timeout, the logs, and an alert. Keep the retries inside the code for single requests, and the retry of the orchestrator for the whole run.

## When to stop and buy

You now own this code. The vendor will change the API, and you will change the code. For one or two special sources that is acceptable. If you are about to write the fifth client, look again at [managed connectors](/lesson/ingestion-patterns), or at a library such as dlt that supplies pagination, state and loading.

## Remember

- Follow pagination to the end, with a timeout on each request.
- Extract incrementally from a stored cursor, with an overlap.
- Obey rate limits. Retry temporary errors with backoff and jitter. Fail fast on errors that a retry cannot repair.
- Land the raw response, then merge by key.
- Save the cursor last. Check the volume. Handle deletes on purpose.

::quiz
? The job saves the new cursor before the load, and the load then fails. What is the result?
+ The next run starts after the records that were never loaded, so they are lost
- The records are loaded twice
- Nothing: the job is idempotent
! Saving progress before the work is at-most-once behaviour. Save it after the load, and let the merge absorb any repetition.
::end
