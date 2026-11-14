---
minutes: 9
tech: []
refs:
  - ddia: Ch. 4, “Encoding and Evolution”
  - rfc8259: Section 6, “Numbers”, and Section 4, “Objects”
  - protobuf: “Encoding” and “Updating a Message Type” in the language guide
---
In memory, a program's data is objects, lists, and pointers to other places in memory. None of that can cross a network or sit in a file as it is. **Serialisation** turns a value into a sequence of bytes. **Deserialisation** turns the bytes back into a value. Every API call, every message on a queue and every saved file does this. The format that you choose decides how big the bytes are, how fast they are to read, who can read them, and how easily the shape can change later.

## Why not copy the memory?

- A **pointer** is an address in the memory of one process. On another machine, or in the same program tomorrow, that address means nothing.
- Languages and machines store values differently: the size of an integer, the order of its bytes, how text is encoded.
- The reader may be written in another language, by another team, years later.

So both sides need a format they agree on. Like an [API](/lesson/apis), a format is a contract.

## Text formats

**JSON** has objects, arrays, text, numbers, `true`, `false` and `null`. Every language can read and write it, and people can read it too. It is the usual format for web APIs, configuration and logs.

Its costs:

- Every record repeats every field name.
- Numbers are written as text, so they are slow to read and take more space.
- There is no type for dates or for binary data. Dates become text, so agree on one form, such as `2026-11-14T09:30:00Z`. Binary data becomes base64 text, a third larger.
- Nothing checks the shape unless you add a schema.

**CSV** stores tables, but has no types, and commas or line breaks inside values cause trouble. **XML** is older and longer, and is still common in documents and in older enterprise systems.

> **Pitfall.** Many JSON readers, including JavaScript, store every number as a 64-bit floating-point value. Whole numbers above 2⁵³ (about 9 million billion) lose precision with no error. Send large ids as text. Never send money as a fraction: send whole pence, or a decimal as text.

## Binary formats with a schema

**Protocol Buffers**, **Avro** and **Thrift** start from a **schema**: a file that lists each field, its type, and in Protocol Buffers a field number. A tool generates the reading and writing code for each language.

- The bytes are small: field names are not sent, and numbers are stored in compact binary form.
- Reading is fast, and the generated code checks types for you.
- The cost: people cannot read the bytes, every reader needs the schema, and the build gets an extra step.

::fig sw-encode | The same record as JSON and as Protocol Buffers. Change the values, then read the bytes with an old app.

## Change without breaking readers

Writers and readers change at different times. Old mobile apps stay installed for years. During a deploy, old and new servers run side by side. A queue holds messages written by last week's code. So a format must cope in both directions:

- **Backward compatible**: new code can read old data.
- **Forward compatible**: old code can read new data.

Rules that keep both:

- **Add** fields; give each new field a default, so a reader can manage without it.
- **Ignore** fields you do not know. A reader that fails on an unknown field breaks forward compatibility.
- **Do not change** the type or the meaning of a field. Add a new field instead.
- **Remove** in stages: stop writing the field, wait until no reader needs it, then delete it. In Protocol Buffers, mark its number as reserved so that nobody reuses it.

Note what the contract is. In JSON the field **name** is the contract, so renaming a field breaks readers. In Protocol Buffers the field **number** is the contract, so a rename does not change the bytes at all.

## Untrusted bytes

Bytes from outside your system are input from a possible attacker. Some formats can name any type of object to create: Java's built-in serialisation, Python's `pickle`, and some YAML loaders. Loading data made by an attacker can then run the attacker's code.

> **Rule of thumb.** For data from outside, use a format that holds only data, such as JSON or Protocol Buffers. Check it against a schema after you parse it, and set a limit on its size.

## Which format?

- **Public APIs, configuration, logs**: JSON. Readable, and every client can use it.
- **Heavy traffic between your own services**: a binary format with a schema, often Protocol Buffers with gRPC.
- **Files and messages in data pipelines**: Avro or Parquet, as in [file formats](/lesson/file-formats).

## Remember

- Serialisation turns values into bytes; deserialisation turns them back. A format is a contract.
- JSON is readable and universal, but large, and careless with big numbers.
- Binary formats with a schema are small and fast, but need the schema to read.
- Add fields with defaults, ignore unknown fields, never change a field's type or reuse its number.
- Never deserialise untrusted bytes with a format that can create any object.

::quiz
? A new app version adds a field to a message. Old app versions still receive the message. What keeps them working?
+ Old readers ignore fields that they do not know
- The new field must be sent first
- Old readers must be updated at the same time
! Forward compatibility depends on readers skipping unknown fields. Then writers can add fields before every reader is updated.
? An API sends the order id 9007199254740993 as a JSON number. A JavaScript client reads it. What can happen?
+ The client gets a slightly different number, with no error
- The client throws an error
- Nothing: JSON numbers have no limit
! JavaScript stores JSON numbers as 64-bit floating-point values, exact only up to 2⁵³. Send large ids as text.
? In Protocol Buffers, a team renames the field `price` to `price_pence` but keeps its number. Do old readers break?
+ No: the bytes carry the number, not the name
- Yes: the name is part of every message
- Only if the type is a string
! The schema maps numbers to names. The name changes in the generated code, but the bytes stay the same.
::end
