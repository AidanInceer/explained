---
minutes: 9
tech: []
refs:
  - suttonbarto: Ch. 1, “Introduction”, Ch. 3, “Finite Markov Decision Processes”, and Ch. 13, “Policy Gradient Methods”
  - alphago: Whole paper
---
Nobody can label the right move in every position of a game, or the right motor command at every instant for a robot. But you can say whether things went well: the game was won, the robot reached the target. **Reinforcement learning** (RL) learns from such rewards, by trying actions and seeing what happens. It is how game-playing systems beat world champions, and an important part of training language models today.

## The parts

- An **agent** chooses **actions**.
- An **environment** responds with a new **state** and a **reward**: a number, positive for good outcomes, negative for bad.
- A **policy** is the agent's rule for choosing actions in each state. Learning means improving the policy.
- The goal is the most **total reward over time**, not just the next one. A move that loses a piece now may win the game later.

## The hard parts

- **Delayed credit.** A game is won after 200 moves. Which moves deserve the credit? Spreading reward back over earlier actions is the central difficulty.
- **Exploration against exploitation.** Do the action that has worked so far, or try something new that might be better? Too little exploring gets stuck; too much wastes time.
- **The data depends on the policy.** What the agent sees depends on what it does, so learning can be unstable, unlike learning from a fixed dataset.

## Two main approaches

**Value-based**: learn how good each state, or each action in a state, is: the expected future reward. Then choose the action with the best value. Q-learning and DQN, which learned to play Atari games from pixels, work this way.

**Policy-based**: adjust the policy directly. Actions that led to more reward than expected become more likely; others less. This is a form of [gradient descent](/lesson/gradient-descent) on expected reward. PPO, a popular method of this kind, is the algorithm often used in [Learning from preferences](/lesson/preferences).

Many methods combine both: an **actor** (policy) and a **critic** (value estimate).

## Landmarks

- **Games**: AlphaGo defeated a top professional at Go in 2016, combining learning from human games, self-play reinforcement learning and search. Later versions learned from self-play alone.
- **Control**: robot locomotion, cooling of data centres, chip layout.
- **Language models**: RLHF tunes models to human preferences; RL with checkable rewards trains [reasoning models](/lesson/reasoning-models).

## Practical cautions

- **Reward hacking**: the agent finds an unintended way to score points, such as a boat-racing agent that circles to collect bonus points forever instead of finishing the race. The reward must say exactly what you want.
- **Sample hunger**: RL often needs huge numbers of trials. Simulators help, but behaviour learned in simulation may not transfer to the real world.

## Remember

- RL learns a policy from rewards by acting and observing outcomes.
- Delayed credit and the exploration–exploitation balance are the core difficulties.
- Value-based methods learn how good actions are; policy-based methods adjust the policy directly.
- RL powers game-playing, control and the tuning of language models. Reward hacking is a constant risk.

::quiz
? An agent always picks the action that worked best so far and never tries anything else. What risk does this create?
+ It may never discover better actions: too little exploration
- It explores too much
- It cannot get any reward
! Without exploring, the agent may stay with a poor strategy.
? A cleaning robot rewarded for "no visible dirt" learns to cover its camera. What is this?
+ Reward hacking: maximising the reward in an unintended way
- Successful cleaning
- Exploration
! The reward measured the wrong thing, and the agent exploited it.
::end
