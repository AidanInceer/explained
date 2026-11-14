---
minutes: 8
tech: []
refs:
  - seag: Ch. 9, “Code Review”
---
In **code review**, a colleague reads a change before it is merged. It finds bugs, yes, but its main value is wider: two people understand each piece of code, knowledge spreads through the team, and the codebase stays consistent. It is also a conversation between people, so how you say things matters as much as what you say.

## What to look for

With formatting and simple mistakes left to [linters, formatters and types](/lesson/code-quality), a reviewer can focus on what only a person can judge:

1. **Correctness.** Does it do what the description says? What about empty inputs, errors, two users at once?
2. **Design.** Is this the right place for the change? Will it be easy to change next year? Does it add a dependency that is not needed?
3. **Tests.** Do tests cover the new behaviour and the edges? Would they fail if the code were wrong?
4. **Readability.** Will the next reader understand it without the author? Are names clear?
5. **Security and data.** Is user input checked? Is access controlled? Could this leak personal data or a secret?

Read the description first, then the tests, then the code. The tests tell you what the author thinks the code does.

## How to comment

- **Be specific.** "This may divide by zero when the basket is empty" helps. "This looks wrong" does not.
- **Ask, when you are unsure.** "What happens if the API times out here?" invites a fix without accusing.
- **Say how important each comment is.** Mark small preferences as optional ("Nit:"), so the author knows what must change and what may.
- **Comment on the code, not the person.** "This function does three things" not "You always write huge functions".
- **Say what is good**, too. It shows what to keep doing.

## How to be reviewed

- Keep changes small, with a clear description of what and why, as in [Branches, merges and pull requests](/lesson/branches-merges).
- Review your own diff first. You will catch the obvious things.
- Do not take comments as personal. They are about the code.
- If you disagree, explain why, and be willing to be persuaded. If a discussion goes on and on, talk in person.

## Speed matters

A review that waits two days blocks the author, who starts something else, and the change grows stale. Many teams aim to give a first response within a working day. Small changes make fast reviews possible.

> **Rule of thumb.** The goal of a review is a better codebase, not a perfect change. Approve when the change makes things better, even if it is not how you would have written it.

## Remember

- Review finds bugs, spreads knowledge and keeps code consistent.
- Look at correctness, design, tests, readability and security. Leave style to tools.
- Be specific, ask questions, mark the importance of each comment, and be kind.
- Keep changes small and reviews fast. Approve changes that improve the code.

::quiz
? A reviewer writes "this is confusing". How could the comment be more useful?
+ Say what is confusing and suggest a fix, such as a clearer name or a split
- Make it shorter
- Add "please"
! Specific comments can be acted on. Vague ones start long discussions.
? A pull request is correct and tested, but uses a style you would not choose. What should you do?
+ Approve it, and add any preference as an optional comment
- Block it until it matches your style
- Rewrite it yourself
! Review aims for better code, not your code. Mark preferences as optional.
::end
