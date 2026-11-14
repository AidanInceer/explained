---
minutes: 9
tech: []
refs:
  - mdn: “Server-side website programming”, and “Introduction to client-side frameworks”
  - hpbn: Ch. 10, “Primer on Web Performance”
---
Every page on the screen is HTML in the end. The question is **where and when** that HTML is made: on a server for each request, in the user's browser, or once, ahead of time. Each answer changes how fast the page appears, how fresh its data is, what it costs to run, and how well search engines see it.

## Server-side rendering

The server builds the full HTML for each request and sends it. This is how the web worked from the start, with PHP, Rails or Django, and modern frameworks such as Next.js and Nuxt can do it too.

- **Fast first view.** The browser shows content as soon as the HTML arrives.
- **Fresh data.** Each page is built with the latest data, for that user.
- **Good for search engines**, which read the HTML directly.
- **Costs a server** for every view, and the server must be fast.

## Client-side rendering

The server sends a nearly empty HTML page and a JavaScript bundle. The script runs in the browser, fetches data from an API, and builds the page. This is a **single-page application** (SPA).

- **Fluid once loaded.** Moving between screens needs only data, not a new page.
- **Simple hosting.** The files are static; only the API needs a server.
- **Slow first view**, especially on slow phones: download the script, run it, then fetch data, then draw.
- **Weaker for search engines and link previews** that do not run scripts.

This site is a client-rendered app. Its lesson pages load small, already prepared files, which keeps the first view quick.

## Static site generation

The HTML for every page is built **once**, at build time, and served as plain files from a CDN.

- **The fastest and cheapest.** No server work per request, and a CDN near every user.
- **Very robust.** Nothing to crash at request time.
- **Data is only as fresh as the last build.** Fine for docs, blogs and marketing pages; not for a basket.

## Mixing them

Real sites mix the three:

- A shop builds product pages statically and rebuilds them when a price changes, renders the basket on the server, and makes the search box interactive in the browser.
- **Hydration**: the server sends HTML so the page appears at once, then the client-side framework takes over to make it interactive. The cost is that the page looks ready before it responds to clicks.

## How to choose

| Need | Usually best |
|---|---|
| Content that rarely changes, many readers | Static |
| Personal or fast-changing data, must be visible quickly | Server |
| A tool that people use for a long time after it loads | Client |
| Found through search engines | Static or server |

> **Rule of thumb.** Start with the simplest choice that meets the need. Static is simpler than server, and server is often simpler than a full client app with its own state and API layer.

## Remember

- Server rendering builds HTML per request: fast first view, fresh data, a server to run.
- Client rendering builds the page in the browser: fluid after load, slow first view.
- Static generation builds HTML once: fastest and cheapest, as fresh as the last build.
- Most real sites mix them. Choose by freshness, first view, and search needs.

::quiz
? A documentation site changes a few times a week and has many readers worldwide. What suits it best?
+ Static site generation served from a CDN
- Server rendering on every request
- A client-side app that fetches every page from an API
! The content changes rarely, so build it once. A CDN serves it fast and cheaply everywhere.
? A client-rendered shop loads slowly on cheap phones. Why?
- Phones cannot render HTML
+ The phone must download and run a large script, then fetch data, before anything shows
- The server is too fast
! Client rendering puts all the work on the device. Slow CPUs and networks show the cost.
::end
