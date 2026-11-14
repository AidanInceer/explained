---
minutes: 9
tech: []
refs:
  - mdn: “Introduction to client-side frameworks”, and “Framework main features”
---
A small page can change the DOM by hand. A large app cannot: every click may change ten places on the screen, and keeping them all correct by hand produces bugs where the screen and the data disagree. **Front-end frameworks**, such as React, Vue, Svelte and Angular, solve this with one idea: the screen is a function of the data.

## The problem

Imagine a shop page. When the user adds an item:

- the basket count in the header changes,
- the item's button changes to "In basket",
- the total at the side changes,
- a message appears.

With hand-written DOM code, each change is a separate instruction. Forget one and the screen lies. Add a second way to add items, and you must remember all four again.

## The idea: describe, do not instruct

With a framework, you write what the screen **should look like** for the current data. You do not write the steps to get there.

```jsx
function BasketCount({ items }) {
  return <span>{items.length} items</span>
}
```

When `items` changes, the framework calls the function again, compares the new result with what is on screen, and changes only the parts that differ. You never write "now update the count". The count is always correct, because it is always computed from the data.

## Components

The page is built from **components**: small pieces that each take some inputs (**props**) and return part of the screen. A `ProductCard` uses a `Price` and an `AddButton`. Components can be reused, tested on their own, and understood one at a time, like [functions](/lesson/functions).

## State

**State** is the data that can change while the app runs: the basket, the text in a search box, whether a menu is open. When state changes, the components that use it redraw.

The main design question is *where* each piece of state lives:

- **Local state**: only one component needs it, such as whether a menu is open. Keep it there.
- **Shared state**: several components need it, such as the basket. Move it up to a common parent, or into a **store** that any component can read.
- **Server state**: data that lives on the server, such as products. Fetch it, cache it, and refresh it; libraries exist for exactly this.

> **Rule of thumb.** Keep state as low as possible and in one place. Never keep two copies of the same fact, such as the basket in a store and a separate count: they will disagree. Compute the count from the basket.

This is the same lesson as [State and change](/lesson/state), applied to screens.

## What frameworks cost

- **Download size.** The framework's code is sent to every user and must run before the page works. On a slow phone, this is seconds.
- **Complexity.** Build tools, a component model, rules to learn.
- **Not always needed.** A mostly static page, such as a blog or documentation, works well with plain HTML, or with a framework that renders on the server. The next lesson, [Server, client or static rendering](/lesson/rendering), covers that choice.

## Remember

- A framework draws the screen from the data, and updates only what changed.
- Components are small, reusable pieces of the screen, with inputs called props.
- Decide where each piece of state lives. Keep one copy of each fact.
- Frameworks cost download size and complexity. Use one when the page is really an app.

::quiz
? An app shows the basket count in the header and in the side panel, and they sometimes disagree. What is the likely cause?
+ The count is stored in two places, and one update misses one of them
- The framework is too slow
- The DOM cannot show numbers
! Two copies of one fact drift apart. Keep the basket once and compute the counts from it.
? What does a framework do when a component's data changes?
- Reloads the whole page
+ Computes the new output and changes only the parts of the DOM that differ
- Nothing until the user clicks
! It compares the new description with the current screen and makes the smallest set of changes.
::end
