---
minutes: 8
tech: []
refs:
  - hennessy: Ch. 7, “Domain-Specific Architectures”, on reduced precision
  - pmpp: Ch. 6, “Performance Considerations”
---
A number in a computer has a fixed number of bits, as [Bits, bytes and encodings](/lesson/binary-data) showed. More bits mean more precision and range, and also more memory, more data to move, and slower arithmetic. AI found that models need surprisingly little precision. Using fewer bits per number is one of the biggest speed-ups in modern AI.

## Floating-point formats

A floating-point number stores a sign, an **exponent** (the scale, like the power of 10 in scientific notation) and a **mantissa** (the significant digits). The split between them decides range and precision:

| Format | Bits | Exponent bits | Mantissa bits | Notes |
|---|---|---|---|---|
| float32 | 32 | 8 | 23 | The traditional default. About 7 decimal digits |
| float16 | 16 | 5 | 10 | Half the size. Small range: large values overflow |
| bfloat16 | 16 | 8 | 7 | Same range as float32, less precision. Common for training |
| FP8 | 8 | 4 or 5 | 3 or 2 | Used on recent GPUs for parts of training and inference |

**bfloat16** keeps float32's range by using the same 8 exponent bits, and gives up precision. For training, range matters more: gradients and activations can be very small or very large, and precision errors average out over many steps.

## Integers for inference

After training, models can often be run with **integer** weights: int8 (8 bits) or even 4 bits. This is **quantisation**. Each weight is mapped to one of a small set of levels, with a scale factor to convert back. A model quantised to 4 bits takes about a quarter of the memory of its 16-bit version, with a small loss in quality if done carefully. The lesson on distillation and quantisation covers how.

## Why fewer bits are faster

- **Less memory.** A 7-billion-weight model takes 28 GB in float32, 14 GB in bfloat16, and about 3.5 GB at 4 bits. Smaller means it fits on smaller, cheaper hardware.
- **Less data to move.** Reading weights from memory is often the real limit, as the next lessons explain. Half the bits, half the time to read them.
- **More arithmetic per chip.** A multiplier for 8-bit numbers is much smaller than one for 32-bit numbers, so a chip fits many more. GPUs offer several times more operations per second at lower precision.

## Mixed precision

Training usually mixes formats: weights and gradients are computed in 16 bits for speed, while a master copy of the weights and some sums are kept in 32 bits, so tiny updates are not lost to rounding. With float16, a **loss scale** multiplies the loss so small gradients do not round to zero; bfloat16's wider range mostly removes that need.

> **Pitfall.** Some operations are sensitive to precision: sums over very many values, softmax over large scores, and the final loss. Libraries keep these in higher precision. Lowering precision everywhere can make training unstable.

## Remember

- Floating-point numbers split their bits between range (exponent) and precision (mantissa).
- bfloat16 keeps float32's range with less precision, and is common for training.
- Quantised integer weights (8 or 4 bits) make inference smaller and faster.
- Fewer bits mean less memory, less data movement and more operations per second.

::quiz
? A model has 2 billion weights. About how much memory do the weights take in bfloat16?
+ 4 GB
- 2 GB
- 8 GB
! bfloat16 uses 2 bytes per weight: 2 billion × 2 bytes = 4 GB.
? Why is bfloat16 often preferred to float16 for training?
+ It has the same range as float32, so large and tiny values do not overflow or vanish as easily
- It has more precision
- It uses fewer bits
! bfloat16 keeps 8 exponent bits, giving float32's range. Training needs range more than precision.
::end
