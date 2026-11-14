---
minutes: 8
tech: []
refs:
  - csapp: Ch. 2, “Representing and Manipulating Information”
---
A computer stores everything as bits: numbers, text, pictures, programs. A bit has no meaning of its own. The meaning comes from the agreed way to read it, called an **encoding**. Many bugs are a program that reads bits with the wrong encoding.

## Bits and bytes

A **bit** is one of two values, written 0 and 1. In hardware it is a voltage that is high or low, or a tiny charge that is there or not.

One bit can say yes or no. More bits give more choices: 2 bits give 4 patterns (00, 01, 10, 11), 3 bits give 8, and each extra bit doubles the count.

A **byte** is 8 bits, so it has 2⁸ = 256 patterns. Memory and files are measured in bytes: a kilobyte is about a thousand bytes, a megabyte about a million, a gigabyte about a billion.

## Whole numbers

To store a whole number, the computer writes it in **binary**: base 2 instead of base 10. Each position is worth twice the one to its right: 1, 2, 4, 8, 16 and so on.

`1101` in binary is 8 + 4 + 0 + 1 = 13.

A number has a fixed size, often 32 or 64 bits. That size sets a limit. A 32-bit signed integer holds values from about −2.1 billion to +2.1 billion. Go past the limit and the value **overflows**: in many languages it wraps round to a large negative number, with no error.

> **Pitfall.** Overflow has broken real systems. A counter of milliseconds or of rows that fits today may not fit in two years. Choose 64 bits for anything that counts up for a long time.

## Numbers with a fraction

Numbers such as 0.1 are stored as **floating point**: a sign, digits, and a power of 2, like scientific notation in base 2. Most decimal fractions have no exact binary form, in the same way that 1/3 has no exact decimal form. So the computer stores the nearest value it can.

This is why, in most languages, `0.1 + 0.2` does not equal `0.3` exactly. The difference is tiny, but a test for equality fails.

> **Rule of thumb.** Never store money as floating point. Store whole cents (or pence) as integers, or use a decimal type.

## Text

To store text, each character gets a number, and the number is stored as bits.

- **ASCII**, from the 1960s, gives numbers to 128 characters: English letters, digits and punctuation. "A" is 65.
- **Unicode** gives a number, called a **code point**, to every character in every writing system, and to emoji. It has room for over a million.
- **UTF-8** is the usual way to store Unicode as bytes. It uses 1 byte for ASCII characters and 2 to 4 bytes for others. Because ASCII text is also valid UTF-8, it became the standard on the web.

When text shows as strange symbols, such as "Ã©" in place of "é", a program wrote UTF-8 and another read it with a different encoding.

## Everything else

An image is a grid of **pixels**, and each pixel is often 3 bytes: red, green and blue, from 0 to 255. Sound is a list of numbers that measure the wave many thousands of times each second. A file format, such as PNG or MP3, is an agreed layout of these bytes, usually compressed.

So a file on its own is only bytes. The name ending, a header at the start, or an agreement between programs says how to read them.

## Remember

- A bit is 0 or 1. A byte is 8 bits, with 256 values.
- Integers have a fixed size and can overflow. Floating point is close, not exact.
- Text is numbers for characters. UTF-8 is the usual encoding.
- Bytes have no meaning until a program reads them with an agreed format.

::quiz
? How many different values can one byte hold?
- 8
- 128
+ 256
! A byte is 8 bits, and each bit doubles the count: 2⁸ = 256.
? A shop stores prices as floating point and finds that totals are off by 0.000001. What is the best fix?
- Round every price to two places before each sum
+ Store prices as whole numbers of the smallest unit, such as cents
- Use a 64-bit float
! Most decimal fractions have no exact binary form, so floats add small errors. Integer cents are exact.
::end
