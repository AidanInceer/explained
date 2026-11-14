---
minutes: 8
tech: []
refs:
  - pragprog: Topic 25, “Assertive Programming”, and Topic 38, “Programming by Coincidence”
  - seag: Ch. 9, “Code Review”
---
AI assistants can now write functions, explain unfamiliar code, draft tests and suggest fixes. Used well, they make a good engineer faster. Used badly, they produce code that looks right, passes a quick glance, and is wrong in ways that cost days later. The skill is not getting the assistant to write code. It is giving it good context, checking what comes back, and owning the result.

## What they are good at

- **Boilerplate and repetition**: tests in the same shape, data classes, parsing code.
- **Explaining**: "what does this regular expression match?", "what does this function do?".
- **First drafts** of code in a language or library you know less well.
- **Search and summary** across a large codebase, with an agent that can read files.
- **Rubber-ducking**: describing a bug to it often helps you see the cause, as in [Debugging as a method](/lesson/debugging).

## Where they fail

- **Confident mistakes.** An assistant can invent a function that does not exist, use an old version of an API, or handle the common case and miss the edge case, all in fluent, plausible code.
- **Missing context.** It does not know your team's rules, why a strange line exists, or what happened in production last week, unless you tell it.
- **Security.** It may produce code with SQL built from strings, weak checks or secrets in the code, as in [Common web attacks](/lesson/web-attacks).
- **Licences.** Generated code can resemble existing code. Know your company's policy.

## Give good context

The output is only as good as what you give it:

- Say what you want and **why**: the goal, the constraints, the style of the codebase.
- Point it at the relevant files, types and existing examples.
- Ask for small pieces, one at a time, not a whole feature at once.
- For a bug, give the exact error and the steps, as you would for a colleague.

## Check everything

Treat every suggestion as a pull request from a new colleague who is fast, well read, and sometimes wrong:

1. **Read every line.** If you cannot explain what a line does, you cannot ship it.
2. **Run it, and run the tests.** Better still, write the test first and let the assistant make it pass.
3. **Check the edges**: empty inputs, errors, concurrency, permissions.
4. **Check that APIs and functions exist** in the versions you use.

> **Pitfall.** "The AI wrote it" is not a defence in a postmortem. You merged it, so you own it. If you cannot maintain code without the assistant, you do not understand it well enough to ship it.

## Protect data

Do not paste secrets, customer data or confidential code into tools that your organisation has not approved. Know where the text goes and how it is kept.

## Keep learning the craft

Assistants make it easy to skip understanding. Early in your career, use them to explain and to check your own work, not to replace the thinking. The engineers who get the most from them are the ones who could do the work without them.

## Remember

- Assistants are fast at drafts, repetition and explanation, and can be confidently wrong.
- Give them clear goals, context and small tasks.
- Read, run and test every line. Check edge cases and that APIs exist.
- You own what you merge. Keep data safe, and keep building your own understanding.

::quiz
? An assistant suggests code that calls a library function you have never seen. What should you do?
+ Check that the function exists in your version of the library, and test the code
- Merge it: the assistant knows the library
- Ask the assistant if it is sure
! Assistants sometimes invent APIs. Check the documentation and run the code.
? Which request is likely to get the best result?
+ "Add a function that validates UK postcodes, in the style of `validate_email` in `validators.py`, with tests for empty input and lowercase"
- "Write validation"
- "Make the app better"
! Specific goals, examples and edge cases give the assistant the context it needs.
::end
