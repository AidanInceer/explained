---
minutes: 7
tech: []
refs:
  - pragprog: Topic 18, “Power Editing”
  - missing: Lecture 3, “Editors (Vim)”
---
You will spend more hours in your editor than in any other tool. A good editor does much more than show text: it finds mistakes as you type, moves through a large codebase in seconds, and runs and debugs your program. Learning it well pays back every day.

## Editor or IDE

- A **text editor**, such as Vim or Sublime Text, edits files quickly and can be extended with plug-ins.
- An **IDE** (integrated development environment), such as IntelliJ IDEA, PyCharm or Visual Studio, understands one family of languages deeply, and includes a debugger, test runner and build tools.
- **Visual Studio Code** sits between the two: a light editor that becomes close to an IDE with extensions.

The choice matters less than learning the one you choose. Many teams do not care which editor you use, as long as the project's formatting and checks run the same for everyone.

## What it should do for you

- **Highlight and check** code as you type, and underline errors before you run anything.
- **Complete** names: type the start of a function and choose from a list of what exists.
- **Go to definition**: jump from a function call to the code of that function, even in another file or library.
- **Find all uses** of a name across the whole project.
- **Rename** a function or variable everywhere at once, safely.
- **Format** the file to the project's style on save.
- **Debug**: stop the program at a line and look at every value. The lesson [Debugging as a method](/lesson/debugging) uses this.

## Language servers

Most of these features come from a **language server**: a separate program that understands one language and answers questions such as "where is this defined?" or "what type is this?". The **Language Server Protocol** lets any editor talk to any language server. This is why VS Code, Vim and others can offer the same deep help for Python, TypeScript, Go and Rust.

## Learn the keys

Every time you reach for the mouse to do something you do daily, you lose a second and a little attention. Learn the shortcuts for:

1. Open a file by typing part of its name.
2. Search the whole project.
3. Go to definition, and go back.
4. Rename a symbol.
5. Run the tests.

> **Rule of thumb.** When you do the same edit for the third time, find the faster way: a shortcut, multiple cursors, or a search and replace.

## AI assistants in the editor

Many editors now include an AI assistant that completes lines, writes functions from a comment, or answers questions about the code. It can save a lot of typing. It can also produce code that looks right and is wrong. Read every suggestion as if a new colleague wrote it. The lesson on working with AI assistants, on the Working in a team line, covers how to use them well.

## Remember

- An IDE understands a language deeply. An editor with extensions can come close.
- Use: errors as you type, completion, go to definition, find uses, rename, format, debug.
- Language servers give the same deep help in many editors.
- Learn the shortcuts for what you do every day.

::quiz
? You must rename a function that is called in 80 files. What is the safest way?
- Search and replace the name as text
+ Use the editor's rename feature, which changes only real uses of that function
- Rename it in one file and fix errors as they appear
! A rename that understands the code changes the function and its callers, and skips unrelated text with the same letters.
? Where do features such as "go to definition" for a language usually come from?
+ A language server for that language
- The operating system
- The version control system
! Language servers understand the code and answer the editor's questions through a shared protocol.
::end
