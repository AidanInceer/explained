---
minutes: 9
tech: []
refs:
  - owasp: A05, “Injection”, and A01, “Broken Access Control”
  - mdn: “Cross-site scripting (XSS)”, “Cross-site request forgery (CSRF)”, and “Content Security Policy”
---
Most attacks on web applications use a handful of well-known techniques. They work because the same mistakes are made again and again. Each one has a standard defence that frameworks now give you by default, if you do not work around them. Know the attacks so that you recognise when your code steps outside those defences.

## Injection

**Injection** happens when user input becomes part of a command: SQL, a shell command, a template. The classic is SQL injection:

```python
# Wrong: the input becomes part of the SQL
db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

An email of `' OR '1'='1` changes the meaning of the query and returns every user. Worse inputs can delete tables.

The defence is **parameterised queries**: send the SQL and the values separately, so a value can never become code.

```python
db.execute("SELECT * FROM users WHERE email = %s", (email,))
```

The same rule applies to shell commands: pass arguments as a list, never build a command string from input.

## Cross-site scripting (XSS)

**XSS** is injection into a web page. User input, such as a comment or a name, is placed into HTML, and it contains a script. The script runs in other users' browsers, as your site, and can read their data or act as them, as [Cookies, CORS and the same-origin rule](/lesson/browser-security) explained.

Defences:

- **Escape output**: insert user content as text, never as HTML. Modern frameworks do this by default; features named like `dangerouslySetInnerHTML` or `v-html` turn it off.
- If you must allow some HTML, such as in a rich text editor, pass it through a well-maintained **sanitiser**.
- A **Content Security Policy** header limits where scripts may come from, so an injected script fails to run.

## Cross-site request forgery (CSRF)

A hostile page makes the user's browser send a request to your site, for example a form that posts "transfer £500". The browser attaches the user's cookies, so your server sees a signed-in user.

Defences: `SameSite` cookies, which most browsers now apply by default; **CSRF tokens**, a secret value in each form that a hostile page cannot know; and never changing anything on a `GET`, as in [HTTP](/lesson/http).

## Broken access control

Not a trick, but the most common serious flaw: the server does not check that the user may access *this* object. Change `/invoices/100` to `/invoices/101` and see someone else's invoice. The defence is the authorisation check in [Authentication and authorisation](/lesson/auth), on every request.

## Others to know

- **Server-side request forgery (SSRF)**: your server fetches a URL that the user gives, and the attacker gives an internal address, such as the cloud metadata service. Allow only expected destinations.
- **Unsafe file uploads**: check file types and sizes, store uploads outside the web root, and never run them.
- **Mass assignment**: the server copies every field from a request into an object, including `is_admin`. Accept only the fields you expect.

> **Rule of thumb.** Every place where data turns into code, a query, HTML, a command, a file path, a URL to fetch, is a place to check twice.

## Remember

- Injection: never build commands from input. Use parameterised queries.
- XSS: insert user content as text. Add a Content Security Policy.
- CSRF: SameSite cookies, CSRF tokens, and no changes on GET.
- Check access to each object on the server. Watch every place data becomes code.

::quiz
? Code builds SQL by joining strings with a user's search text. What is the fix?
+ Use a parameterised query, so the text is sent as a value
- Remove quotes from the input
- Limit the input to 20 characters
! Filtering input is easy to get wrong. Parameters keep values and code apart completely.
? A comment containing `<script>` runs in other users' browsers. What kind of attack is this?
+ Cross-site scripting
- SQL injection
- CSRF
! User content was inserted as HTML. Escape it, and add a Content Security Policy.
::end
