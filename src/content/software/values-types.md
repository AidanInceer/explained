---
minutes: 7
tech: []
refs:
  - sicp: Ch. 1, Section 1.1, “The Elements of Programming”
  - csapp: Ch. 2, “Representing and Manipulating Information”
---
A program works on **values**: numbers, pieces of text, true or false, lists of other values. Each value has a **type**, and the type says what you can do with it. You can add two numbers and you can make text upper case, but "upper case of 7" means nothing. Types are how a language keeps these apart.

## The basic types

Almost every language has these, under slightly different names:

| Type | Holds | Example |
|---|---|---|
| Integer | A whole number | `42`, `-7` |
| Float | A number with a fraction | `3.14`, `0.5` |
| Boolean | True or false | `True` |
| String | Text: a sequence of characters | `"hello"` |
| None, null or nil | "No value here" | `None` |

The bits for `42` and for `"42"` are completely different. In [Bits, bytes and encodings](/lesson/binary-data) you saw that the same bytes mean nothing without a format. The type is that format, attached to each value.

## Variables name values

A **variable** is a name that refers to a value:

```python
price = 250
name = "Ada"
```

Now `price` stands for 250 wherever you use it. Good names are the cheapest documentation there is: `price_in_pence` says more than `p`.

## Operations depend on the type

The same sign can mean different things for different types:

```python
2 + 3        # 5: add numbers
"2" + "3"    # "23": join strings
"2" + 3      # error in Python: no rule to add text and a number
```

Some languages, such as JavaScript, convert one value to the other type to make the operation work: `"2" + 3` gives `"23"`. This is convenient and also a source of quiet bugs. Python refuses and stops with an error, which is louder and safer.

> **Pitfall.** Input from a form, a file or a network request almost always arrives as text. Convert it to a number on purpose, and check that it is one, before you calculate with it.

## Collections

Programs rarely work on one value at a time. **Collections** hold many:

- A **list** (or array) holds values in order: `[3, 1, 4]`. You get an item by its position, starting at 0.
- A **dictionary** (or map) holds pairs of a key and a value: `{"name": "Ada", "age": 36}`. You get a value by its key.
- A **set** holds distinct values with no order, and answers "is this in it?" quickly.

The collection that you choose decides which questions are fast to ask. The Data structures and algorithms line covers this in detail.

## Nothing

Most languages have a special value for "nothing": `None` in Python, `null` in Java and JavaScript. It is useful to say "no middle name". It is also the most common source of crashes: code that expects a value gets nothing and tries to use it.

## Remember

- Every value has a type, and the type decides which operations make sense.
- A variable is a name for a value. Choose names that explain.
- Mixing types is either an error or a silent conversion, depending on the language.
- Lists, dictionaries and sets hold many values. Each makes different questions fast.

::quiz
? In Python, what is `"5" * 3`?
- 15
+ "555"
- An error
! For a string, `*` repeats it. The type of the value decides what the operation does.
? A form sends the age "36". Code adds 1 and stores "361". What went wrong?
+ The age was text, and adding joined the text instead of adding numbers
- The database rounded the number
- 36 overflowed
! Input arrives as a string. Convert it to an integer before you do arithmetic.
::end
