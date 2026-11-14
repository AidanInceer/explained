Most data projects that fail do not fail for a technical reason. The pipeline works, and the result is not what the person needed. The cause is nearly always the same: the engineer built the *request*, and did not find the *requirement*.

A request is what someone says: “I need a sales dashboard.” A requirement is what must be true for their work to succeed: “Each Monday I move budget between regions, and I need last week’s net sales for each region, in agreement with finance.”

::fig requirements | One request, six questions. Select each question to see how the answer changes the design.

## Who the stakeholders are

A stakeholder is a person who is affected by your work. There are more of them than the person who sent the request.

| Stakeholder | What they want from you | What you need from them |
|---|---|---|
| **Data consumers**: analysts, managers, data scientists | Data they can trust, on time | The decision they make, and what “correct” means |
| **Data producers**: the teams that own source systems | No load on their database, no surprises | Notice before a schema change, and the meaning of each column |
| **Sponsors**: the person who pays | Business value, and a date | Priorities, when two requests conflict |
| **Control functions**: security, legal, finance | Compliance with the rules | Which data is personal, who can see it, how long it is kept |

New engineers speak to the consumer and forget the producer. Then the source team renames a column and the pipeline stops. Talk to the people upstream of you before you build.

## The six questions

Ask these for each request. They are the same questions as in the figure.

1. **What decision or action does this support?** If there is no decision, there is no requirement. This question also finds the true priority.
2. **What is one row?** This is the grain. “Sales” can be an order, an order line, or a payment. Each gives a different total.
3. **How fresh must the data be?** Ask what the person will do differently with data that is one hour old and data that is one day old. “Real-time” usually means “not yesterday”.
4. **How correct must it be?** A marketing trend can be 2% wrong. A number in a regulatory report cannot. Correctness costs time, so do not supply more than is needed.
5. **Who else has this number?** If a second definition exists, agree on one before you build.
6. **What occurs when it is late or wrong?** The answer sets the level of monitoring and decides if a person must be on call.

A useful structure for question 2 is to describe each business event with **who, what, when, where, why, how** and **how many**. “A customer (who) buys a product (what) on a date (when) in a shop (where) with a promotion (why) by card (how): quantity and amount (how many).” The first six become dimensions. The last one becomes the measures of the fact table. You will use this in [dimensional modeling](/lesson/dimensional-modeling).

## Functional and non-functional requirements

| Type | Question it answers | Examples |
|---|---|---|
| Functional | What must the data contain? | Net sales by region and week. Returns subtracted. Test orders excluded |
| Non-functional | How well must it be delivered? | Ready by 08:00. 13 months of history. Finance can see it, sales cannot see salaries |

The non-functional requirements decide the architecture. “Ready by 08:00” gives a daily batch. “Within 5 seconds” gives a streaming system that costs several times more. Get them in writing.

## Write it down, then show something small

Write one page: the decision, the grain, the definitions of each metric, the freshness, the owner, and what is **not** included. Send it to the stakeholder and ask for a correction, not for approval. People find errors in a specific text much more easily than they describe what they want.

Then deliver the smallest useful part in days, not months. One region, one metric, in a plain table. The first reaction to real numbers will give you requirements that no interview could.

> **Pitfall.** “Just give me all the data and I will work it out.” This is a request to delay the requirements, not to remove them. You will load 200 tables, and the first question will need table 201. Ask for the first three questions the person wants to answer.

> **Pitfall.** Saying yes to everything. Each pipeline you build must be operated for years. A clear “not now, and here is why” is part of the job.

::scenario
? The head of marketing asks for “real-time campaign performance”. Campaign budgets are changed once a day, in a morning meeting.
+ Ask what they would do with data that is minutes old, then propose an hourly refresh | The decision is made once a day. Hourly data is more than enough, and it costs a small part of a streaming design.
~ Build it as a streaming pipeline, as requested | It will work, and it will satisfy the words of the request. You will operate a complex system for a need that does not exist.
- Refuse, because real-time is too expensive | You have rejected the request and not found the requirement. The stakeholder still has the problem.
? Two teams ask for “active customers”. Sales counts customers with an order in 90 days. Product counts customers who logged in within 30 days.
+ Get the two teams to agree on two named metrics, each with a written definition | The two numbers answer different questions. With clear names such as `customers_ordered_90d` and `customers_logged_in_30d`, no one compares them by mistake.
- Choose the definition that is easier to build | One team now has a number that is wrong for its purpose, and it will build its own.
~ Build the two and call each one “active customers” in its own dashboard | Each team is satisfied until the two dashboards are shown in the same meeting.
::end

## Remember

- A request is not a requirement. Find the decision behind it.
- Grain, freshness and correctness are the three answers that shape the design.
- Producers are stakeholders too. Speak to them before their change stops your pipeline.
- Write one page, then deliver a small real result quickly.

::quiz
? Which requirement has the largest effect on the architecture?
- The colours of the dashboard
+ How fresh the data must be
- The name of the table
! Freshness decides between daily batch, micro-batch and streaming. These have very different costs and tools.
::end
