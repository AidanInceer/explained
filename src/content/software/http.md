---
minutes: 9
tech: []
refs:
  - rfc9110: Section 9, “Methods”, Section 15, “Status Codes”, and Section 8, “Representation Data and Metadata”
  - mdn: “An overview of HTTP”, and “HTTP caching”
---
**HTTP** is the language of the web. Every page, image, API call and app update travels as an HTTP request and response. It is simple text with a few strict rules, and once you can read it, you can debug most web problems by looking at what was really sent.

## A request

```
POST /api/orders HTTP/1.1
Host: shop.example
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"item": "tea", "quantity": 2}
```

A request has a **method**, a **path**, **headers**, and sometimes a **body**.

## Methods

The method says what the client wants:

| Method | Meaning | Safe to repeat? |
|---|---|---|
| `GET` | Read something | Yes, and it changes nothing |
| `POST` | Create something, or start an action | No: two posts may create two orders |
| `PUT` | Replace something at this address | Yes: the second gives the same result |
| `PATCH` | Change part of something | Depends on the change |
| `DELETE` | Remove something | Yes: it is gone either way |

"Safe to repeat" is called **idempotent**. It matters because networks fail. If a `PUT` times out, the client can send it again. If a `POST` times out, the order may or may not exist, and sending it again may create a second one.

> **Pitfall.** Never make a `GET` change anything. Browsers, crawlers and caches send `GET` requests freely, for example to preload links. A "delete" link that uses `GET` will be clicked by a robot.

## A response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/8841

{"id": 8841, "status": "pending"}
```

The **status code** says how it went:

- **2xx** success: `200 OK`, `201 Created`, `204 No Content`.
- **3xx** go elsewhere: `301 Moved Permanently`, `304 Not Modified`.
- **4xx** the client made a mistake: `400 Bad Request`, `401 Unauthorized` (who are you?), `403 Forbidden` (you may not), `404 Not Found`, `429 Too Many Requests`.
- **5xx** the server failed: `500 Internal Server Error`, `503 Service Unavailable`.

The difference between 4xx and 5xx tells you whose problem it is. A client should not retry a 400, because the same request will fail again. It can retry a 503 after a pause.

## Headers

Headers carry everything else: the type of the body (`Content-Type`), who the user is (`Authorization`), what the client accepts (`Accept`), and how to cache.

## Caching

The fastest request is one that is never sent. **Caching** headers let browsers and CDNs keep a copy:

- `Cache-Control: max-age=31536000` means "keep this for a year". Good for files whose name changes when their content changes, such as `app.3f9a2c.js`.
- `Cache-Control: no-store` means "never keep this". Good for private data.
- An `ETag` header gives a version tag. The browser asks "has it changed since this tag?", and the server answers `304 Not Modified` with no body if not.

## Stateless

Each HTTP request stands on its own: the server does not remember the previous one by default. Anything that must carry across requests, such as "this user is signed in", travels in each request, in a cookie or a header. This makes web servers easy to scale, because any server can answer any request.

## Remember

- A request is a method, a path, headers and an optional body.
- `GET` reads and changes nothing. `PUT` and `DELETE` are safe to repeat; `POST` is not.
- 4xx means the client was wrong; 5xx means the server failed.
- Caching headers let browsers and CDNs skip requests. Each request stands alone.

::quiz
? A client sends `POST /orders`, and the connection drops before the response. What is the risk if it simply retries?
+ A second order may be created
- The server will reject the retry
- Nothing: POST is safe to repeat
! POST is not idempotent. The first request may have succeeded before the drop. APIs use an idempotency key to make retries safe.
? An API returns `403 Forbidden`. What does it mean?
- The server crashed
+ The server knows who you are, and you are not allowed to do this
- The page does not exist
! 403 is a client-side problem of permission. 401 means the server does not know who you are.
::end
