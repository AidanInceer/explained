---
minutes: 8
tech: []
refs:
  - androiddev: “Background work”, WorkManager, and “Firebase Cloud Messaging”
  - appledev: “BackgroundTasks”, and “User Notifications”
---
On a computer, a program can run in the background as long as it likes. On a phone it cannot. Battery life is the operating system's first concern, so iOS and Android limit strictly what an app may do when the user is not looking at it. An app that ignores this has its work stopped, or is killed.

## Why the limits exist

Every app that wakes the CPU or the radio uses battery. One app that checks a server every minute could halve a phone's battery life. So the systems:

- **Suspend** apps soon after they leave the screen.
- **Batch** background work from many apps together, at times the system chooses.
- **Defer** work until the phone is charging or on Wi-Fi, if the app allows it.

## Asking to run later

You do not start a background thread and hope. You ask the system to run work for you:

- On Android, **WorkManager** runs a job with conditions, such as "needs network" or "only while charging", and retries it if it fails. It survives app restarts and phone reboots.
- On iOS, the **BackgroundTasks** framework lets you ask for a short refresh, or a longer task while the phone is idle and charging. The system decides when, and may not run it at all if the user rarely opens the app.

Design work that is fine to run late, or not at all. Background work is a bonus that keeps data fresh, not a guarantee.

## Finishing a task

When the user leaves the app in the middle of something, such as an upload, both systems let you ask for a little more time to finish it. For long transfers, use the system's background download and upload services, which continue even when your app is suspended.

## Push notifications

To tell an app that something happened on the server, do not poll. The server sends a **push notification** through Apple's push service (APNs) or Google's Firebase Cloud Messaging (FCM). The phone keeps one connection to these services for all apps, which is far cheaper than each app keeping its own.

- A **visible** notification shows a message to the user, even if the app is not running.
- A **silent** notification can wake the app briefly to fetch new data, but the systems limit how often, and do not promise delivery.

## Notifications and respect

Users must give permission for notifications, and they remove apps that abuse it.

- Ask for permission when the user can see why, such as after they place an order, not at first launch.
- Send only what the user would want to know. Let them choose categories.
- Never send marketing as if it were important.

> **Pitfall.** Push delivery is not guaranteed and not ordered. Treat a notification as a hint to fetch the latest data from the server, not as the data itself.

## Remember

- Phones limit background work to save battery. Apps are suspended soon after they leave the screen.
- Ask the system to schedule work (WorkManager, BackgroundTasks), and accept that it may run late.
- Use push notifications instead of polling. They are not guaranteed.
- Ask for notification permission when the reason is clear, and send little.

::quiz
? An app checks the server for new messages every minute, in the background. What happens on a modern phone?
+ The system suspends the app and stops the checks; use push notifications instead
- It works, and the battery is fine
- The server blocks the app
! Background polling drains the battery, so the systems stop it. Push lets the server notify the phone through one shared connection.
? A silent push should trigger a sync, but sometimes nothing happens. Why?
+ The system limits and may delay or drop silent pushes
- Silent pushes are only for iPads
- The app must be on screen
! Background pushes are best effort. The app must also sync when it opens.
::end
