---
minutes: 7
tech: []
refs:
  - seag: Ch. 10, “Documentation”
  - pragprog: Topic 7, “Communicate!”
---
Engineers write all day: commit messages, pull request descriptions, bug reports, chat messages, design documents, replies to customers. Much of the work of a team happens in writing, often across time zones. Clear writing saves everyone time, and it is one of the most noticed skills in an engineer.

## Lead with the point

Readers are busy. Put the most important thing first:

- "The deploy failed because the database migration timed out. I rolled back; users are not affected. Fix in progress."
- not three paragraphs of background before the reader learns whether anything is wrong.

Then add the details that someone who wants them can read.

## Know who is reading

Write for the reader, not for yourself. A message to your team can use project words. A message to support, a customer or another department needs plain words and no internal names. Ask: what do they already know, and what do they need to do after reading?

## Short sentences, concrete words

- One idea per sentence.
- Concrete beats vague: "The export takes 40 seconds for 10,000 rows" beats "the export is slow".
- Prefer common words. Many colleagues read in their second or third language.
- Cut words that add nothing: "in order to" is "to"; "at this point in time" is "now".

## Common kinds of writing

**Commit messages**: a short first line saying what the change does, then why, as in [Version control with Git](/lesson/git).

**Bug reports**: what you did, what you expected, what happened instead, and how to reproduce it. Include versions, screenshots and logs. A good bug report halves the time to fix it, as [Debugging as a method](/lesson/debugging) suggests.

**Asking for help**: what you are trying to do, what you tried, and the exact error. Not "it does not work". People can help much faster when they do not have to ask three questions first.

**Status updates**: what is done, what is next, and what is blocked or at risk. Bad news early, with a plan.

**Design documents and decision records**: the problem, the options, the choice and its costs, as in [Docs and decision records](/lesson/decision-records).

> **Rule of thumb.** Read it once as the person who receives it, before you send it. If they would have to ask a question to act on it, answer that question now.

## Remember

- Put the main point first, then the details.
- Write for your reader: what they know, what they must do.
- Use short sentences, concrete facts and common words.
- Bug reports and requests for help need steps, expected and actual results, and exact errors.

::quiz
? Which bug report is most useful?
+ "On the order page, selecting Export with 10,000 rows gives a 504 error after 30 seconds. Expected a CSV. Steps and logs attached."
- "Export is broken, please fix."
- "Something is wrong with orders."
! Specific steps, the expected and actual results, and evidence let someone reproduce the bug at once.
? You must tell a manager that a launch will slip. What should come first in the message?
+ That it will slip, by how long, and the plan
- A full history of the project
- An apology for every past delay
! Lead with the point and what happens next. Details can follow for those who want them.
::end
