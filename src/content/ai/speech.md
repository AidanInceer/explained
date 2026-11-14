---
minutes: 7
tech: []
refs:
  - whisper: Sections 1 and 2, on data and model
  - d2l: Section 9.1, “Working with Sequences”
---
Voice assistants, live captions, dictation and spoken translation all need two skills: turning speech into text (**speech recognition**) and turning text into speech (**speech synthesis**). Both now use the same ideas as the rest of AI: audio becomes tokens or vectors, and transformers do the rest.

## Sound as numbers

A microphone records the air pressure many thousands of times a second: 16,000 samples a second is common for speech. One second is 16,000 numbers, too many to feed a transformer directly.

So audio is usually converted into a **spectrogram**: for each short slice of time, about 10 to 25 milliseconds, measure how much energy there is at each frequency. The result is an image-like grid, time across and pitch up, which shows the shape of each sound. Models read it like [patches of an image](/lesson/vision-transformers), or compress it further into audio tokens.

## Speech to text

A recognition model such as Whisper:

1. Turns the audio into a spectrogram.
2. An **encoder** transformer reads it.
3. A **decoder** transformer writes the transcript, token by token, attending to the encoder's output, as in [The transformer](/lesson/transformer)'s encoder–decoder form.

Trained on hundreds of thousands of hours of audio with transcripts, in many languages, such models handle accents, background noise and technical words far better than older systems, and can translate speech directly.

Common errors: names and rare words, overlapping speakers, very noisy recordings, and occasionally text invented during long silences, a kind of [hallucination](/lesson/hallucination).

## Text to speech

Speech synthesis goes the other way:

1. Turn text into a sequence of sounds and timing.
2. Generate audio features, then a waveform, often with a neural **vocoder**.

Modern systems generate audio tokens with transformers or diffusion, and can copy a voice's character from a short sample. Results can be very hard to tell from real speech.

## Speech in a conversation

Older voice assistants chained three systems: recognition, a language model, synthesis. Each step added delay and lost tone and emotion. Newer **speech-to-speech** models are multimodal, as in [Multimodal models](/lesson/multimodal): they take audio tokens in and produce audio tokens out directly, which allows faster replies, interruptions, and tone of voice.

> **Pitfall.** Voice cloning makes convincing fake calls possible. Systems that clone voices should require consent, and organisations should not treat a familiar voice on the phone as proof of identity.

## Remember

- Audio is sampled thousands of times a second, then usually turned into a spectrogram.
- Recognition: an encoder reads the audio, a decoder writes the text.
- Synthesis: text to audio features to waveform, now often with transformers or diffusion.
- Speech-to-speech models handle audio directly. Voice cloning needs consent and caution.

::quiz
? What does a spectrogram show?
+ How much energy there is at each frequency, for each short slice of time
- The words being spoken
- The speaker's identity
! It turns the waveform into a time-by-frequency grid that models can read.
? Why can a speech-to-speech model reply faster than a chain of three separate systems?
+ It avoids handing off between recognition, a language model and synthesis
- It uses no neural network
- It skips the audio
! Each hand-off in a chain adds delay; one model processes audio directly.
::end
