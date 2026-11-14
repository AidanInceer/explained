/** The Toolkit page of AI. See toolkit.ts for the shape and the rules. */
import type { Toolkit } from './toolkit.ts'

export const AI_TOOLKIT: Toolkit = {
  lead: 'The map explains ideas. This page lists what you need in your hands: the languages and libraries that AI work uses, and the things that a useful colleague can do. Nobody knows all of it on the first day. Python, NumPy and one model API are enough to start.',
  langsTitle: 'Languages and libraries',
  levelNotes: {
    Essential: 'You use these in almost all AI work.',
    Important: 'Most roles use most of these. Learn each one when a project needs it.',
    'For some roles': 'Depends on the role: research, training at scale, or fast inference.',
  },
  langs: [
    {
      name: 'Python and NumPy',
      level: 'Essential',
      use: 'Almost all AI work: data, training, evaluation and applications. NumPy holds numbers in arrays and does the maths fast.',
      first: ['Lists, dictionaries and functions', 'Arrays, shapes and broadcasting', 'Matrix multiplication with @', 'Notebooks', 'Virtual environments'],
      links: [
        ['The Python tutorial', 'https://docs.python.org/3/tutorial/'],
        ['NumPy: the absolute basics', 'https://numpy.org/doc/stable/user/absolute_beginners.html'],
      ],
      lessons: ['vectors', 'matrix-multiply'],
    },
    {
      name: 'PyTorch',
      level: 'Essential',
      use: 'The most used library to build and train neural networks.',
      first: ['Tensors and automatic gradients', 'A module and a training loop', 'Datasets and data loaders', 'Run on a GPU', 'Save and load weights'],
      links: [
        ['PyTorch tutorials', 'https://pytorch.org/tutorials/'],
        ['Neural Networks: Zero to Hero (videos)', 'https://karpathy.ai/zero-to-hero.html'],
      ],
      lessons: ['tensors', 'training-loop', 'backprop'],
    },
    {
      name: 'A model API',
      level: 'Essential',
      use: 'Call a hosted language model from code: messages, tools and structured output.',
      first: ['Send a message and read the reply', 'System prompts', 'Tool use', 'Count tokens and cost'],
      links: [
        ['Claude documentation', 'https://docs.claude.com'],
        ['OpenAI platform documentation', 'https://platform.openai.com/docs'],
      ],
      lessons: ['prompting', 'structured-output', 'tools-agents'],
    },
    {
      name: 'scikit-learn',
      level: 'Important',
      use: 'Classic machine learning: regression, trees and clustering, with the tools to split data and measure results.',
      first: ['fit and predict', 'Train and test splits', 'Pipelines', 'Cross-validation and metrics'],
      links: [['scikit-learn user guide', 'https://scikit-learn.org/stable/user_guide.html']],
      lessons: ['linear-regression', 'cross-validation'],
    },
    {
      name: 'Hugging Face Transformers',
      level: 'Important',
      use: 'Download open models and tokenisers, and fine-tune them.',
      first: ['Load a model and a tokeniser', 'Run text generation', 'Fine-tune on a small dataset'],
      links: [
        ['Transformers documentation', 'https://huggingface.co/docs/transformers/index'],
        ['Hugging Face LLM course', 'https://huggingface.co/learn/llm-course'],
      ],
      lessons: ['tokens', 'fine-tuning'],
    },
    {
      name: 'SQL and pandas',
      level: 'Important',
      use: 'Most training and evaluation data starts in tables. You select, join and clean it before a model sees it.',
      first: ['SELECT, JOIN and GROUP BY', 'DataFrames: filter, group and merge', 'Missing values'],
      links: [
        ['SQLBolt, interactive lessons', 'https://sqlbolt.com'],
        ['pandas: getting started', 'https://pandas.pydata.org/docs/getting_started/index.html'],
      ],
      lessons: ['datasets', 'ml-data-quality'],
    },
    {
      name: 'CUDA or Triton',
      level: 'For some roles',
      use: 'Fast code that runs on the GPU, for training and inference at scale.',
      first: ['Threads, blocks and grids', 'Memory: global, shared, registers', 'Why memory access decides speed'],
      links: [
        ['CUDA C++ programming guide', 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/'],
        ['Triton documentation', 'https://triton-lang.org'],
      ],
      lessons: ['gpus', 'memory-bandwidth'],
    },
    {
      name: 'JAX',
      level: 'For some roles',
      use: 'NumPy-like code with automatic gradients, compiled for GPUs and TPUs. Common in research.',
      first: ['grad, jit and vmap', 'Pure functions', 'Random numbers with keys'],
      links: [['JAX documentation', 'https://docs.jax.dev']],
      lessons: ['gradients'],
    },
  ],
  skillsTitle: 'What a good AI engineer can do',
  skillsNote: 'A list to measure yourself against, and to find the next lesson. Models change each year. These abilities do not.',
  skills: [
    {
      group: 'Understand',
      lead: 'You can say how it works, not only what it does.',
      items: [
        ['Read the maths in a paper: vectors, gradients, probabilities', ['matrix-multiply', 'gradients', 'probability']],
        ['Explain how a network learns, from the loss to the weight update', ['loss-functions', 'backprop', 'gradient-descent']],
        ['Explain how a language model writes text, one token at a time', ['tokens', 'next-token', 'attention', 'sampling']],
      ],
    },
    {
      group: 'Build',
      lead: 'You can make a model useful.',
      items: [
        ['Train a small model and read its loss curves', ['training-loop', 'loss-curves']],
        ['Split data so that the test result means something', ['train-test', 'ml-data-quality']],
        ['Build an application on a model: prompts, retrieval and tools', ['prompting', 'rag', 'tools-agents']],
        ['Choose a model for the cost, speed and quality that you need', ['model-choice', 'small-models']],
      ],
    },
    {
      group: 'Check',
      lead: 'You can show that it works, and find where it does not.',
      items: [
        ['Evaluate with your own test set, not only public benchmarks', ['evals', 'benchmarks']],
        ['Find where a model fails: bias, made-up facts, attacks', ['data-bias', 'hallucination', 'prompt-injection']],
        ['Know the rules that apply to your system', ['governance']],
      ],
    },
    {
      group: 'Work with people',
      lead: 'You are someone that a team wants to keep.',
      items: [
        ['Explain what a model can and cannot do, with no hype', ['what-is-ml', 'hallucination']],
        ['Write down data, choices and results, so that others can repeat them', ['datasets', 'metrics']],
      ],
    },
  ],
}
