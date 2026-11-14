---
minutes: 8
tech: []
refs:
  - appledev: SwiftUI, and Human Interface Guidelines, “Designing for iOS”
  - androiddev: Guide to app architecture
  - webdev: “Progressive Web Apps”
---
A team wants an app on phones. There are three main ways to build it: a **native** app for each platform, one **cross-platform** app that runs on both, or a **web app** that runs in the browser. Each choice decides how many codebases you keep, how the app feels, and what it can do.

## Native apps

A native app is written with each platform's own tools: Swift and SwiftUI for iPhone, Kotlin and Jetpack Compose for Android.

- **Best feel and speed.** Controls, gestures and animations behave exactly as users expect on that platform.
- **Full access** to every device feature on the day it is released: camera, sensors, widgets, health data.
- **Two codebases** and often two teams. Every feature is built twice, and the two drift apart.

## Cross-platform apps

One codebase produces apps for both platforms. Common choices are **React Native** (JavaScript or TypeScript), **Flutter** (Dart), and **Kotlin Multiplatform** (shares logic, often with native screens).

- **One codebase** for most of the work, so a small team can ship to both stores.
- **Near-native feel** for most apps. Flutter draws its own controls; React Native uses the platform's controls.
- **A layer in between.** New platform features need a plug-in. Some bugs live in the framework, not your code. Very demanding apps, such as games or camera tools, may hit limits.

## Web apps

A web app runs in the browser. A **progressive web app** (PWA) can also be added to the home screen, work offline and, on most platforms, send notifications.

- **No app store**, no review, instant updates, one codebase for phones and computers.
- **Found by search and links.**
- **Less access** to device features, especially on iPhone, and less of the feel of an installed app. Users also tend to expect an app from a store.

## How a small team chooses

| Question | Points to |
|---|---|
| Is it mostly forms, lists and content? | Cross-platform or web |
| Does it need the newest device features, or heavy graphics? | Native |
| Is the team small, with web skills? | Web, or React Native |
| Must it be found through search or shared by link? | Web |
| Does it need to work fully offline? | Native or cross-platform |

> **Rule of thumb.** Do not choose by fashion. Choose by what the first version must do, and the team that will maintain it in two years. A good web app often comes first, and an installed app later, when users ask for it.

## The parts that do not change

Whatever you choose, the hard parts are the same: where the data lives, how it syncs with the server, what happens with no network, and how you release safely. The rest of this line covers those, starting with [Screens, navigation and app state](/lesson/ui-state).

## Remember

- Native: the best feel and access, and two codebases.
- Cross-platform: one codebase, near-native feel, a framework layer in between.
- Web and PWAs: no store, instant updates, less device access.
- Choose by what the app must do and who will maintain it.

::quiz
? A two-person team needs a booking app on iPhone and Android, with forms and lists. What is a sensible first choice?
+ A cross-platform framework, or a web app
- Two native apps, one per platform
- A desktop app
! One codebase suits a small team, and booking screens need no special device features.
? An app must use a new camera feature released this month. What fits best?
+ Native, which gets new platform features first
- A web app
- Any choice works the same
! Cross-platform and web layers often add support for new features later than the native tools.
::end
