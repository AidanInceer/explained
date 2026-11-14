---
minutes: 9
tech: []
refs:
  - mdn: “Same-origin policy”, “Cross-Origin Resource Sharing (CORS)”, and “Using HTTP cookies”
  - owasp: A01, “Broken Access Control”
---
You may have many sites open at once: your bank in one tab, an unknown page in another. The browser must stop the unknown page from reading your bank account. Its main tool is the **same-origin policy**. Cookies and CORS are the rules built around it, and they explain many errors that web developers meet.

## Origins

An **origin** is three things together: the scheme, the host and the port. `https://shop.example:443` is one origin. These are all different origins:

- `http://shop.example` (different scheme)
- `https://api.shop.example` (different host)
- `https://shop.example:8443` (different port)

## The same-origin policy

A script from one origin **may send** many kinds of request to another origin, but it **may not read** the response, unless the other origin allows it. A page on `evil.example` can make your browser send a request to your bank. It cannot read your balance from the answer.

This one rule stops a huge class of attacks. It is also why your own front end on `app.example` cannot simply read responses from your API on `api.example`.

## CORS: the server allows it

**Cross-Origin Resource Sharing** lets a server say which other origins may read its responses. The browser sends an `Origin` header. The server answers with:

```
Access-Control-Allow-Origin: https://app.example
```

and the browser lets the script read the response. For requests that a plain HTML form could not send, such as a `PUT` or a `POST` with a JSON body, the browser first sends a **preflight** `OPTIONS` request to ask permission.

> **Pitfall.** A CORS error is reported by the browser, but the fix is on the server. And `Access-Control-Allow-Origin: *` with credentials is not allowed, for good reason: it would let any site read your users' private data.

CORS is enforced by browsers. A script on a server, or `curl`, ignores it. So CORS is not access control. It protects users' browsers, not your API.

## Cookies

A **cookie** is a small piece of data that a server asks the browser to store and send back with later requests to the same site. Sign-in sessions usually work this way.

Because the browser sends cookies automatically, they need careful settings:

- `HttpOnly`: scripts cannot read the cookie, so an injected script cannot steal the session.
- `Secure`: sent only over HTTPS.
- `SameSite=Lax` or `Strict`: not sent on requests that other sites start (`Lax` still sends it when the user follows a link to your site), which blocks most **cross-site request forgery** (CSRF), where a hostile page makes your browser send a request that acts as you.

## Cross-site scripting

The same-origin policy cannot help if an attacker's script runs *inside* your origin. That is **cross-site scripting** (XSS): user input, such as a comment, is put into a page as HTML, and it contains a `<script>`. The script now runs as your site, with your users' sessions.

The defence: never insert user input as HTML. Insert it as text, which modern frameworks do by default, and add a **Content Security Policy** header that limits where scripts may come from.

## Remember

- An origin is scheme, host and port. Scripts cannot read other origins' responses by default.
- CORS lets a server allow named origins to read its responses. Browsers enforce it; servers fix it.
- Cookies need `HttpOnly`, `Secure` and `SameSite`.
- XSS runs an attacker's script inside your origin. Treat user input as text.

::quiz
? A page on `app.example` calls `api.example` and gets a CORS error. Where is the fix?
- In the page's JavaScript
+ On the API server, which must allow the origin `app.example`
- In the user's browser settings
! The browser blocks the read because the server has not allowed this origin. The server must send the right CORS headers.
? Why does a session cookie need the `HttpOnly` flag?
+ So that a script injected into the page cannot read and steal it
- So that it is only sent over HTTP
- So that it expires when the tab closes
! HttpOnly hides the cookie from JavaScript, which limits what an XSS attack can take.
::end
