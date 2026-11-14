---
minutes: 8
tech: []
refs:
  - pragprog: Topic 24, “Dead Programs Tell No Lies”, and Topic 25, “Assertive Programming”
  - aposd: Ch. 10, “Define Errors Out Of Existence”
---
Files go missing, networks fail, users type letters where numbers belong. A program that only works when everything goes right does not work. How a program notices failure, and what it does next, is as much a part of its design as the normal path.

## Two kinds of failure

- **Expected failures** come from the world: the file is not there, the server does not answer, the input is wrong. These will happen, so the program must handle them.
- **Bugs** are mistakes in the code: a value that should never be negative is negative. These should stop the program loudly, so that someone fixes them.

Mixing these up causes trouble. A program that hides a bug carries on with wrong data. A program that crashes on a missing file annoys every user.

## Exceptions

Most languages report failure with an **exception**: an object that describes what went wrong. When code **raises** (or throws) an exception, normal execution stops, and the exception travels up through the callers until some code **catches** it:

```python
try:
    settings = read_settings("app.toml")
except FileNotFoundError:
    settings = DEFAULT_SETTINGS
```

If nothing catches it, the program stops and prints the exception and a **stack trace**: the list of calls that led to it. That trace is the first thing to read when you debug.

## Where to catch

Catch an exception only where you can do something useful about it:

- Use a default, as above.
- Retry a network call that failed for a moment.
- Show the user a clear message, and log the details.

Do not catch an exception just to make it go away:

```python
try:
    charge(card, amount)
except Exception:
    pass   # never do this
```

Now a failed payment looks like a successful one. The customer gets the goods and nobody gets paid, and no log says why.

> **Rule of thumb.** Crash early. A program that stops at the first sign of a bug is easy to fix. A program that carries on with bad data damages more data, and the cause is far away from where it shows.

## Errors as values

Some languages, such as Go and Rust, return errors as normal values instead of exceptions. A function returns either a result or an error, and the caller must look at it. It is more typing, and it makes every place that can fail visible in the code. The ideas are the same: handle expected failures, and stop on bugs.

## Make errors impossible

The best error is one that cannot happen. Design so that wrong states cannot exist:

- Delete a file that is already gone: treat it as success, because the goal was "the file does not exist".
- Take a date as a date type, not as text, so there is no bad format to check.

## Messages that help

A good error message says what failed, with which value, and what to do. "Error 37" helps nobody. "Cannot read settings file /etc/app.toml: file not found. Create it, or set APP_SETTINGS" saves an hour.

## Remember

- Handle expected failures from the world. Let bugs stop the program loudly.
- Catch an exception only where you can do something useful with it.
- Never catch everything and ignore it.
- Design so that some errors cannot happen. Write messages that say what to do.

::quiz
? A function catches every exception, logs nothing and returns an empty list. What is the risk?
+ Real failures, such as a database outage, look like "no results", and nobody finds out
- The function becomes slower
- Python does not allow this
! Swallowing exceptions hides failures. Callers cannot tell "no data" from "broken".
? A network call fails once in a thousand times for a second. Where is a good place to handle it?
+ Around the call, with a short retry
- At the top of the program, by restarting it
- Nowhere: let the user see the error every time
! A short, temporary failure close to the call can be retried there, where the code knows what it was doing.
::end
