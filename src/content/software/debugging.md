---
minutes: 9
tech: []
refs:
  - pragprog: Topic 20, “Debugging”
  - missing: Lecture 7, “Debugging and Profiling”
---
A bug is a difference between what the program does and what you expected. Finding the cause can take a minute or a week. The difference is rarely talent. It is method: people who debug well follow the same steps every time, and do not guess.

## 1. Reproduce it

You cannot fix what you cannot see. First, make the bug happen on purpose:

- What exact input, steps, data or settings cause it?
- Does it happen every time, or only sometimes?
- Does it happen on your machine, or only in production?

The goal is the shortest, fastest way to make it happen. Ideally a test that fails. Then you can try ideas in seconds, and the test proves the fix later.

> **Pitfall.** "I could not reproduce it" is not "it is fixed". Bugs that appear only sometimes usually depend on timing, data or the environment. Look at what differs where it fails.

## 2. Read the evidence

Read the error message and the **stack trace** to the end. The trace lists the chain of calls that led to the failure: the last line of your own code in it is usually the best place to start. Read the logs around the time of the failure. Many bugs are explained in a message that nobody read slowly.

## 3. Narrow it down

Cut the search space in half, again and again:

- Which part of the input causes it? Remove half and try again.
- Which commit introduced it? `git bisect` checks out the commit half way between a good and a bad one, you test, and it halves again. Among 1,000 commits it finds the culprit in about 10 tests.
- Which line? Check the values in the middle of the code path. Are they already wrong there? Then the cause is earlier.

## 4. Look inside

Two tools show you what the program really does:

- **Print statements or logs**: write out values at key points. Simple, and they work everywhere, including servers.
- **A debugger**: stop the program at a **breakpoint**, look at every variable, and step one line at a time. Most editors have one built in, as [Editors and IDEs](/lesson/editors) mentioned.

Compare what you see with what you expected, line by line. The bug is at the first line where they differ.

## 5. Find the cause, not the symptom

The value is wrong at line 80. *Why* is it wrong? A patch at line 80 that hides the wrong value leaves the real cause to break something else. Ask "why?" until you reach the decision or assumption that was wrong.

## 6. Fix, then prove it

- Write a test that fails because of the bug.
- Fix the code. The test passes.
- Keep the test, so the bug cannot come back unnoticed.

## Habits that help

- **Change one thing at a time.** Change three and you will not know which one mattered.
- **Write down what you tried.** After an hour, memory fails.
- **Explain it out loud**, to a colleague or to a rubber duck. Saying each step often reveals the wrong assumption.
- **Doubt your certainty.** "That part cannot be wrong" is where many bugs hide.

## Remember

- Reproduce first, ideally as a failing test.
- Read the whole error, the stack trace and the logs.
- Halve the search space: the input, the commits, the code path.
- Fix the cause, keep a test, change one thing at a time.

::quiz
? A bug appeared some time in the last 500 commits. What is the fastest way to find which commit caused it?
+ `git bisect`, which halves the range at each test
- Read all 500 commits
- Revert every commit and add them back one by one
! Halving 500 commits needs about 9 tests to find the first bad one.
? A value is wrong at line 80, and you set it to the right value there. What is the risk?
+ The real cause, earlier in the code, is still there and can break something else
- None: the output is now correct
- The program will run more slowly
! Patching the symptom hides the cause. Ask why the value was wrong and fix that.
::end
