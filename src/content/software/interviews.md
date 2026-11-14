---
minutes: 8
tech: []
refs:
  - clrs: Ch. 3, “Characterizing Running Times”, for reasoning about cost
  - ddia: Ch. 1, “Reliable, Scalable, and Maintainable Applications”, for system design discussions
---
Technical interviews try to answer a few questions in a few hours: can this person solve problems with code, reason about trade-offs, and work well with others? The formats are imperfect, and they are learnable. Knowing what interviewers look for, and practising the formats, makes a large difference.

## Common formats

- **Coding**: solve a problem in code, live or as a take-home task. Often about data structures and algorithms.
- **System design**: design a system, such as a URL shortener or a chat service, on a whiteboard. Usually for mid-level and senior roles.
- **Practical**: debug or extend an existing small codebase, or review a pull request. Closer to real work.
- **Behavioural**: talk about past work: a hard problem, a disagreement, a failure.

## What interviewers look for

More than the final answer, they watch **how you work**:

- Do you **understand the problem** before solving it? Ask questions: input sizes, edge cases, what to optimise.
- Do you **explain your thinking** aloud, so they can follow and help?
- Do you start with a working simple solution, then improve it?
- Do you **test** your code with examples, including edge cases?
- Can you say the **cost** of your solution, as in [Cost of an algorithm](/lesson/big-o), and the trade-offs?
- How do you respond to hints and to being wrong?

## Coding interviews

1. Restate the problem and confirm with an example.
2. Talk through a simple approach and its cost, even if it is slow.
3. Improve it: often a [hash map](/lesson/hash-maps), sorting, two pointers, or a graph search.
4. Write clean code with clear names.
5. Walk through it with an example and an edge case, and fix what you find.

Practise on a site with problems by topic, and practise **speaking while you code**, which feels strange at first.

## System design interviews

There is no single right answer. Show a method:

1. **Clarify requirements**: users, scale, what must be fast, what must never be lost.
2. **Estimate** rough numbers: requests per second, data size.
3. **Draw the main parts**: clients, load balancer, services, database, cache, queue.
4. **Go deeper** where it matters: the data model, the hardest part, the bottleneck.
5. **Discuss trade-offs and failures**: what happens when this part fails, as in [Scaling a service](/lesson/scaling).

## Behavioural interviews

Prepare five or six stories from your experience. Tell each with a clear shape: the **situation**, your **task**, the **actions** you took, and the **result**. Be specific about what *you* did, and include what you learned when something went wrong.

> **In practice.** Interview the company too. Ask how they review code, deploy, handle incidents and help people grow. The answers tell you a lot about the job.

## Remember

- Formats: coding, system design, practical, behavioural.
- Interviewers watch how you think: clarify, explain, start simple, test, state costs.
- Practise coding while speaking, and a method for system design.
- Prepare specific stories, and ask your own questions.

::quiz
? In a coding interview, you are unsure what the input size can be. What should you do?
+ Ask, because the answer changes which solution is right
- Assume it is small and start coding
- Say nothing and write the fastest possible solution
! Clarifying the problem is part of what is being assessed, and it guides the design.
? Your first idea is correct but slow. What is a good approach?
+ Explain it and its cost, then look for a faster approach, such as using a hash map
- Stay silent until you find the perfect solution
- Give up on that problem
! A working simple solution, with its cost stated, then an improvement, shows clear thinking.
::end
