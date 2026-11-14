---
minutes: 9
tech: []
refs:
  - kurose: Ch. 2, “Application Layer”, Sections 2.2 (the web and HTTP) and 2.4 (DNS)
  - hpbn: Ch. 1, “Primer on Latency and Bandwidth”, and Ch. 4, “Transport Layer Security (TLS)”
  - mdn: “How browsers work”, in Web performance
---
You type `shop.example` and press Enter. Half a second later, a page appears. In between, your computer and many others do a long, careful sequence of steps. Knowing them tells you where a slow or broken page can go wrong.

## 1. Find the address: DNS

Computers find each other by IP address, as [Networks and the internet](/lesson/networks) explained, not by name. The **Domain Name System** (DNS) turns `shop.example` into an address such as `203.0.113.7`.

Your computer asks a **resolver**, usually run by your internet provider or a public service. If the resolver does not have the answer stored, it asks the servers responsible for `.example`, and then the ones responsible for `shop.example`. Each answer comes with a **time to live**: how long it may be kept. Most lookups are answered from a cache in a few milliseconds.

> **Pitfall.** When you move a site to a new server, old DNS answers stay in caches until their time to live runs out. Lower the time to live a day before the move.

## 2. Connect: TCP

The browser opens a **TCP** connection to that address on port 443. TCP starts with a **handshake**: three short messages to agree to talk. That costs one round trip before any data moves.

## 3. Secure it: TLS

On top of TCP, the browser and server set up **TLS**, the "S" in HTTPS:

- The server sends its **certificate**: a document, signed by a trusted authority, that says "this key belongs to shop.example".
- The browser checks the signature and the name.
- They agree on keys to encrypt the rest of the conversation.

Modern TLS (version 1.3) needs one more round trip for this. Now nobody on the network can read or change the data, and the browser knows it is talking to the real shop.

## 4. Ask: the HTTP request

The browser sends an **HTTP request**:

```
GET / HTTP/1.1
Host: shop.example
Accept: text/html
```

`GET` is the method: "send me this". `/` is the path. The headers add details. The next lesson, [HTTP](/lesson/http), covers this in full.

## 5. Answer: the response

The server finds or builds the page and sends a **response**: a status code (`200 OK`), headers, and the HTML.

## 6. Build the page

The browser reads the HTML and finds that it needs more: style sheets, scripts, images, fonts. It requests each one, often from the same connection or from a CDN close to you. Then it:

1. Builds the **DOM**, a tree of the page's elements.
2. Applies the CSS to work out the style of each element.
3. Works out the size and position of everything: **layout**.
4. Draws it: **paint**.
5. Runs the JavaScript, which may change the page again.

## Where the time goes

Before the first byte of HTML arrives, there are about four round trips: DNS, TCP, TLS, and the request itself. On a phone network with 100 ms per round trip, that is 400 ms before the server even starts. This is why sites put servers and CDNs close to users, keep connections open for reuse, and avoid long chains of requests where each waits for the last.

## Remember

- DNS turns a name into an IP address, usually from a cache.
- TCP connects, TLS proves the server's identity and encrypts.
- HTTP asks and answers. The page then asks for more files.
- The browser builds the DOM, styles, lays out, paints and runs scripts.

::quiz
? A site moves to a new server, and some users still reach the old one for hours. Why?
+ Their DNS resolvers cached the old address until its time to live ends
- TCP keeps old connections for ever
- The certificate still names the old server
! DNS answers are cached for their time to live. Lowering it before a move makes the change spread faster.
? What does the server's TLS certificate let the browser check?
- That the page has no bugs
+ That it is talking to the real owner of the domain
- That the server is fast
! A trusted authority signs that the key belongs to the domain, so an impostor cannot pretend to be it.
::end
