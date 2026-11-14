---
minutes: 7
tech: []
refs:
  - dlbook: Section 7.4, “Dataset Augmentation”
  - aieng: Ch. 8, “Dataset Engineering”, on data synthesis
---
More data is the most reliable way to improve a model, and real data is often scarce or expensive. **Data augmentation** makes new examples by changing existing ones in ways that do not change the answer. **Synthetic data** goes further: it creates examples from scratch, with rules, simulations or other models.

## Augmenting images

A cat is still a cat if the photo is:

- flipped left to right,
- cropped a little, or zoomed,
- rotated a few degrees,
- a little brighter, darker or blurrier.

Applying random changes like these each time an image is used gives the model many variations, and teaches it that these changes do not matter. It is one of the most effective forms of [regularisation](/lesson/regularisation) for image models.

The changes must keep the label true. Flipping a photo of a cat is fine; flipping a "6" can make a "9", and flipping text makes it unreadable.

## Augmenting other data

- **Text**: replace words with synonyms, reorder clauses, translate to another language and back (**back-translation**), or ask a language model to rephrase. Meaning must be preserved, which is harder to check than for images.
- **Audio**: add background noise, change speed or pitch slightly.
- **Tables**: harder. Small random noise, or methods that create new rows between existing ones for rare classes.

## Synthetic data

- **Simulation**: render images of objects from 3D models, or simulate sensor data for self-driving cars, with labels for free.
- **Rules and templates**: generate many forms or sentences from patterns.
- **Model-generated**: use a strong language model to write questions and answers, dialogues, or code with tests. Much of the instruction-tuning data for recent models is at least partly synthetic.

## Risks

- **Errors at scale**: a generator's mistakes become training data, repeated thousands of times.
- **Narrowness**: synthetic examples tend to be more uniform and "average" than real ones, and miss the odd cases that matter most.
- **Model collapse**: models trained repeatedly on the output of earlier models, with too little fresh real data, can lose diversity and quality over generations.
- **Evaluation**: never test only on synthetic data. Test on real data from real use.

> **Rule of thumb.** Mix synthetic data with real data, check samples by hand, filter it with tests or a second model, and measure on real examples whether it helps.

## Remember

- Augmentation makes varied copies that keep the label: flips, crops, noise, rephrasing.
- It teaches the model which changes do not matter, and reduces overfitting.
- Synthetic data comes from simulation, templates or other models.
- Synthetic data can spread errors and lose diversity. Mix with real data, filter, test on real data.

::quiz
? Which augmentation is unsafe for a model that reads handwritten digits?
+ Rotating images by 180 degrees
- Small shifts of a few pixels
- Slight changes of brightness
! A rotated 6 becomes a 9. An augmentation must keep the label correct.
? A team trains only on synthetic dialogues and tests only on synthetic dialogues, with great scores. What is the risk?
+ The model may fail on real user conversations, which differ from the synthetic ones
- Synthetic data is always better
- None
! Test on real data from real use. Synthetic data can miss the variety of the real world.
::end
