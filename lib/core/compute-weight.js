import getSettings from './settings.js';
import { Counter, coalesceNumbers, sum } from './utils.js';
import makeDebug from 'debug';
const debug = makeDebug('compute-func-weight');

function annotate (descrip, value) {
  if (value !== undefined) debug(descrip + ':', Math.round(value));
  else debug(descrip);
  return Math.round(value);
}

export default function computeFunctionWeight (functionNode, { weights } = getSettings()) {
  debug('Function', functionNode);

  const {
    functionBodyScale = 0,
    functionBodyRange = 0,
  } = weights;

  const counter = new Counter();

  let value = 0;
  value += annotate('Function Paramaters', traverse({ weights, counter, node: functionNode.params, kind: 'param' }));
  value += annotate('Function Body', traverse({ weights, counter, node: functionNode.body,   kind: 'body' }));
  value += annotate('Function Scale', (functionBodyScale * functionNode.body.length ^ functionBodyRange));
  return annotate('Total Function', value);

  // scale * length ^ range
}

function traverse (context) {
  const { node, counter, weights, depth = 0 } = context;
  if (!node || typeof node !== 'object') return 0;

  if (Array.isArray(node)) {
    const {
      bodyScale = 0,
      bodyRange = 0,
    } = context;

    if (node.length === 1) {
      return annotate('1 item array', traverse({
        ...context,
        node: node[0],
      }));
    }

    return sum(
      node.map((n, index) => annotate(`array item ${index}`, traverse({
        ...context,
        node: n,
        index,
        depth: depth + 1,
      }))),
      annotate(`array weight for ${node.length} items`, bodyScale * node.length ^ bodyRange)
    );
  }

  if (!node.type) {
    return sum(
      Object.values(node).map((n) => traverse({
        ...context,
        node: n,
        depth: depth + 1,
      }))
    );
  }

  if (context.kind !== 'param') {
    counter.add(node.type);
    annotate(`Counter Incremented for ${node.type}`);
  }

  if (Overrides[node.type]) {
    return annotate(`Override for ${node.type}`, Overrides[node.type](context));
  }

  const {
    bodyScale = 0,
    bodyRange = 0,
  } = weights[node.type] || {};
  return sum(
    annotate(node.type, lookupWeight(context)),
    Object.values(node).map((n) => traverse({
      ...context,
      node: n,
      bodyScale,
      bodyRange,
      depth: depth + 1,
    }))
  );
}

function lookupWeight ({
  node: { type } = {},
  kind = 'body',
  index = 0,
  weights,
  counter,
}) {
  const {
    baseWeight,
    baseScale,
    baseRange,
    baseParamWeight,
    baseParamScale,
    baseParamRange,
  } = weights;
  const {
    weight,
    scale,
    range,
    param: {
      weight: paramWeight,
      scale: paramScale,
      range: paramRange,
    } = {},
  } = weights[type] || {};

  const f = counter.get(type);

  const w = coalesceNumbers(
    (kind === 'param' && paramWeight),
    weight,
    (kind === 'param' && baseParamWeight),
    baseWeight,
    0
  );

  const s = coalesceNumbers(
    (kind === 'param' && paramScale),
    scale,
    (kind === 'param' && baseParamScale),
    baseScale,
    0
  );

  const r = coalesceNumbers(
    (kind === 'param' && paramRange),
    range,
    (kind === 'param' && baseParamRange),
    baseRange,
    0
  );

  debug(type, { w, s, r, f, i: index });


  return Math.round(
    annotate(`    ${type} weight`, w)
    + annotate(`    ${type} index ${index}`, s * Math.pow(index, r))
    + annotate(`    ${type} frequency ${index}`, s * Math.pow(f, r))
  );
}

const Overrides = {
  BlockStatement (context) {
    const { node, weights, depth } = context;
    const {
      bodyScale = 0,
      bodyRange = 0,
    } = weights.BlockStatement || {};

    if (!node.body.length) {
      // we ignore empty blocks
      return 0;
    }

    if (node.body.length === 1) {
      return traverse({ ...context, node: node.body[0] });
    }

    let w = annotate('BlockStatement', depth ? lookupWeight(context) : 1);
    w += traverse({ ...context, node: node.body });
    w += annotate(`BlockStatement scale`, bodyScale * Math.pow(node.body.length, bodyRange));
    return w;
  },

  CallExpression (context) {
    const { node, weights } = context;
    const {
      bodyScale = 0,
      bodyRange = 0,
    } = weights.CallExpression || {};

    let w = lookupWeight(context);
    w += traverse({ ...context, node: node.callee });
    w += traverse({ ...context, node: node.arguments });
    w += (bodyScale * node.arguments.length ^ bodyRange);
    return w;
  },

  OptionalCallExpression (context) {
    return Overrides.CallExpression(context);
  },

  OptionalMemberExpression (context) {
    return Overrides.MemberExpression(context);
  },

  MemberExpression (context) {
    const { node } = context;
    const { object, property } = node;

    let w = lookupWeight(context);

    w += traverse({ ...context, node: object });

    if (!isIdent(property) && !isLiteral(property)) {
      // if the right side of the dot is an identifier, we treat it as part of this
      // node and ignore its value.
      w += traverse({ ...context, node: property });
    }

    return w;
  },
};

var isLiteral = ({ type }) => [ 'StringLiteral', 'NumericLiteral', 'BooleanLiteral' ].includes(type);
var isIdent = ({ type }) => type === 'Identifier';
var isMemberExpression = ({ type }) => type === 'MemberExpression' || type === 'OptionalMemberExpression';

