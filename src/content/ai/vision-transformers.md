---
minutes: 7
tech: []
refs:
  - vit: Sections 1, 3.1 and 4, on the model and its results
  - udl: Ch. 12, “Transformers”, section on transformers for images
---
For a decade, [convolutional networks](/lesson/cnn) ruled computer vision. In 2020, researchers showed that a plain [transformer](/lesson/transformer), the same kind that reads text, could classify images just as well, given enough data. The trick: cut the image into small square **patches** and treat each patch like a word.

## Patches as tokens

A **vision transformer** (ViT):

1. Cuts a 224 × 224 image into 16 × 16-pixel patches: a 14 × 14 grid, so 196 patches.
2. Flattens each patch's pixels (16 × 16 × 3 colours = 768 numbers) and multiplies by a learned matrix, giving a patch **embedding**, the image's version of a token embedding from [Embeddings](/lesson/embeddings).
3. Adds a position embedding to each, so the model knows where each patch came from.
4. Runs the sequence of patch vectors through standard transformer blocks.
5. Uses a special summary token, or the average of all patch vectors, to make the final prediction.

## Convolutions against transformers

| | Convolutional network | Vision transformer |
|---|---|---|
| Built-in assumptions | Local patterns, same filter everywhere | Very few; every patch can attend to every other from the first layer |
| Data needed | Works well with modest data | Needs large datasets or pretraining to beat convolutions |
| Long-range relations | Built up slowly through many layers | Available in every layer |
| Scaling | Good | Very good: improves steadily with data and size |

With little data, the built-in assumptions of convolutions help. With very large data, a vision transformer learns those patterns itself, and its flexibility wins.

## Why it matters beyond images

Because images become sequences of tokens, the same architecture, the same training methods and the same hardware tricks work for text and images alike. This is what makes [multimodal models](/lesson/multimodal) natural: put image tokens and text tokens in one sequence, and one transformer reads both.

The same patch idea extends to video (patches over space and time), to audio spectrograms, and to medical scans.

## Cost

Attention cost grows with the square of the number of tokens, as [Attention](/lesson/attention) explained. Smaller patches or higher-resolution images mean many more tokens: halving the patch size quadruples the number of patches. Practical models balance patch size, resolution and compute, and some use hierarchical designs that merge patches as they go deeper.

## Remember

- A vision transformer cuts an image into patches and embeds each one as a token.
- Patch tokens, with positions, go through standard transformer blocks.
- Convolutions need less data; vision transformers scale better with large data.
- Treating images as tokens lets one architecture handle text, images, video and audio.

::quiz
? A 256 × 256 image is cut into 16 × 16 patches. How many patch tokens result?
+ 256
- 16
- 65,536
! (256 / 16)² = 16² = 256 patches.
? With only a few thousand labelled images and no pretraining, which is usually stronger?
+ A convolutional network
- A vision transformer trained from scratch
- They are always identical
! Convolutions' built-in assumptions help with little data; transformers need more.
::end
