---
minutes: 8
tech: []
refs:
  - clip: Sections 1 and 2, on contrastive image–text training
  - aieng: Ch. 2, “Understanding Foundation Models”, on multimodal models
---
People do not experience the world as text alone. A useful assistant should read a photo of a broken part, a chart in a report, a screenshot of an error, or a voice message. **Multimodal models** take in, and sometimes produce, several kinds of data: text, images, audio and video, in one model.

## A shared space

The first step is to put different kinds of data into compatible vectors. **CLIP**, from 2021, trained an image encoder and a text encoder together on hundreds of millions of image–caption pairs from the web:

- Each image and each caption becomes an embedding.
- Training pulls each image's embedding close to its own caption's embedding, and pushes it away from the other captions in the batch. This is **contrastive learning**.

Afterwards, "a photo of a dog" and photos of dogs land near each other. This shared space enables searching images with text, classifying images by comparing them with descriptions of classes, and guiding image generators, as in [Diffusion models](/lesson/diffusion).

## Images inside a language model

Most multimodal chat models connect a vision encoder to a language model:

1. The image goes through a vision encoder, often a [vision transformer](/lesson/vision-transformers), giving a set of patch vectors.
2. A small learned **adapter** turns those vectors into the same form as the language model's token embeddings.
3. The image "tokens" are placed in the sequence with the text tokens.
4. The [transformer](/lesson/transformer) attends across both, and generates text.

Training happens in stages: first teach the adapter to describe images, then fine-tune on instructions about images, then often train all parts together. Some newer models are trained on mixed text and image tokens from the start.

## Other modalities

- **Audio** in: speech and sounds, as tokens from an audio encoder. The lesson [Speech in and out](/lesson/speech) covers this.
- **Video**: frames, or patches over space and time. Expensive: a minute of video is many thousands of tokens.
- **Output** in other forms: images (with diffusion or image tokens), speech, or actions for robots.

## What works and what does not

Multimodal models are good at describing scenes, reading text in images, answering questions about charts and documents, and explaining screenshots. They are weaker at:

- Precise counting and exact positions of small objects.
- Fine details in small text or dense diagrams, especially at low resolution.
- Spatial reasoning: what is behind or left of what.

And they can [hallucinate](/lesson/hallucination) details that are not in the image.

> **In practice.** Images cost tokens too. A high-resolution image may be split into many tiles, each hundreds of tokens. Resize images to what the task needs.

## Remember

- Contrastive training, as in CLIP, puts images and text in one shared embedding space.
- Chat models attach a vision encoder through an adapter and treat image patches as tokens.
- Audio and video work the same way, at higher token cost.
- Strong at describing and reading; weaker at counting, positions and fine detail.

::quiz
? How does contrastive training, as in CLIP, learn a shared space?
+ It pulls each image close to its own caption and away from other captions in the batch
- It labels every image with a class
- It translates images into words
! Matching pairs are pulled together; mismatched pairs are pushed apart.
? A multimodal model must read a number in tiny print in a large photo. What can help?
+ Crop or zoom to the relevant part, so it is clearer and uses fewer tokens
- Lower the image resolution further
- Ask for a longer answer
! Small details are easy to lose. Give the model a clear, focused view.
::end
