import type { SystemPlan } from './types'

/* One invented AI assistant, from training data to an answer on a screen. Positions are in drawing units on a
   1200 x 690 board, in the same columns as the data engineering drawing. Each part names the planned lessons. */
export const AI_SYSTEM: SystemPlan = {
  title: 'What all of it builds',
  lead: 'One invented assistant, drawn whole. Training is in the middle: text goes in on the left and comes out as weights. The top row uses those weights to answer a question, one token at a time. Under it: the maths, and who does the work.',
  W: 1200,
  H: 690,
  labels: [
    { x: 212, y: 44, text: 'inference' },
    { x: 1030, y: 30, text: 'who uses it' },
    { x: 16, y: 150, text: 'training data' },
    { x: 846, y: 154, text: 'evaluation' },
    { x: 16, y: 380, text: 'post-training' },
    { x: 16, y: 614, text: 'the people' },
  ],
  parts: [
    // answering a question
    { id: 'docs', x: 212, y: 56, w: 130, label: 'Documents', sub: 'PDF, HTML, wiki', glyph: 'file', lessons: ['rag'] },
    { id: 'retr', x: 404, y: 56, w: 150, label: 'Retrieval', sub: 'vector search', glyph: 'search', lessons: ['rag', 'embeddings'] },
    { id: 'infer', x: 620, y: 56, w: 150, label: 'Inference', sub: 'GPU servers', glyph: 'cpu', count: { start: 1804220, unit: 'tokens', per: [8, 30] }, lessons: ['generation', 'sampling', 'context-window', 'model-choice', 'small-models', 'reasoning-models'] },
    { id: 'guard', x: 846, y: 56, w: 130, label: 'Guardrails', sub: 'input, output filters', glyph: 'lock', lessons: ['prompt-injection', 'red-teaming'] },
    { id: 'chat', x: 1030, y: 40, w: 156, h: 156, label: 'Chat app', kind: 'screen', screen: 'chat', lessons: ['prompting', 'hallucination', 'context-window'] },
    { id: 'api', x: 1030, y: 210, w: 156, h: 42, label: 'Developer API', kind: 'who', glyph: 'api', lessons: ['structured-output', 'model-choice', 'local-models'] },
    { id: 'agent', x: 1030, y: 262, w: 156, h: 42, label: 'Agent', sub: 'tool calls', kind: 'who', glyph: 'plug', lessons: ['tools-agents'] },
    // training data
    { id: 'webtext', x: 16, y: 162, w: 150, h: 46, label: 'Web pages', glyph: 'file', lessons: ['datasets', 'data-bias'] },
    { id: 'books', x: 16, y: 222, w: 150, h: 46, label: 'Books + code', glyph: 'file', lessons: ['datasets'] },
    { id: 'images', x: 16, y: 282, w: 150, h: 46, label: 'Images + sound', glyph: 'app', lessons: ['vision-transformers', 'multimodal', 'speech'] },
    { id: 'clean', x: 212, y: 160, w: 130, h: 58, label: 'Clean + dedupe', sub: 'filters, hashes', glyph: 'check', count: { start: 92410, unit: 'kept', per: [3, 11] }, lessons: ['datasets', 'ml-data-quality', 'data-bias', 'augmentation'] },
    { id: 'tok', x: 212, y: 244, w: 130, h: 58, label: 'Tokeniser', sub: 'BPE, token ids', glyph: 'table', lessons: ['tokens', 'embeddings'] },
    // pretraining
    { id: 'train', x: 388, y: 150, w: 412, h: 222, label: 'Pretraining', kind: 'zone', chips: { names: ['batch', 'forward', 'loss', 'backward', 'update'], y: 324, cycle: true }, lessons: ['pretraining', 'next-token', 'training-loop', 'loss-functions', 'cross-entropy', 'gradient-descent', 'learning-rate', 'scaling-laws', 'distributed-training', 'loss-curves'] },
    { id: 'gpu', x: 404, y: 182, w: 112, h: 126, label: 'GPU cluster', sub: 'thousands of GPUs', kind: 'screen', screen: 'chip', lessons: ['how-chips-compute', 'gpus', 'numbers-in-hardware', 'memory-bandwidth', 'many-chips', 'power-cost'] },
    { id: 'net', x: 530, y: 182, w: 158, h: 126, label: 'Neural network', sub: 'transformer', kind: 'screen', screen: 'network', lessons: ['neuron', 'activations', 'deep-networks', 'backprop', 'attention', 'transformer', 'multi-head', 'residual'] },
    { id: 'weights', x: 702, y: 182, w: 86, h: 126, label: 'Weights', sub: 'parameters', glyph: 'db', lessons: ['tensors', 'initialisation', 'interpretability'] },
    // checked before release
    { id: 'evals', x: 846, y: 166, w: 130, h: 112, label: 'Evals', kind: 'zone', checks: [['maths 82%', true], ['code 74%', true], ['refuses harm', true], ['made-up date', false]], lessons: ['evals', 'benchmarks', 'metrics', 'hallucination'] },
    // teaching it to help
    { id: 'people', x: 16, y: 392, w: 150, h: 92, label: 'Labellers', sub: 'examples, ratings', glyph: 'person', lessons: ['labelling'] },
    { id: 'labels', x: 212, y: 392, w: 130, h: 92, label: 'Labelled data', sub: 'pairs, rankings', glyph: 'table', lessons: ['labelling', 'ml-data-quality'] },
    { id: 'ft', x: 388, y: 392, w: 412, h: 92, label: 'Fine-tuning', kind: 'zone', chips: { names: ['instructions', 'A or B ratings', 'reward model', 'tuned weights'], y: 432, gate: 3 }, lessons: ['fine-tuning', 'preferences', 'transfer', 'rl', 'alignment'] },
    { id: 'mon', x: 846, y: 392, w: 130, h: 92, label: 'Monitoring', kind: 'zone', notes: ['cost per answer', 'speed', 'user reports'], lessons: ['model-choice', 'evals'] },
    { id: 'safety', x: 1004, y: 392, w: 182, h: 92, label: 'Safety', kind: 'zone', notes: ['red team', 'prompt injection tests', 'rules for use'], lessons: ['red-teaming', 'prompt-injection', 'alignment', 'governance'] },
    {
      id: 'maths', x: 16, y: 506, w: 1170, h: 84, label: 'Maths', kind: 'zone',
      chips: { names: ['vectors', 'matrix multiply', 'derivatives', 'chain rule', 'probability', 'softmax', 'gradient descent'], y: 538 },
      lessons: ['vectors', 'dot-product', 'matrix-multiply', 'derivatives', 'chain-rule', 'gradients', 'probability', 'softmax', 'gradient-descent'],
    },
    // the people
    { id: 't1', x: 16, y: 626, w: 170, h: 50, label: 'Data team', sub: 'collect, clean, label', kind: 'who', lessons: ['datasets', 'labelling'] },
    { id: 't2', x: 208, y: 626, w: 226, h: 50, label: 'Researchers', sub: 'architectures, scaling', kind: 'who', lessons: ['transformer', 'scaling-laws', 'interpretability'] },
    { id: 't3', x: 456, y: 626, w: 226, h: 50, label: 'ML engineers', sub: 'train, tune, serve', kind: 'who', lessons: ['training-loop', 'distributed-training', 'small-models'] },
    { id: 't4', x: 704, y: 626, w: 210, h: 50, label: 'App developers', sub: 'prompts, RAG, agents', kind: 'who', lessons: ['prompting', 'rag', 'tools-agents'] },
    { id: 't5', x: 936, y: 626, w: 250, h: 50, label: 'Safety + evals', sub: 'test before release', kind: 'who', lessons: ['evals', 'red-teaming', 'alignment'] },
  ],
  flows: [
    { from: 'docs', to: 'retr', dot: 3.2 },
    { from: 'retr', to: 'infer', dot: 1.8 },
    { from: 'infer', to: 'guard', dot: 1.2 },
    { from: 'guard', to: 'chat', dot: 1.2 },
    { from: 'guard', to: 'api', dot: 1.9 },
    { from: 'guard', to: 'agent', dot: 2.3 },
    { from: 'webtext', to: 'clean', dot: 1.5 },
    { from: 'books', to: 'clean', dot: 1.9 },
    { from: 'images', to: 'tok', dot: 2.6 },
    { from: 'clean', to: 'tok', dot: 1.6 },
    { from: 'tok', to: 'gpu', dot: 1.3 },
    { from: 'weights', to: 'infer', dot: 4.5 },
    { from: 'weights', to: 'evals', dot: 4 },
    { from: 'people', to: 'labels', dot: 2.8 },
    { from: 'labels', to: 'ft', dot: 2.8 },
    { from: 'ft', to: 'evals', dot: 4.2 },
    { from: 'evals', to: 'guard', control: true },
  ],
}
