
import merge from 'lodash/merge.js';

const defaultWeights = {
  baseWeight: 1,
  baseScale: 1,
  baseRange: null,
  baseParamWeight: 1,
  baseParamScale: 2,
  baseParamRange: 1.5,
  functionBodyScale: 1,
  functionBodyRange: 1,

  BlockStatement: {
    weight: 1,
    scale: 5,
    range: 2,
    bodyScale: 2,
    bodyRange: 3,
  },

  Identifier: {
    weight: 1,
    scale: 1,
    range: 1,
  },

  Literal: {
    weight: 1,
  },

  ExpressionStatement: {
    weight: 0,
    scale: 1,
    range: 1,
  },

  MemberExpression: {
    weight: 0,
    range: 0,
  },

  ReturnStatement: {
    weight: 0,
  },

  CallExpression: {
    weight: 0,
    bodyScale: 0,
    bodyRange: 1.5,
  },
};


export default function getSettings (context) {
  const weights = merge(defaultWeights, context?.settings?.['twipped/weights'] || {});

  return {
    weights,
  };
}
