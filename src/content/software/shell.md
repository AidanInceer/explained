---
minutes: 8
tech: []
refs:
  - missing: Lecture 1, “Course overview + the shell”, and Lecture 2, “Shell Tools and Scripting”
  - ostep: 'Ch. 5, “Interlude: Process API”'
---
Servers have no windows and no mouse. Build systems, containers and CI jobs are all controlled by typed commands. The **command line** is how you work with them, and it is often the quickest way to do a task even on your own laptop.

## The shell runs programs by name

A **terminal** is the window where you type. The **shell** is the program inside it that reads what you type and runs it. Common shells are Bash and Zsh on Linux and macOS, and PowerShell on Windows.

When you type a command, the shell finds a program with that name and starts it as a new process:

```
ls -l /var/log
```

Here `ls` is the program (list files), `-l` is an **option** (long format) and `/var/log` is an **argument** (which folder). The shell looks for `ls` in the folders listed in the `PATH` environment variable.

> **For new readers.** Every command in a tutorial is a small program. `cd` (change folder) and `pwd` (print the current folder) are the first two to learn, because every path you type is read from the current folder.

## Input, output and errors

Each program starts with three streams:

- **Standard input** (stdin): what it reads. By default, the keyboard.
- **Standard output** (stdout): what it writes. By default, the screen.
- **Standard error** (stderr): its error messages. Also the screen, but kept separate, so errors do not mix into the output.

When a program ends, it returns an **exit code**: 0 means success, any other number means failure. Scripts and CI jobs use exit codes to decide whether to continue.

## Pipes join small programs

The `|` sign, a **pipe**, sends the output of one program into the input of the next:

```
grep "ERROR" app.log | sort | uniq -c | sort -rn | head
```

This finds the error lines in a log, counts each distinct line, and shows the ten most common. No single program does that. Five small programs, each with one job, do it together.

This is the main idea of the command line: small tools that read text and write text, joined in new ways for each task.

## Redirection

The `>` sign writes output to a file instead of the screen. `>>` adds to the end of the file. `<` reads input from a file.

```
python report.py > report.txt 2> errors.txt
```

Here `2>` sends standard error, which is stream number 2, to its own file.

## Environment variables

An **environment variable** is a named value that a process gets from the one that started it. `PATH` is one. Programs read others for settings: which database to use, which port to listen on. This is a common way to give the same program different settings in testing and in production, without changing the code.

## Scripts

Put commands in a file and you have a **script**. A script makes a task repeatable: the same steps, the same order, every time, for every person on the team. When you type the same three commands for the second time, make it a script.

## Remember

- The shell runs programs by name, with options and arguments.
- Programs read stdin and write stdout and stderr. An exit code of 0 means success.
- Pipes join small programs. Redirection sends output to files.
- Environment variables give settings. Scripts make tasks repeatable.

::quiz
? What does `cat access.log | grep 404 | wc -l` most likely print?
- The 404th line of the log
+ The number of lines in the log that contain "404"
- The size of the log in bytes
! `grep 404` keeps the lines with "404", and `wc -l` counts lines. The pipe joins them.
? A CI step runs a test program. How does the CI system know that the tests failed?
- It reads the screen output
+ The program ends with an exit code that is not 0
- The program deletes a file
! Exit codes are how a program reports success (0) or failure (any other number) to the program that started it.
::end
