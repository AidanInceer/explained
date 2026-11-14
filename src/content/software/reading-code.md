---
minutes: 8
tech: []
refs:
  - seag: Ch. 3, “Knowledge Sharing”
  - pragprog: Topic 3, “Software Entropy”
---
Most of your working time is not spent writing new code. It is spent reading code that already exists: to fix a bug, to add a feature, to review a colleague's change. Much of it was written by people who have left, for reasons nobody wrote down. Reading a large, unfamiliar codebase is a skill, and it can be learned.

## Start from the outside

Do not open the first file and read from the top. Learn the shape first:

1. **Read the README** and any docs on how to run it.
2. **Run it.** Start the program and use it as a user would. Run the tests.
3. **Look at the folder structure.** Folder names usually follow the main parts of the system.
4. **Find the entry points**: the `main` function, the web routes, the command handlers. Everything starts from these.

## Follow one path through

Pick one thing the program does, such as "a user places an order", and follow it from the entry point to the database and back. Use your editor's **go to definition** and **find all uses**, from [Editors and IDEs](/lesson/editors). Write down the files and functions on the path.

One complete path teaches you more than ten files read in part. You see how the layers connect, which names the team uses, and where things live.

## Use the debugger as a guide

Set a breakpoint at the entry point, do the action, and step through. You see which code really runs, in which order, with which values. Static reading tells you what *could* happen. The debugger tells you what *does* happen.

## Read the history

The code shows *what*. Version control often shows *why*:

- `git log` on a file shows who changed it and their messages.
- `git blame` shows, for each line, the commit that last changed it. That commit's message, and its pull request, often explain a strange line.

> **Pitfall.** Before you delete code that looks useless, find out why it is there. A strange check may handle a real case that hit production once. The history usually tells you.

## Read the tests

Tests are examples of how the code is meant to be used, with inputs and expected outputs. Where the docs are old, the tests usually are not, because they fail when they are wrong.

## Make a small change

The fastest way to learn a codebase is to change it. Fix a small bug or add a small feature. You will have to find the right place, understand the code around it, run the tests, and get a review. Each of these teaches you something about how the team works.

## Leave it better

When you understand something that took you an hour to figure out, write it down: a comment, a fix to the README, a clearer name. The next reader, who may be you in six months, will not need the hour.

## Remember

- Learn the shape first: docs, run it, folders, entry points.
- Follow one real path from entry point to storage and back.
- The debugger shows what really runs. The history and the tests show why and how.
- Make a small change early, and write down what you learn.

::quiz
? A line of code looks pointless. What should you do before deleting it?
+ Check its history with `git blame` and read the commit or pull request that added it
- Delete it and see if anything breaks in production
- Ask the newest member of the team
! The history usually explains strange code. Some lines handle rare cases that tests do not cover.
? What is the best first step in a new codebase?
- Read every file in alphabetical order
+ Run the program and its tests, then follow one feature from its entry point
- Rewrite the parts you do not understand
! Seeing it run and following one real path shows how the parts connect.
::end
