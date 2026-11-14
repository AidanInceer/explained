---
minutes: 8
tech: []
refs:
  - debtquadrant: Whole essay
  - refactoring: Ch. 2, “Principles in Refactoring”, section “Why Should We Refactor?”
  - pragprog: Topic 3, “Software Entropy”
---
To ship sooner, a team sometimes takes a shortcut: a copy instead of a shared function, a hard-coded value, a missing test. Like borrowing money, this can be a good decision. But it has **interest**: every later change in that area costs a little more, until the team spends more time working around old shortcuts than building new things. This is **technical debt**.

## Kinds of debt

Not all debt is the same. Martin Fowler divides it in two directions:

- **Deliberate or inadvertent**: did the team choose the shortcut, or not realise it was taking one?
- **Prudent or reckless**: was it a sensible trade-off, or careless?

Examples:

- **Prudent and deliberate**: "We must ship before the trade show. We will hard-code the two currencies now and add the proper system next month." Fine, if next month really comes.
- **Reckless and deliberate**: "We do not have time for tests." It usually costs more time within weeks.
- **Prudent and inadvertent**: "Now that we have built it, we understand how it should have been designed." Normal; you learn as you build.
- **Reckless and inadvertent**: the team did not know better. This is fixed by learning and review, not by time.

## How it shows

- Simple changes take surprisingly long.
- The same kind of bug keeps coming back.
- People avoid touching certain files.
- New team members take months to become productive.
- Estimates in one area are always wrong.

## Paying it down

- **Boy scout rule**: leave code a little better than you found it. Rename, extract, add a test while you are there. Small and constant, as in [Refactoring safely](/lesson/refactoring).
- **Pay where you work.** Debt in code nobody changes costs nothing. Focus on areas that change often.
- **Make it visible.** Record known debt as issues, with what it costs: "every new payment method takes a week instead of a day because of X".
- **Budget for it.** Many teams spend a steady share of each sprint, such as 15 to 20%, on improvements, rather than waiting for a "clean-up quarter" that never comes.

## Talking about it

"We need to refactor" rarely wins against a new feature. Speak in the language of the business:

- "Adding a new country takes three weeks. With two weeks of work on the tax module, it would take three days."
- "Half of last month's incidents came from the old import code."

> **Rule of thumb.** Take on debt on purpose, write it down, and plan when to repay it. Debt that nobody knows about is the dangerous kind.

## Remember

- Technical debt is a shortcut that makes later changes cost more.
- It can be deliberate or not, prudent or reckless. Prudent, deliberate debt can be a good decision.
- Pay it down where you work, steadily, and leave code better than you found it.
- Explain debt in terms of time, risk and money.

::quiz
? A module has messy code, but nobody has changed it in three years and it works. Should it be a priority to clean up?
+ No: debt in code that does not change costs little. Focus on areas that change often
- Yes: all messy code must be fixed first
- Yes, by rewriting it from scratch
! Debt's interest is paid when you change the code. Untouched code rarely needs urgent work.
? How should you argue for time to fix debt?
+ Show its cost in time, incidents or risk, and what fixing it would save
- Say the code is ugly
- Refuse to build features until it is fixed
! Decisions are made on cost and value. Put the debt in those terms.
::end
