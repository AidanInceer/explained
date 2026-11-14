---
minutes: 9
tech: []
refs:
  - mdn: “Structuring content with HTML”, “CSS styling basics”, and “Introduction to the DOM”
---
A web page is built from three layers. **HTML** says what the content is. **CSS** says how it looks. **JavaScript** says how it behaves. The browser joins them in one tree, the **DOM**, which scripts can read and change. Keeping these layers apart is what makes pages easy to change, fast and accessible.

## HTML: what the content is

HTML marks up text with **elements**, written as tags:

```html
<article>
  <h1>Green tea</h1>
  <p>Light and fresh. <strong>In stock.</strong></p>
  <button type="button">Add to basket</button>
</article>
```

Each element says what its content *is*: a heading, a paragraph, a button, a list, a form field. This is **semantic HTML**, and it matters because many readers are not looking at the page:

- A screen reader announces "heading level 1" and "button", so a blind user can move through the page.
- A search engine knows what the page is about.
- The browser gives a real `<button>` keyboard support for free. A `<div>` styled to look like a button has none.

## CSS: how it looks

CSS gives styles to elements through **selectors**:

```css
h1 { font-size: 2rem; }
.price { color: #2456d6; }
button:hover { background: #eee; }
```

The **cascade** decides which rule wins when several match: more specific selectors win over general ones, and later rules win over earlier ones of the same specificity. Many surprising styles come from a rule elsewhere that is more specific.

## Layout

Every element is a **box**: content, padding, border and margin. Modern CSS places boxes with two systems:

- **Flexbox** arranges items in one direction, a row or a column, and shares out the space.
- **Grid** arranges items in rows and columns at once.

**Media queries** change the layout by screen size, so the same page works on a phone and a large monitor. This is **responsive design**.

## The DOM

The browser turns the HTML into the **Document Object Model**: a tree of element objects, as in [Trees and graphs](/lesson/trees-graphs). The page you see is drawn from this tree, not from the original HTML.

JavaScript can find elements in the tree and change them:

```javascript
document.querySelector('.price').textContent = '£4.50'
```

The browser then works out the layout again and repaints. Every interactive page works this way.

> **Pitfall.** Changing the DOM is slow compared with ordinary code, because each change can make the browser do layout again. Make changes in batches, or let a framework do it, as the lesson on front-end frameworks explains.

## Keep the layers apart

Structure in HTML, look in CSS, behaviour in JavaScript. When each layer does its own job:

- A designer can change the look without touching the structure.
- The page still shows its content if a script fails to load.
- Accessibility, the subject of a later lesson on this line, mostly comes from good HTML.

## Remember

- HTML says what content is. Use the element that matches the meaning.
- CSS styles elements through selectors. The cascade decides which rule wins.
- Flexbox and grid do layout. Media queries adapt it to the screen.
- The DOM is the live tree of the page. JavaScript changes it, and the browser redraws.

::quiz
? A clickable `<div>` looks like a button. What does it lack compared with a `<button>`?
+ Keyboard focus and activation, and being announced as a button by screen readers
- Nothing, if it has the right CSS
- The ability to change colour
! A real button comes with keyboard and assistive support. A styled div has to have all of that added by hand.
? Two CSS rules give a heading different colours. Which usually wins?
- The first one in the file
+ The more specific selector, or the later one if equally specific
- The one with the darker colour
! The cascade ranks rules by specificity, then by order.
::end
