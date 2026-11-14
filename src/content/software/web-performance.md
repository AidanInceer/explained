---
minutes: 9
tech: []
refs:
  - hpbn: Ch. 10, “Primer on Web Performance”
  - mdn: “Web performance”, and “Understanding latency”
---
A slow page loses people. Readers leave, shoppers abandon baskets, and users on cheap phones and slow networks, often most of the world's users, suffer most. Web performance is mostly not about clever code. It is about sending less, sending it sooner, and not blocking the page.

## Two kinds of slow

- **Slow to show**: the user stares at a white screen or a spinner.
- **Slow to respond**: the page is visible, but a tap takes a second to do anything.

They have different causes and different fixes. Measure both.

## Measures that matter

Google's **Core Web Vitals** are widely used:

- **Largest Contentful Paint (LCP)**: when the main content appears. Aim for under 2.5 seconds.
- **Interaction to Next Paint (INP)**: how quickly the page responds to taps and keys. Aim for under 200 ms.
- **Cumulative Layout Shift (CLS)**: how much content jumps around as it loads. Aim for under 0.1.

Measure on a mid-range phone and a slow network, not on your laptop on office Wi-Fi. Browser developer tools can slow the network and CPU on purpose.

## Slow to show: the network

As [What happens when you open a page](/lesson/open-a-page) showed, every request has round trips. The fixes:

- **Send less.** Compress text (gzip or Brotli). Resize and compress images, and use modern formats such as WebP or AVIF. Images are often most of a page's weight.
- **Fewer requests in a chain.** A script that loads a script that loads data that loads an image takes four round trips one after another.
- **Closer.** Serve static files from a CDN near the user.
- **Cache.** Give files names that change with their content, and let browsers keep them for a long time, as [HTTP](/lesson/http) explained.
- **Show the important part first.** Load what is above the fold; delay images further down (`loading="lazy"`).

## Slow to show: blocking resources

CSS in the `<head>` blocks drawing until it loads, because the browser needs it to style the page. Plain scripts in the `<head>` block reading the HTML. Use `defer` or `async` on scripts, keep critical CSS small, and load fonts so that text shows in a fallback font first.

## Slow to respond: the main thread

As [JavaScript in the browser](/lesson/js-browser) showed, one long task freezes the page. Most slow responses come from:

- Too much JavaScript: large frameworks and libraries that must be parsed and run.
- Long tasks on each interaction, such as redrawing a huge list.
- Third-party scripts: analytics, ads, chat widgets.

Fixes: ship less JavaScript, split it so each page loads only what it uses, break long tasks up, and show only the visible part of very long lists.

## Layout shift

Content jumps when an image or advert loads without reserved space, and the user taps the wrong button. Give images `width` and `height` attributes, and reserve space for content that loads later.

> **Rule of thumb.** Set a **performance budget**, such as "no more than 200 KB of JavaScript on the first view", and check it in CI. Pages get slower one small addition at a time; a budget makes each addition visible.

## Remember

- Separate slow to show from slow to respond, and measure both on a slow phone.
- Send less, in fewer chained requests, from closer, with good caching.
- Do not block drawing with CSS and scripts in the head.
- Keep JavaScript small and tasks short. Reserve space to stop layout shift.

::quiz
? A page's main image appears after 5 seconds on a phone. Which change helps most?
+ Resize and compress the image, and serve it in a modern format from a CDN
- Add another analytics script
- Rewrite the CSS selectors
! Large images are the most common cause of slow main content. Making the image smaller and closer cuts the time directly.
? Users tap a button and nothing happens for a second, though the page is loaded. What is the likely cause?
- The CDN is far away
+ A long JavaScript task is blocking the main thread
- The image is too large
! Slow responses after load come from the main thread being busy. Break up long tasks and ship less script.
::end
