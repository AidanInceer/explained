---
minutes: 8
tech: []
refs:
  - wcag: Principles “Perceivable, Operable, Understandable, Robust”, and Success Criteria 1.4.3, 2.1.1 and 4.1.2
  - mdn: “Accessibility”, in Learn web development
---
Many people use the web in ways you may not expect: with a keyboard and no mouse, with a screen reader that speaks the page, with the text enlarged to twice its size, with colour blindness, or with one hand on a phone in bright sun. **Accessibility** means building so that all of them can use what you make. It is far cheaper to build in from the start than to add at the end.

## Who it helps

About one in six people worldwide has a significant disability, by the World Health Organization's estimate. Many more have a temporary or situational one: a broken arm, a noisy train, a screen in sunlight. Captions, keyboard shortcuts and good contrast help everyone.

Accessibility is also a legal requirement in many places for public services and large companies. The common standard is **WCAG**, the Web Content Accessibility Guidelines. Most laws refer to its level AA.

## Use the right HTML

As [HTML, CSS and the DOM](/lesson/html-css) showed, the right element brings accessibility for free:

- `<button>` can be focused and pressed with the keyboard, and a screen reader announces it as a button.
- `<label for="email">` joins a label to its field, so a screen reader reads the label and a tap on the label focuses the field.
- Headings `<h1>` to `<h6>`, in order, let screen reader users jump through the page as sighted users skim.
- `<nav>`, `<main>` and `<footer>` mark the regions of the page.

> **Rule of thumb.** No ARIA is better than bad ARIA. ARIA attributes can describe custom controls to assistive technology, but they only describe. They add no keyboard behaviour. Use a real HTML element first.

## Keyboard

Everything that works with a mouse must work with a keyboard. Press Tab through your page:

- Can you reach every link, button and field?
- Can you see where the focus is? Never remove the focus outline without a clear replacement.
- Is the order logical?
- Can you close a dialog with Escape, and does the focus return to where it was?

## Text alternatives

A screen reader cannot see images. Give each meaningful image an `alt` text that says what it shows or does: `alt="Graph: sales doubled from March to June"`. A decorative image gets `alt=""`, so it is skipped. Videos need captions; audio needs a transcript.

## Colour and contrast

- Text needs enough **contrast** with its background. WCAG level AA asks for a ratio of at least 4.5 to 1 for normal text.
- Never use colour alone to carry meaning. A form field with an error needs a message or an icon, not only a red border, because about one in twelve men has some form of colour blindness.

## Test it

- Use the keyboard only, for ten minutes.
- Turn on a screen reader: VoiceOver on macOS and iOS, NVDA on Windows, TalkBack on Android.
- Zoom the page to 200% and check that nothing is cut off.
- Run an automated checker, such as the one built into browser developer tools. It finds only part of the problems, often well under half; the rest need a person.

## Remember

- Accessibility helps disabled people, and everyone in a difficult situation.
- Correct HTML elements give most of it for free.
- Everything must work with a keyboard, with visible focus.
- Give text alternatives, enough contrast, and meaning that is not only colour.

::quiz
? A form shows errors only by turning the field border red. Who is left out?
+ People with colour blindness, and screen reader users
- Nobody, red is clear to everyone
- Only users on phones
! Colour alone does not reach everyone. Add a text message that names the error and is linked to the field.
? A designer removes the focus outline because it looks untidy. What is the effect?
- None
+ Keyboard users cannot see which element is focused
- Screen readers stop working
! Without a visible focus indicator, keyboard users are lost on the page. Style it, do not remove it.
::end
