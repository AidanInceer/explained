---
minutes: 8
tech: []
refs:
  - androiddev: Guide to app architecture, “UI layer” and “Save UI states”
  - appledev: SwiftUI, “Managing user interface state”
---
A user fills in half a form, switches to their messages for a minute, and comes back. On a phone, the system may have closed the app in that minute to save memory. A good app shows the form exactly as it was. A poor one starts again from the home screen. How an app keeps track of **where the user is and what they have done** is the core of app design.

## Screens and navigation

An app is a set of **screens**: a list of orders, one order, a settings page. **Navigation** moves between them. On phones the common shapes are:

- A **stack**: open an order on top of the list, and Back removes it.
- **Tabs**: a few top-level sections, each with its own stack.
- **Modals**: a screen that appears over the others for one task, such as "new message".

The navigation itself is state: which tab, which screens are in each stack. Users expect it to survive interruptions.

## The app's lifecycle

Mobile operating systems control apps tightly:

- An app in the background may be **suspended**: frozen, using no CPU.
- When memory runs low, the system may **end** a suspended app with no warning.
- Rotating the screen or changing the language can rebuild the screen.

So you cannot rely on values in memory lasting. The system gives each app ways to **save and restore** state, and you must use them.

## Kinds of state

Sort each piece of state by how long it must last:

| Kind | Example | Where to keep it |
|---|---|---|
| Momentary | A button is pressed down | In the view; lose it freely |
| Screen state | Text typed in a form, scroll position | Save it so it survives the app being ended |
| App data | The user's orders, settings | A local database or files, and the server |
| Server data | Products, prices | Fetched, cached, refreshed |

## One direction

Most modern app architectures, such as SwiftUI and Jetpack Compose with a ViewModel, follow **unidirectional data flow**:

1. State lives in one place, outside the screen.
2. The screen is drawn from that state.
3. User actions are sent as **events** to the place that owns the state.
4. That owner changes the state, and the screen redraws.

This is the same idea as in [Front-end frameworks and state](/lesson/frameworks) on the web, and as in [State and change](/lesson/state): one owner, changes in one place, the screen as a function of the data.

> **Pitfall.** Do not keep important data only in a screen's memory. Test it: put the app in the background, use other apps for a while (or use the developer setting that ends background apps), and come back.

## Deep links

A link in an email can open a specific screen, such as one order. The app must build the right navigation stack around that screen, so Back makes sense, and must check that the user is signed in. Design navigation so that any important screen can be reached directly.

## Remember

- Navigation, typed text and scroll position are state that users expect to survive.
- The system can suspend and end apps at any time. Save and restore state.
- Keep each kind of state where its lifetime fits.
- Let state flow one way: owner to screen, events back to the owner.

::quiz
? A user's half-written review disappears after they answer a phone call. What is the likely cause?
+ The text was kept only in the screen's memory, and the system ended the app in the background
- The phone call deleted the app
- The server rejected the review
! Background apps can be ended at any time. Save screen state so it can be restored.
? In unidirectional data flow, what does a button tap do?
- Change the screen's drawing directly
+ Send an event to the owner of the state, which updates the state, and the screen redraws
- Reload the app
! State has one owner. The screen only shows it and sends events.
::end
