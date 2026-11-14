---
minutes: 8
tech: []
refs:
  - mlsys: Ch. 5, “Feature Engineering”
  - dlbook: Ch. 1, “Introduction”, on representation learning, and Ch. 15, “Representation Learning”
---
A model cannot use a photo, a date or a customer record directly. It needs numbers: a [vector](/lesson/vectors) for each example. How you turn the world into those numbers, the **features** or **representation**, often matters more than which model you choose. Deep learning's big change was to let models learn their own representations.

## From things to numbers

- **Numbers** that already mean something, such as size or age, can be used almost as they are.
- **Categories**, such as a country, become **one-hot** vectors: one position per country, with a 1 in the right place and 0 elsewhere. Using 1, 2, 3 for countries would wrongly suggest that country 3 is "more" than country 1.
- **Text** becomes tokens, then numbers, as the lesson on tokens and tokenisers explains.
- **Images** are already grids of pixel values.
- **Dates** become useful parts: day of the week, month, hour, days since an event.

## Feature engineering

In classic machine learning, people design features by hand from what they know about the problem:

- For fraud: the amount compared with the customer's usual amount; how many purchases in the last hour.
- For house prices: price per square metre in the area; distance to the station.

A good feature can lift a simple model above a complex one with poor features. It is also where most knowledge of the domain goes in.

## Scaling

Features on very different scales, such as income in thousands and number of children from 0 to 5, can slow or skew training. **Standardise** numeric features: subtract the mean and divide by the standard deviation, so each has mean 0 and spread 1, as in [Expectation and variance](/lesson/expectation).

> **Pitfall.** Compute the mean and standard deviation on the training data only, and reuse them on test and live data. Computing them on all data lets information from the test set leak into training.

## Learned representations

Deep networks learn features themselves. A network for images learns, layer by layer:

- edges and colours in early layers,
- textures and parts in middle layers,
- whole objects in later layers.

A language model learns an **embedding** for every token: a vector where similar meanings are close together, as in [The dot product](/lesson/dot-product). These learned representations can be reused: take a model trained on a huge dataset, and use its internal vectors as features for a new task with little data. This is **transfer learning**, which has its own lesson later on.

## What features cannot fix

If the information is not in the data, no feature or model can find it. Predicting tomorrow's coin flip from today's weather will fail, however you encode the weather.

## Remember

- Models need numbers. Features turn examples into vectors.
- Encode categories as one-hot, extract useful parts of dates, standardise numbers.
- Hand-made features carry domain knowledge and can matter more than the model.
- Deep networks learn their own representations, which can be reused on new tasks.

::quiz
? A model uses country codes 1 to 50 as one numeric feature. What is wrong?
+ It implies an order and distance between countries that does not exist; use one-hot encoding
- Nothing
- The numbers are too small
! Category codes are names, not quantities. One-hot vectors avoid a false order.
? You standardise a feature using the mean of the whole dataset, including the test set. What is the risk?
+ Information from the test set leaks into training, making test results look better than they are
- Training becomes slower
- No risk
! Fit every preparation step on training data only, then apply it to the rest.
::end
