---
minutes: 9
tech: []
refs:
  - ddpm: Sections 1 and 2, on the forward and reverse processes
  - latentdiffusion: Sections 1 and 3
  - udl: Ch. 18, “Diffusion Models”
---
Ask a model for "a watercolour of a fox in the snow" and a new image appears that never existed before. Most image generators today, and many video and audio generators, are **diffusion models**. Their method is strange at first sight: they learn to make pictures by learning to **remove noise**.

## Destroying an image, step by step

Take a real image. Add a little random noise. Then a little more. After hundreds of small steps, nothing of the image is left: it is pure random static. This **forward process** is easy: no learning is needed, just adding noise.

## Learning to undo it

Now train a network to go backwards: given a noisy image and how noisy it is, predict the noise that was added, so it can be subtracted. Training is simple:

1. Take a real image and a random noise level.
2. Add that much noise.
3. Ask the network to predict the noise.
4. The loss is the squared difference between the predicted and the real noise, as in [Loss functions](/lesson/loss-functions).

Repeat over millions of images and all noise levels. The network learns, at every noise level, what real images tend to look like underneath.

## Generating

To create a new image:

1. Start from **pure random noise**.
2. Ask the network to predict the noise, and remove a little of it.
3. Repeat for many steps, from very noisy to clean.

Each step makes the image a little more image-like. Because the starting noise is random, every run gives a different image. Early steps decide the overall layout; later steps add detail.

## Following a prompt

To make the image match text, the network also receives the prompt's embedding, from a text encoder, and is trained on image–caption pairs. At generation time, **classifier-free guidance** compares the network's prediction with and without the prompt, and pushes further in the direction the prompt adds. Stronger guidance follows the prompt more closely, with less variety.

## Working in a smaller space

Denoising full-resolution pixels is costly. **Latent diffusion** first compresses images with an autoencoder into a smaller grid of numbers, runs diffusion there, and decodes the result back to pixels at the end. This made high-resolution generation practical on ordinary GPUs.

The denoising network is often a U-shaped convolutional network, or increasingly a transformer working on patches, as in [Images as tokens](/lesson/vision-transformers).

## Speed and other uses

Many steps make generation slow. Better step schedules, and distillation into models that need only a few steps, have cut this greatly. The same idea generates video, audio, 3D shapes and molecule structures.

> **In practice.** Generated images raise questions of consent, copyright and misuse, such as fake photos of real people. Many systems add watermarks or provenance information, as [Rules and responsibility](/lesson/governance) discusses.

## Remember

- Diffusion models learn to remove noise that was added to real images.
- Generation starts from pure noise and denoises step by step.
- Text conditioning and guidance make the image follow a prompt.
- Latent diffusion works in a compressed space; fewer-step methods make it faster.

::quiz
? What is the network trained to predict in a standard diffusion model?
+ The noise that was added to an image
- The caption of the image
- The next pixel
! Predicting the added noise lets the model remove it, step by step.
? Why does the same prompt give a different image each time?
+ Generation starts from a different random noise each time
- The model forgets its weights
- The prompt is changed by the model
! Different starting noise leads the denoising to different images.
::end
