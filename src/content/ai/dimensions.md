---
minutes: 8
tech: []
refs:
  - dlbook: Section 5.11.1, “The Curse of Dimensionality”
  - esl: Section 2.5, “Local Methods in High Dimensions”
---
Models work in spaces with hundreds or thousands of dimensions. An embedding of a word might have 1,024 components; an image, millions. You cannot picture these spaces, and your intuition from 2D and 3D misleads you there. A few strange facts about high dimensions explain many choices in AI.

## Almost everything is at right angles

Pick two random directions in 3D and they will often be quite close. Pick two random directions in 1,000 dimensions, and they are almost always nearly at a right angle: their [dot product](/lesson/dot-product) is close to zero.

This is useful. A high-dimensional space has room for a huge number of directions that barely overlap, so a model can store many different features, each in its own direction, without them interfering much. It is part of why embeddings of 1,000 numbers can represent so many different meanings.

## Distances stop telling things apart

In high dimensions, take a random cloud of points. The distance from one point to its nearest neighbour and to its farthest neighbour become almost the same. Everything is roughly equally far from everything.

So simple methods that rely on "the nearest points are similar", such as finding the closest examples by straight-line distance, work worse as the number of features grows, unless the data has real structure. This is part of the **curse of dimensionality**.

## You need far more data

To cover a line from 0 to 1 at a spacing of 0.1, you need 10 points. To cover a square at the same spacing, 100. A cube, 1,000. In 10 dimensions, 10 billion. The number of examples needed to fill a space grows exponentially with its dimensions.

Real data never fills the space. Luckily it does not need to: real images, sounds and texts lie on or near much smaller surfaces inside the big space. A photo of a face is not a random set of pixels. Learning works because models find those smaller structures.

## Volume is in the corners and the skin

In high dimensions, almost all of a ball's volume is in a thin layer near its surface. A 1,000-dimensional orange would be almost all peel. And random points from a typical distribution sit at about the same distance from the centre, on a thin shell, not near the middle.

> **For experienced readers.** This is why embeddings are often normalised to length 1 and compared by angle, using cosine similarity, rather than by raw distance: in high dimensions, the direction carries the meaning and the lengths are much alike.

## What to take from it

- Do not trust 3D pictures for high-dimensional behaviour.
- Use angles (cosine similarity) more than raw distances to compare embeddings.
- More features is not automatically better. Each one adds a dimension that needs data to learn from.
- Learning works because real data has structure that occupies a tiny part of the space.

## Remember

- In many dimensions, random directions are nearly orthogonal, leaving room for many features.
- Distances concentrate: near and far neighbours look alike.
- Covering the space needs exponentially more data. Real data lies on smaller structures.
- Compare high-dimensional vectors by angle, and add features with care.

::quiz
? Two random vectors with 2,000 components are compared. What is their cosine similarity likely to be?
+ Close to 0
- Close to 1
- Close to -1
! In high dimensions, random directions are almost always nearly orthogonal.
? A dataset has 50 rows and 5,000 features. What is the main risk?
+ Far too little data to learn reliably in so many dimensions
- The model will be too simple
- The computer will run out of disk
! Each feature adds a dimension. With few examples, models find patterns that are only noise.
::end
