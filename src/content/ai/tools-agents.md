---
minutes: 9
tech: []
refs:
  - reactpaper: Sections 1 and 2
  - claudedocs: Tool use overview
  - mcp: Introduction
  - aieng: Ch. 6, “RAG and Agents”, sections on agents
---
On its own, a language model can only produce text. With **tools**, it can act: search the web, query a database, run code, send an email, book a meeting. An **agent** is a model that uses tools in a loop: it decides what to do, does it, looks at the result, and decides the next step, until the task is done.

## Tool use

You describe each tool to the model: a name, what it does, and its inputs as a [schema](/lesson/structured-output).

```json
{
  "name": "get_order_status",
  "description": "Look up the current status of an order by its id.",
  "input_schema": {
    "type": "object",
    "properties": { "order_id": { "type": "string" } },
    "required": ["order_id"]
  }
}
```

When a question needs it, the model replies with a **tool call** instead of text: `get_order_status(order_id="A-8841")`. **Your code** runs the tool, and sends the result back to the model, which then answers or calls another tool. The model never runs anything itself; it asks, and your program decides.

The **Model Context Protocol** (MCP) is an open standard for describing tools and data sources once, so many applications and models can use them.

## The agent loop

1. Read the goal and the history so far.
2. Think, and choose an action: a tool call, or a final answer.
3. Run the tool; add the result to the history.
4. Repeat.

This reason-act-observe loop lets a model handle tasks that need several steps and information it does not have: "find the three cheapest flights next Tuesday and draft an email to my manager comparing them".

## Make agents reliable

- **Few, clear tools**, each doing one thing, with good descriptions and error messages that say what to fix.
- **Limits**: a maximum number of steps, time and cost.
- **Check results**: tests for generated code, validation for data, and a check that the goal was met.
- **Keep a human in the loop** for actions that are hard to undo: payments, deletions, sending messages. The agent prepares; a person confirms.
- **Log every step**, so you can see why an agent did what it did.

Errors compound: an agent that is right 95% of the time at each step succeeds only about 60% of the time over 10 steps. Fewer, more reliable steps beat long chains.

## Security

An agent reads text from the outside world, web pages, emails, documents, and that text can contain instructions meant to hijack it. This is [prompt injection](/lesson/prompt-injection), and it is the main security risk of agents.

- Give each agent the **least privilege** it needs.
- Treat tool outputs as **data**, not instructions.
- Require confirmation before sensitive actions, especially those triggered by content the agent read.

## Remember

- Tools let a model act; the model asks, and your code runs the tool.
- An agent loops: think, act, observe, until done.
- Reliability: few clear tools, limits, checks, human confirmation for irreversible actions, logs.
- Errors compound over steps. Prompt injection is the main security risk; limit privileges.

::quiz
? A model requests `delete_customer(id=7)`. Who actually deletes the customer?
+ The application code, if it decides to run the tool call
- The model, directly
- Nobody: tools are read-only
! Models only propose calls. The application executes them, and should check sensitive ones.
? An agent is 90% reliable at each step. About how often does a 5-step task succeed?
+ About 59%
- About 90%
- About 45%
! 0.9⁵ ≈ 0.59. Errors compound over steps.
::end
