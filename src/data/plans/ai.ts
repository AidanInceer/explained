/**
 * The planned AI map. Each lesson: id, title, one-line summary, prerequisites, and 'deeper' if a reader can skip it.
 * The map places lessons from their order and prerequisites (see src/map/plan-layout.ts).
 */
import type { PlanLesson, PlanLine } from '../../map/plan-layout'

const l = (id: string, title: string, summary: string, prereqs: string[] = [], level?: 'deeper'): PlanLesson => ({ id, title, summary, prereqs, level })

export const AI_PLAN: PlanLine[] = [
  // ---------- Tier 0: the maths underneath ----------
  {
    name: 'Linear algebra',
    blurb: 'Lists and grids of numbers: how every model stores and moves information.',
    color: '#2456D6',
    tier: 0,
    lessons: [
      l('vectors', 'Vectors', 'Lists of numbers as points and arrows.'),
      l('dot-product', 'The dot product', 'How alike two vectors are, in one number.', ['vectors']),
      l('matrices', 'Matrices', 'A grid of numbers that moves every point at once.', ['vectors']),
      l('matrix-multiply', 'Matrix multiplication', 'Chained moves, and most of the arithmetic in AI.', ['matrices']),
      l('dimensions', 'Many dimensions', 'Why a space with 1,000 directions is not like 3D.', ['dot-product']),
      l('tensors', 'Tensors', 'Grids with more axes: batches, images and sequences.', ['matrix-multiply']),
      l('eigen', 'Eigenvectors and decompositions', 'The directions that a matrix only stretches.', ['matrix-multiply'], 'deeper'),
    ],
  },
  {
    name: 'Calculus',
    blurb: 'How outputs change when inputs move: the maths of learning.',
    color: '#7A3FD1',
    tier: 0,
    lessons: [
      l('math-functions', 'Functions and graphs', 'Input in, output out, and the shape between.'),
      l('derivatives', 'Derivatives', 'How fast the output changes when the input moves.', ['math-functions']),
      l('partial-derivatives', 'Partial derivatives', 'Change one input and hold the rest still.', ['derivatives']),
      l('chain-rule', 'The chain rule', 'Rates of change through a chain of functions.', ['derivatives']),
      l('gradients', 'Gradients', 'The steepest direction uphill, for many inputs at once.', ['partial-derivatives']),
      l('integrals', 'Integrals', 'Add up many small pieces to get an area or a total.', ['derivatives'], 'deeper'),
    ],
  },
  {
    name: 'Probability and statistics',
    blurb: 'Numbers for uncertainty: what a model predicts is a probability.',
    color: '#0B8A78',
    tier: 0,
    lessons: [
      l('probability', 'Probability', 'Numbers for how likely things are.'),
      l('conditional', 'Conditional probability and Bayes', 'Change a belief when new evidence arrives.', ['probability']),
      l('distributions', 'Distributions', 'Normal, uniform and long-tailed: the shapes of chance.', ['probability']),
      l('expectation', 'Expectation and variance', 'The centre of a distribution, and its spread.', ['distributions']),
      l('likelihood', 'Likelihood', 'Which settings make the data that you saw most probable.', ['conditional', 'distributions']),
      l('samples', 'Samples and estimates', 'What a sample tells you about everything.', ['expectation']),
      l('significance', 'Significance and confidence', 'How sure you can be, and how not to fool yourself.', ['samples'], 'deeper'),
    ],
  },

  // ---------- Tier 1: information, optimisation, hardware ----------
  {
    name: 'Information',
    blurb: 'How to measure surprise, and why models are trained to reduce it.',
    color: '#D0356F',
    tier: 1,
    lessons: [
      l('bits', 'Bits and information', 'Information as the answers to yes-or-no questions.', ['probability']),
      l('entropy', 'Entropy', 'How much surprise a distribution holds.', ['bits']),
      l('softmax', 'Softmax', 'Turn any list of scores into probabilities.', ['entropy']),
      l('cross-entropy', 'Cross-entropy and KL divergence', 'How far the guesses of a model are from the truth.', ['entropy']),
      l('compression', 'Prediction is compression', 'A good predictor is a good compressor, and the reverse.', ['cross-entropy'], 'deeper'),
    ],
  },
  {
    name: 'Optimisation',
    blurb: 'How to find the settings of a model that make its error small.',
    color: '#B97700',
    tier: 1,
    lessons: [
      l('loss-landscape', 'Loss landscapes', 'Error as a surface over all the settings of a model.', ['gradients']),
      l('gradient-descent', 'Gradient descent', 'Small steps downhill until the error stops falling.', ['loss-landscape']),
      l('convexity', 'Convex and non-convex problems', 'When the lowest valley is easy to find, and when it is not.', ['loss-landscape'], 'deeper'),
      l('learning-rate', 'Learning rate', 'Too small is slow. Too large never settles.', ['gradient-descent']),
      l('sgd', 'Stochastic gradient descent', 'Steps from small batches: noisy, fast and good enough.', ['gradient-descent']),
      l('momentum-adam', 'Momentum and Adam', 'Steps that remember the steps before.', ['sgd'], 'deeper'),
    ],
  },
  {
    name: 'The physical layer',
    blurb: 'The chips, memory and power that AI runs on, and why they set the limits.',
    color: '#B4530A',
    tier: 1,
    lessons: [
      l('how-chips-compute', 'How a chip computes', 'Transistors, clocks and arithmetic in silicon.'),
      l('numbers-in-hardware', 'Numbers in hardware', 'float32, bfloat16 and int8: less precision, more speed.', ['how-chips-compute']),
      l('gpus', 'Why GPUs', 'Thousands of small units doing the same sum at once.', ['how-chips-compute', 'matrix-multiply']),
      l('memory-bandwidth', 'Memory is the bottleneck', 'Moving numbers costs more than multiplying them.', ['gpus']),
      l('many-chips', 'Many chips together', 'Split the model, split the data, and the network between.', ['memory-bandwidth'], 'deeper'),
      l('power-cost', 'Datacentres, power and cost', 'Where the electricity goes, and what it costs.', ['many-chips'], 'deeper'),
    ],
  },

  // ---------- Tier 2: classic machine learning ----------
  {
    name: 'Machine learning',
    blurb: 'How a program learns a rule from examples instead of being told it.',
    color: 'var(--line-ink)',
    tier: 2,
    lessons: [
      l('what-is-ml', 'What learning from data means', 'A model, its parameters, and a measure of how wrong it is.', ['math-functions']),
      l('kinds-of-learning', 'Supervised, unsupervised, reinforcement', 'Three kinds of signal to learn from.', ['what-is-ml']),
      l('features', 'Features and representations', 'What the model sees, and why it matters most.', ['what-is-ml', 'vectors']),
      l('loss-functions', 'Loss functions', 'One number for how bad the answers are.', ['what-is-ml', 'cross-entropy']),
      l('train-test', 'Train, validation and test', 'Keep some data back, or you cannot know if the model works.', ['what-is-ml']),
      l('linear-regression', 'Linear regression', 'The simplest model, fitted by gradient descent.', ['loss-functions', 'gradient-descent']),
      l('logistic-regression', 'Logistic regression', 'A straight line that gives a probability.', ['linear-regression', 'softmax']),
      l('overfitting', 'Overfitting, bias and variance', 'A model that remembers is not a model that understands.', ['train-test']),
      l('metrics', 'Measuring a model', 'Accuracy, precision, recall, and which one matters.', ['train-test']),
      l('trees', 'Decision trees and forests', 'Questions in a tree, and many trees that vote.', ['kinds-of-learning'], 'deeper'),
      l('clustering-ml', 'Clustering and dimension reduction', 'Find groups and shapes in data with no labels.', ['kinds-of-learning', 'eigen'], 'deeper'),
      l('regularisation', 'Regularisation', 'Penalise complexity so the model generalises.', ['overfitting']),
      l('cross-validation', 'Cross-validation', 'Use all the data for testing, one part at a time.', ['metrics'], 'deeper'),
    ],
  },

  // ---------- Tier 3: neural networks, data, training ----------
  {
    name: 'Neural networks',
    blurb: 'Layers of simple units that, together, learn very complex rules.',
    color: '#7A3FD1',
    tier: 3,
    lessons: [
      l('neuron', 'A neuron and a layer', 'Weighted sums and a bend: the whole building block.', ['logistic-regression']),
      l('activations', 'Activation functions', 'Why a network needs bends, and which bends are used.', ['neuron']),
      l('deep-networks', 'Deep networks', 'Layers stacked, each building on the last.', ['activations']),
      l('backprop', 'Backpropagation', 'The chain rule, run backwards through every layer.', ['deep-networks', 'chain-rule']),
      l('cnn', 'Convolutional networks', 'The same small filter, moved across an image.', ['backprop']),
      l('residual', 'Residual connections and normalisation', 'Shortcuts and rescaling that let very deep networks train.', ['backprop']),
      l('rnn', 'Recurrent networks and their limits', 'Memory through time, and why it fades.', ['backprop'], 'deeper'),
      l('initialisation', 'Initialisation', 'Where the weights start decides if training works at all.', ['backprop'], 'deeper'),
    ],
  },
  {
    name: 'Data for ML',
    blurb: 'A model is only as good as the examples it learns from.',
    color: '#0B8A78',
    tier: 3,
    lessons: [
      l('datasets', 'Where datasets come from', 'Collected, scraped, bought or made.', ['features']),
      l('labelling', 'Labels and labelling', 'People, rules and models that make the answers.', ['datasets']),
      l('ml-data-quality', 'Data quality and leakage', 'Duplicates, noise, and test answers hidden in the training data.', ['labelling']),
      l('data-bias', 'Bias in data', 'The model learns the world as the data shows it.', ['ml-data-quality']),
      l('augmentation', 'Augmentation and synthetic data', 'More examples from the ones that you have.', ['ml-data-quality'], 'deeper'),
    ],
  },
  {
    name: 'Training in practice',
    blurb: 'What happens in a real training run, from one GPU to thousands.',
    color: '#D8472B',
    tier: 3,
    lessons: [
      l('training-loop', 'The training loop', 'Batch, forward, loss, backward, step. Then again.', ['sgd']),
      l('hyperparameters', 'Hyperparameters', 'Settings that are chosen, not learned.', ['training-loop']),
      l('loss-curves', 'Reading loss curves', 'What the shape of a curve says about the run.', ['training-loop']),
      l('transfer', 'Transfer learning', 'Start from a model that already knows a lot.', ['hyperparameters']),
      l('scaling-laws', 'Scaling laws', 'More data, parameters and compute, and what each one buys.', ['loss-curves']),
      l('distributed-training', 'Distributed training', 'One model, thousands of chips.', ['scaling-laws', 'many-chips'], 'deeper'),
    ],
  },

  // ---------- Tier 4: language models ----------
  {
    name: 'Language models',
    blurb: 'How an LLM turns text into numbers, predicts the next piece, and learns to be useful.',
    color: '#2456D6',
    tier: 4,
    lessons: [
      l('tokens', 'Tokens and tokenisers', 'Text cut into pieces that a model can count.', ['bits']),
      l('embeddings', 'Embeddings', 'Meaning as a position: similar words sit close together.', ['tokens', 'deep-networks', 'dimensions']),
      l('next-token', 'Predict the next token', 'The one task that teaches a model language.', ['tokens', 'cross-entropy']),
      l('attention', 'Attention', 'Each word looks at the others and takes what it needs.', ['embeddings', 'dot-product']),
      l('transformer', 'The transformer', 'Attention and small networks, stacked many times.', ['attention', 'residual']),
      l('multi-head', 'Heads and positions', 'Many ways to look, and how the model knows word order.', ['attention'], 'deeper'),
      l('pretraining', 'Pretraining', 'Predict the next token across a large part of the internet.', ['transformer', 'next-token', 'scaling-laws']),
      l('generation', 'How text is generated', 'One token at a time, and the cache that makes it fast.', ['transformer']),
      l('context-window', 'Context windows', 'What the model can see at once, and what it forgets.', ['transformer']),
      l('sampling', 'Sampling', 'Temperature and top-p: how the next token is chosen.', ['generation']),
      l('fine-tuning', 'Fine-tuning and instructions', 'From a text predictor to an assistant that follows requests.', ['pretraining', 'transfer']),
      l('hallucination', 'Why models make things up', 'Fluent is not the same as true.', ['pretraining']),
      l('interpretability', 'Looking inside a model', 'What researchers can find in the weights.', ['transformer'], 'deeper'),
      l('preferences', 'Learning from preferences', 'RLHF and its relatives: people rank answers, the model learns.', ['fine-tuning']),
      l('small-models', 'Distillation and quantisation', 'Smaller, cheaper models that keep most of the skill.', ['fine-tuning', 'numbers-in-hardware'], 'deeper'),
      l('reasoning-models', 'Reasoning models', 'Models trained to work step by step before they answer.', ['preferences']),
    ],
  },

  // ---------- Tier 5: beyond text, building, safety ----------
  {
    name: 'Beyond text',
    blurb: 'Images, sound, and models that act in the world.',
    color: '#4D7C0F',
    tier: 5,
    lessons: [
      l('vision-transformers', 'Images as tokens', 'Cut a picture into patches and read it like text.', ['transformer', 'cnn']),
      l('diffusion', 'Diffusion models', 'Make an image by removing noise, step by step.', ['transformer']),
      l('multimodal', 'Multimodal models', 'One model for text, images and sound.', ['vision-transformers']),
      l('rl', 'Reinforcement learning', 'Learn from rewards, by trying things.', ['kinds-of-learning']),
      l('speech', 'Speech in and out', 'From sound waves to tokens, and back.', ['multimodal'], 'deeper'),
      l('robots', 'Robots and world models', 'AI that acts in the physical world.', ['rl'], 'deeper'),
    ],
  },
  {
    name: 'Building with AI',
    blurb: 'How to put models to work in software, and what it costs.',
    color: '#B97700',
    tier: 5,
    lessons: [
      l('prompting', 'Prompting', 'Clear instructions, examples and context.', ['fine-tuning']),
      l('structured-output', 'Structured output', 'JSON, schemas, and answers a program can read.', ['prompting']),
      l('rag', 'Retrieval-augmented generation', 'Give the model the documents it needs, when it needs them.', ['prompting', 'embeddings']),
      l('tools-agents', 'Tools and agents', 'A model that can call functions, and the loop around it.', ['structured-output']),
      l('model-choice', 'Cost, speed and model choice', 'Large or small, hosted or local, and the trade-offs.', ['prompting'], 'deeper'),
      l('local-models', 'Running models on your machine', 'What fits, how fast it runs, and why you might.', ['model-choice'], 'deeper'),
    ],
  },
  {
    name: 'Safety and evaluation',
    blurb: 'How to know a model is good, and how to keep it doing what people intend.',
    color: '#D0356F',
    tier: 5,
    lessons: [
      l('evals', 'Evaluating models', 'Test sets for open-ended answers, and their limits.', ['hallucination']),
      l('alignment', 'Alignment', 'Making a model do what people intend, and not more.', ['preferences']),
      l('benchmarks', 'Benchmarks and their limits', 'Why a high score is not the whole story.', ['evals']),
      l('red-teaming', 'Red teaming and misuse', 'Attack the model before others do.', ['evals']),
      l('prompt-injection', 'Prompt injection and data security', 'When text in the input gives the model new orders.', ['alignment']),
      l('governance', 'Rules and responsibility', 'Laws, policies, and who answers when it goes wrong.', ['alignment'], 'deeper'),
    ],
  },
]
