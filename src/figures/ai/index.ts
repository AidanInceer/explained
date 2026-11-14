import type { ComponentType } from 'react'
import { AiDescent, AiDot, AiMatrix, AiMomentum, AiTangent } from './maths'
import { AiBayes, AiEntropy, AiNoise, AiSamples, AiSampling, AiSoftmax } from './chance'
import { AiConv, AiFit, AiKmeans, AiNeuron, AiOverfit, AiRidge, AiThreshold } from './learn'
import { AiAnn, AiMoe } from './scale'
import { AiAttention, AiBpe, AiNumbers } from './language'

/**
 * Figures for AI lessons. Use a name that starts with "ai-", so it cannot clash with another subject.
 * Put each figure component in a file in this folder, and add it here.
 */
export const AI_FIGURES: Record<string, ComponentType> = {
  'ai-dot': AiDot,
  'ai-matrix': AiMatrix,
  'ai-tangent': AiTangent,
  'ai-descent': AiDescent,
  'ai-momentum': AiMomentum,
  'ai-bayes': AiBayes,
  'ai-samples': AiSamples,
  'ai-entropy': AiEntropy,
  'ai-softmax': AiSoftmax,
  'ai-sampling': AiSampling,
  'ai-noise': AiNoise,
  'ai-fit': AiFit,
  'ai-overfit': AiOverfit,
  'ai-ridge': AiRidge,
  'ai-threshold': AiThreshold,
  'ai-kmeans': AiKmeans,
  'ai-neuron': AiNeuron,
  'ai-conv': AiConv,
  'ai-bpe': AiBpe,
  'ai-attention': AiAttention,
  'ai-numbers': AiNumbers,
  'ai-moe': AiMoe,
  'ai-ann': AiAnn,
}
