---
minutes: 8
tech: []
refs:
  - udl: Ch. 10, “Convolutional Networks”
  - dlbook: Ch. 9, “Convolutional Networks”
  - alexnet: Whole paper
---
A dense layer connects every input to every neuron. For a 224 × 224 colour image, that is about 150,000 inputs, and a single layer of 1,000 neurons would need 150 million weights. It would also have to learn separately that a cat in the top-left corner is the same as a cat in the bottom-right. **Convolutional networks** solve both problems with one idea: slide the same small filter across the whole image.

## The filter

A **filter** (or kernel) is a small grid of weights, for example 3 × 3. To apply it:

1. Place it over a 3 × 3 patch of the image.
2. Multiply each weight by the pixel under it and add them up: a [dot product](/lesson/dot-product).
3. Slide it one step to the right and repeat, across the whole image, then down a row.

The result is a new grid, a **feature map**, that shows how strongly each region matches the filter's pattern. A filter with positive weights on the left and negative on the right responds to vertical edges, wherever they are.

## Two key ideas

- **Local connections.** Each output depends only on a small neighbourhood. Nearby pixels are related; distant ones much less.
- **Shared weights.** The same 9 weights are used at every position. A pattern learned in one place is recognised everywhere. A 3 × 3 filter on a colour image has 27 weights plus a bias, however large the image.

So a convolutional layer has far fewer parameters than a dense one, and builds in a sensible assumption about images: what a thing is does not depend on where it is.

## Channels

A layer has many filters, often 64 or more, each finding a different pattern, each producing its own feature map. These maps are stacked as **channels**: a [tensor](/lesson/tensors) of shape (channels, height, width). The next layer's filters look across all the channels at once, combining patterns into larger ones.

## Shrinking the image

To see larger patterns, networks reduce the image size as they go deeper:

- **Pooling**: take the maximum (or average) of each 2 × 2 patch, halving width and height.
- **Stride**: move the filter two steps at a time instead of one.

Each layer then sees a larger region of the original image, its **receptive field**. Early layers find edges; deep layers, which see most of the image, find objects, as [Deep networks](/lesson/deep-networks) described.

## The impact

In 2012, a convolutional network (AlexNet), trained on GPUs, cut the error in the ImageNet image classification contest from about 26% to about 15%, far ahead of other methods. That result started the modern deep learning era.

Today, convolutional networks are still widely used for images, video and audio, especially on phones and small devices. For very large image models, **vision transformers**, which treat image patches as tokens, are now common too, as a later lesson explains.

## Remember

- A convolution slides one small filter across the image, computing a dot product at each position.
- Local connections and shared weights mean few parameters and position-independent recognition.
- Many filters give many channels; pooling and stride let deeper layers see larger regions.
- Convolutional networks started the deep learning era and remain common for images.

::quiz
? How many weights does a 5 × 5 filter on a 3-channel image have, not counting the bias?
+ 75
- 25
- 15
! 5 × 5 positions × 3 channels = 75.
? Why can a convolutional network recognise a cat anywhere in an image?
+ The same filter weights are applied at every position
- It is trained once per position
- It ignores the image's position information entirely
! Weight sharing means a learned pattern is detected wherever it appears.
::end
