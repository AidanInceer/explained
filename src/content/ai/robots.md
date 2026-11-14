---
minutes: 8
tech: []
refs:
  - rt2: Sections 1 and 3, on vision-language-action models
  - worldmodels: Sections 1 and 2
  - suttonbarto: Ch. 8, “Planning and Learning with Tabular Methods”, on learned models
---
Language models live in text; robots live in the physical world, where a mistake can break things or hurt people, and where data is slow and expensive to collect. Bringing modern AI to robots, and giving AI an understanding of how the world works, is one of the most active areas of research.

## Why robots are hard

- **Data is scarce.** Text is abundant on the internet; robot experience is not. Every example means a real robot moving in real time.
- **The world is continuous and messy.** Positions, forces and timing must be precise; lighting, objects and surfaces vary endlessly.
- **Mistakes are physical.** You cannot retry a dropped glass.
- **Real time.** A robot must decide many times a second.

## Learning from many sources

Current approaches combine:

- **Imitation learning**: people control the robot, by remote control or by guiding its arm, and the model learns to copy their actions from camera images. Simple and effective, limited by how many demonstrations exist.
- **Reinforcement learning**, from [Reinforcement learning](/lesson/rl): mostly in **simulation**, where millions of trials are cheap, then transferred to the real robot. Physics simulators are imperfect, so methods randomise conditions in simulation to make the learned skills robust.
- **Pretrained vision and language models**: models that already understand images and instructions, from [Multimodal models](/lesson/multimodal), give robots common sense about objects and goals.

## Vision-language-action models

A recent approach takes a vision-language model and fine-tunes it to output **actions** as tokens: small movements of the arm or gripper. Given a camera image and an instruction such as "put the apple in the bowl", it produces the next action, and repeats. Because the model was pretrained on web images and text, it can sometimes follow instructions about objects it never saw in robot data.

## World models

A **world model** predicts what will happen next: given the current state and an action, what will the scene look like after? An agent with a good world model can **plan** by imagining the results of different actions before trying any, and can learn partly inside its own predictions instead of the real world. Video generation models are being explored as general world models, because predicting the next frames of video requires some understanding of physics and objects.

## Where it stands

Robots now handle many tasks in structured settings: warehouses, factories, labs. General-purpose household robots remain hard. Reliability, safety around people, and cost are the main barriers, more than raw intelligence.

> **In practice.** For anything safety-critical, learned behaviour is combined with hard limits on speed and force, emergency stops, and human oversight.

## Remember

- Robotics is hard because data is scarce and slow, the world is messy, and mistakes are physical.
- Robots learn from demonstrations, from RL in simulation, and from pretrained vision and language models.
- Vision-language-action models output actions as tokens from images and instructions.
- World models predict the results of actions, for planning and learning by imagination.

::quiz
? Why is reinforcement learning for robots often done in simulation?
+ Real trials are slow, costly and risky, while simulated trials are cheap and fast
- Real robots cannot be trained
- Simulation is perfectly accurate
! Simulation gives many cheap trials; randomising conditions helps the skills transfer.
? What does a world model predict?
+ What the world will look like after an action
- The best action directly, with no prediction
- The reward of the training data
! It models consequences, which lets an agent plan by imagining outcomes.
::end
