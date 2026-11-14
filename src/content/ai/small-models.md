---
minutes: 8
tech: []
refs:
  - distillation: Sections 1 and 2
  - llmint8: Sections 1 and 3
  - aieng: Ch. 9, “Inference Optimization”, on model compression
---
The largest models are the most capable, and also the most expensive and slowest to run. Many tasks do not need all that capability. Two families of methods make models smaller and cheaper while keeping most of their skill: **distillation**, which trains a small model to copy a large one, and **quantisation**, which stores each weight in fewer bits.

## Distillation

Train a small **student** model to imitate a large **teacher** model:

- Instead of learning only from the correct answers, the student learns from the teacher's **full output distribution**. When the teacher says "cat 0.80, lynx 0.15, dog 0.05", the student learns that a cat looks more like a lynx than a dog. These "soft labels" carry far more information than a single right answer.
- The loss is usually the [KL divergence](/lesson/cross-entropy) between the teacher's and the student's distributions.

For language models, a common form is simpler: have the teacher generate many high-quality answers, and fine-tune the student on them. Many small, capable models today were trained partly this way.

The student does not match the teacher everywhere, but on the tasks covered by the training data it can come close, at a fraction of the cost.

## Quantisation

As [Numbers in hardware](/lesson/numbers-in-hardware) explained, weights trained in 16 or 32 bits can often be stored in 8 or 4 bits:

- Group weights into small blocks, and for each block store a scale factor and low-bit integers.
- At run time, convert back to higher precision on the fly, or compute directly in low precision on hardware that supports it.

**Post-training quantisation** compresses a finished model, using a small sample of data to choose scales that keep errors small. **Quantisation-aware training** simulates low precision during training, so the model learns to cope with it.

The gains: a 4-bit model needs about a quarter of the memory of a 16-bit one, and generates faster, because generation is limited by how fast weights are read, as [Memory is the bottleneck](/lesson/memory-bandwidth) explained.

The costs: some quality loss, larger at very low bit-widths and on harder tasks such as long reasoning or rare languages. A few unusual "outlier" values in large models need special care.

## Other ways to shrink

- **Pruning**: remove weights or whole parts that contribute little.
- **Smaller architectures** trained on more data, as [Scaling laws](/lesson/scaling-laws) noted.
- **Mixture of experts**: many parameters, but only a few used for each token.

## Choosing

Measure on your own task. A distilled or quantised model that scores 2% lower on a general benchmark may be just as good, or much worse, on what you need. The lesson on [cost, speed and model choice](/lesson/model-choice) puts these trade-offs together.

## Remember

- Distillation trains a small student to match a large teacher, often on its soft outputs or generated answers.
- Quantisation stores weights in 8 or 4 bits: less memory, faster generation, some quality loss.
- Pruning, smaller architectures and mixtures of experts also cut cost.
- Measure quality on your own task before you switch.

::quiz
? Why do a teacher's full probabilities help a student more than the single correct label?
+ They show how similar the wrong answers are, which carries more information
- They are easier to store
- They remove the need for a loss function
! Soft labels encode the teacher's knowledge of which classes resemble each other.
? A 16-bit model takes 28 GB. About how much does a 4-bit version take?
+ About 7 GB
- About 14 GB
- About 2 GB
! A quarter of the bits per weight gives about a quarter of the memory, plus small overheads for scales.
::end
