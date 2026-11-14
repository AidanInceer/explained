---
minutes: 7
tech: []
refs:
  - jsonschema: “What is JSON Schema?”
  - claudedocs: Structured outputs, and tool use with input schemas
---
A person reads a free-text answer. A program cannot. When a model's output feeds into code, such as filling a database, calling an API or routing a ticket, it must come back in a fixed shape that the program can read: **structured output**, usually JSON that matches a **schema**.

## Describe the shape

A **JSON Schema** describes what valid data looks like:

```json
{
  "type": "object",
  "properties": {
    "category": { "type": "string", "enum": ["billing", "bug", "feature"] },
    "urgent": { "type": "boolean" },
    "summary": { "type": "string" }
  },
  "required": ["category", "urgent", "summary"]
}
```

This says: an object with a category from a fixed list, a true-or-false flag, and a summary, all required.

## Ways to get it

From weakest to strongest guarantee:

1. **Ask in the prompt**: "Answer only with JSON in this format", with an example. Works most of the time; sometimes the model adds text, misses a field or writes invalid JSON.
2. **Structured output features** in model APIs: you pass the schema, and the provider makes sure the answer is valid JSON that matches it.
3. **Constrained decoding**: at each generation step, tokens that would break the schema are given zero probability, as [Sampling](/lesson/sampling) works on the token distribution. The output cannot be invalid.

Tool use, as [Tools and agents](/lesson/tools-agents) explains, uses the same mechanism: each tool's inputs are described with a schema.

## Always validate

Even with guarantees on the shape, check the content in your code:

- Parse the JSON and validate it against the schema.
- Check values that the schema cannot: a date in the future, a product id that exists, a number in a sensible range.
- Decide what to do on failure: retry with the error message, fall back to a person, or reject.

> **Pitfall.** Valid JSON is not a correct answer. A model can fill every field confidently and wrongly. Structure solves the format, not the [hallucination](/lesson/hallucination) problem.

## Design schemas well

- Use **enums** for categories, so the model cannot invent new ones.
- Keep schemas small and flat; very deep or large schemas are harder for the model to fill well.
- Include a field for uncertainty or "not found", so the model is not forced to make something up.
- Ask for reasoning in a separate field before the answer, if the task needs thinking, so the structure does not cut thinking short.

## Remember

- Programs need answers in a fixed shape: JSON that matches a schema.
- Prompting for JSON usually works; API structured output and constrained decoding guarantee it.
- Always parse and validate, and check the content, not only the shape.
- Use enums, small schemas, and a field for "not found".

::quiz
? A model must classify tickets into exactly three categories. How do you stop it inventing a fourth?
+ Use an enum of the three values in the schema, with structured output enforcement
- Ask it nicely
- Raise the temperature
! An enum restricts the field to listed values, and enforcement makes the restriction hold.
? The model returns valid JSON matching the schema. Is the answer correct?
+ Not necessarily: the shape is right, but the content can still be wrong
- Yes, always
- No, never
! Structure guarantees format. Content still needs checks.
::end
