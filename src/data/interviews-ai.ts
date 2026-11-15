/** The Interviews page of AI. Shorter than the others: roles in AI differ a lot. See interviews.ts for the shape. */
import type { InterviewGuide } from './interviews.ts'

export const AI_INTERVIEWS: InterviewGuide = {
  lead: 'Roles in AI differ a lot: research, machine learning engineering, and building products on top of a model. Most interviews still test the same base: coding, machine learning fundamentals, and how you would build and check a model in practice. Expect the software engineering rounds too.',
  stages: [
    {
      name: 'Coding',
      tests: 'Usually the same as a software coding round. Some teams ask you to write a small piece of machine learning from scratch.',
      prepare: ['Python, NumPy and array shapes', 'Write a training loop or softmax by hand', 'Big O for the code you write'],
      lessons: ['tensors', 'softmax', 'training-loop'],
    },
    {
      name: 'Machine learning fundamentals',
      tests: 'Short questions on the basics: loss, gradients, overfitting, metrics. They check that you understand why, not only the names.',
      prepare: ['Bias and variance, and how to see each in loss curves', 'Precision, recall, and when each matters', 'What each part of a transformer does'],
      lessons: ['overfitting', 'metrics', 'gradient-descent', 'transformer'],
    },
    {
      name: 'ML system design',
      tests: 'Design a system such as a recommender or a support assistant: data, model choice, evaluation, serving, and monitoring.',
      prepare: ['Start from the metric that the business cares about', 'Say how you get labels, and how you evaluate offline and online', 'Cost and latency at serving time'],
      lessons: ['evals', 'rag', 'model-choice', 'ml-data-quality'],
    },
    {
      name: 'Project deep dive',
      tests: 'Talk through a project you did. They ask why you made each choice and what you would change.',
      prepare: ['One project you know in full detail', 'The baseline, and how much your model beat it by', 'What failed, and what you learned'],
      lessons: ['benchmarks'],
    },
  ],
  questions: [
    {
      topic: 'Fundamentals',
      items: [
        {
          q: 'Training loss goes down, but validation loss goes up. What is happening?',
          answer: 'The model overfits: it learns the training data, not the pattern. Get more data, add regularisation or augmentation, use a smaller model, or stop earlier.',
          lessons: ['overfitting', 'regularisation', 'loss-curves'],
        },
        {
          q: 'Why do we divide by the square root of the key size in attention?',
          answer: 'Dot products grow with the size of the vectors. Large scores push softmax towards one item and make the gradients very small. Scaling keeps the scores in a useful range.',
          lessons: ['attention', 'softmax'],
        },
        {
          q: '99% accuracy on fraud detection. Is that good?',
          answer: 'Not by itself. If 1% of cases are fraud, a model that always says "not fraud" also scores 99%. Look at precision and recall on the fraud class.',
          lessons: ['metrics'],
        },
      ],
    },
    {
      topic: 'Building with models',
      items: [
        {
          q: 'The model invents facts about your company. What do you do?',
          answer: 'Give it the facts at question time with retrieval (RAG), ask it to cite them, and measure the result with an evaluation set of real questions.',
          lessons: ['rag', 'hallucination', 'evals'],
        },
        {
          q: 'Prompting, RAG or fine-tuning?',
          answer: 'Prompting first, because it is cheap to change. RAG when the model needs facts it does not have. Fine-tuning when it needs a style or a task format that prompts do not give reliably.',
          lessons: ['prompting', 'rag', 'fine-tuning'],
        },
      ],
    },
  ],
  gotchas: [
    {
      title: 'Test data leaks into training',
      why: 'A duplicate or a feature from the future makes the score look excellent, and the model fails in use.',
      instead: 'Split by time or by user, remove duplicates across the split, and be suspicious of a result that is too good.',
      lessons: ['train-test', 'ml-data-quality'],
    },
    {
      title: 'No evaluation set',
      why: 'Without one, each change to a prompt or a model is judged by a few examples that you remember.',
      instead: 'Build a set of real cases early, and run it on each change.',
      lessons: ['evals'],
    },
    {
      title: 'Trusting text from users and documents',
      why: 'Text in an email or web page can carry instructions that the model follows.',
      instead: 'Treat model input as untrusted. Limit what tools the model can call, and ask a person before actions that matter.',
      lessons: ['prompt-injection', 'tools-agents'],
    },
  ],
  practice: [
    ['Introduction to Machine Learning Interviews', 'https://huyenchip.com/ml-interviews-book/', 'A free book on the ML interview process, with questions.'],
    ['Neural Networks: Zero to Hero', 'https://karpathy.ai/zero-to-hero.html', 'Build neural networks and a small language model from scratch.'],
  ],
}
