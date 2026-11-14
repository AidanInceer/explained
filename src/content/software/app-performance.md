---
minutes: 8
tech: []
refs:
  - androiddev: “App performance guide”, on slow rendering and memory
  - appledev: “Improving app responsiveness”, and Instruments
---
People judge an app in the first seconds: how fast it opens, whether scrolling is smooth, whether a tap responds at once. They also notice, later, if it drains their battery or makes the phone hot. Phones are powerful, but they have less memory than computers, run on a battery, and are often on slow networks. Each of these shapes how you build.

## Smooth screens

A screen that refreshes 60 times a second gives the app about **16.7 ms** to prepare each frame. On a 120 Hz screen, about 8.3 ms. If the work for a frame takes longer, the frame is skipped, and the user sees a **stutter**, especially while scrolling.

The frame work happens on the **main thread**, also called the UI thread, which also handles taps. The rule is the same as in [JavaScript in the browser](/lesson/js-browser): never do slow work on it.

- Read files, query the database and call the network on a background thread or with async code.
- Decode and resize large images off the main thread, and only to the size that is shown.
- In long lists, use the platform's list views, which only create views for the rows on screen and reuse them.

## Start-up time

Users notice a slow launch more than anything. Show the first useful screen fast:

- Do only what the first screen needs. Load the rest after.
- Show cached data at once, then refresh it.
- Avoid large libraries that run code at start-up.

## Memory

A phone runs many apps in little memory. If your app uses too much, the system ends it, even while the user is using it. Large images are the usual cause: a 12-megapixel photo takes about 48 MB in memory when decoded, at 4 bytes per pixel. Load images at the size you show them, and let the system free caches when it asks.

## Battery and network

The radio is one of the most power-hungry parts of a phone. Every time the app wakes it, it stays on for a while. So:

- **Batch** network requests together, instead of many small ones spread over time.
- Avoid polling. Use push, as in [Background work and notifications](/lesson/background-work).
- Download large files on Wi-Fi where you can.
- Stop location updates, sensors and animations that the user cannot see.

## Measure on real devices

The simulator on a fast laptop hides problems. Test on an older, cheaper phone. Use the platform tools: **Instruments** in Xcode, the **Android Studio Profiler**, and the frame and start-up reports that the app stores collect from real users.

> **Rule of thumb.** Find the slowest real device among your users, and make it the device you test on.

## Remember

- Each frame has about 16 ms (or 8 ms). Keep slow work off the main thread.
- Show the first screen quickly with cached data, and load the rest later.
- Decode images at their shown size, or the system ends the app.
- Batch network use, avoid polling, and measure on real, older devices.

::quiz
? A list stutters when scrolling. What is the likely cause?
+ Work on the main thread for each row, such as decoding large images
- The screen refreshes too often
- The list has too few rows
! Each frame must be ready in about 16 ms. Slow work on the UI thread makes frames miss.
? An app is ended by the system while showing a photo gallery. Why might that be?
+ It decodes full-size photos into memory, using hundreds of megabytes
- It uses too little memory
- The gallery has no network
! Decoded images are large. Load them at the size shown on screen.
::end
