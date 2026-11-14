---
minutes: 8
tech: []
refs:
  - mythical: Ch. 2, “The Mythical Man-Month”
  - pragprog: Topic 15, “Estimating”
---
"How long will it take?" is one of the hardest questions in software, and one of the most often asked. The work is new each time, and much of it is unknown until you start. You cannot make estimates exact. You can make them honest, make the work small enough to estimate, and plan so that surprises do not sink the project.

## Why estimates go wrong

- **Unknowns.** You estimate the parts you can see. The parts you cannot see, such as the odd data in production or the library that does not do what its docs say, come later.
- **Optimism.** People estimate the time if everything goes well. It rarely does.
- **Forgotten work.** Tests, review, deploy, documentation, the meetings in between.
- **Adding people late.** Fred Brooks observed in 1975 that adding people to a late project makes it later: newcomers need training, and more people need more coordination. It still holds.

## Make the work small

The best way to improve estimates is to estimate smaller things:

- Break a feature into pieces of a day or two, each of which delivers something that can be shown or tested.
- Do the riskiest piece first. If the unknown part turns out hard, you learn it in week one, not week six.
- A piece you cannot break down is a sign that you do not yet understand it. Spend a short, fixed time exploring it first: a **spike**.

## Give ranges, not points

"Three weeks" will be heard as a promise. "Two to five weeks, most likely three, and the uncertain part is the payment integration" is honest and useful. It tells people what drives the risk, and when you will know more.

Update the estimate as you learn. An estimate that never changes was not being looked at.

## Fix the date or the scope

Time, scope and quality pull against each other. When a date cannot move, such as a legal deadline or a conference, cut scope, not quality. Agree early what the **smallest useful version** is, build that first, and add the rest in priority order. Then when the date arrives, whatever you have is the most valuable part, and it works.

## Saying no

Every yes to a new request is a quiet no to something else. A good engineer makes the trade-off visible: "We can add the export this sprint if the search improvements move to next month. Which matters more?" This is not refusing to help. It is helping the people who decide to decide well.

> **Rule of thumb.** When you are asked for an estimate on the spot, say when you will have one: "Let me look at the code and get back to you this afternoon." A considered estimate in four hours beats a guess now that becomes a deadline.

## Remember

- Estimates fail through unknowns, optimism and forgotten work.
- Break work into small pieces and do the riskiest first.
- Give ranges with the reason for the uncertainty, and update them.
- When the date is fixed, cut scope, not quality. Make trade-offs visible.

::quiz
? A project is late. A manager proposes adding four new developers for the final month. What is the likely effect?
+ It gets later, because the newcomers need training and add coordination
- It finishes on time
- It finishes early
! Brooks's law: adding people to a late project makes it later, at least in the short run.
? A feature must be ready for a fixed launch date, and it will not all fit. What should you cut?
+ Scope: build the smallest useful version first, then add in order of value
- Testing
- Code review
! Cutting quality creates failures at the worst time. Cutting scope keeps what ships working.
::end
