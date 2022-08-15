
import getSettings from '../core/settings.js';
import arrowHasInferredName from '../core/arrow-has-name.js';
import computeWeight from '../core/compute-weight.js';

const meta = {
  type: "problem",
  docs: {
    descriptions: "Enforce that a function must be named when it is above a certain level of complexity.",
    category: "Best Practices",
  },
  schema: [
    {
      oneOf: [
        {
          type: "integer",
          minimum: 0,
        },
        {
          type: "object",
          properties: {
            threshold: {
              type: "integer",
              min: 0,
            },
          },
          additionalProperties: false,
        },
      ],
    },
  ],
  messages: {
    weight: "This function has a weight of {{weight}}/{{min}} and must be named.",
  },
};

function create ({ report, settings, options }) {
  const { weights } = getSettings(settings);
  const option = options[0];
  let THRESHOLD = 30;

  if (
    typeof option === "object" &&
    (Object.prototype.hasOwnProperty.call(option, "maximum") || Object.prototype.hasOwnProperty.call(option, "max"))
  ) {
    THRESHOLD = option.maximum || option.max;
  } else if (typeof option === "number") {
    THRESHOLD = option;
  }

  function evaluateFunction (node) {
    const weight = computeWeight(node, weights);

    if (weight < THRESHOLD) {
      return;
    }

    report({
      node,
      messageId: "weight",
      data: {
        weight,
        min: THRESHOLD,
      },
    });
  }


  return {
    ArrowFunctionExpression (node) {
      if (arrowHasInferredName(node)) {
        return;
      }
      evaluateFunction(node);
    },
    FunctionExpression (node) {
      if (node.id) return;
      evaluateFunction(node);
    },
    FunctionDeclaration (node) {
      if (node.id) return;
      evaluateFunction(node);
    },
  };
}

export default {
  meta,
  create,
};
