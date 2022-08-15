
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const meta = {
  type: "problem",

  docs: {
    description: "Enforce that a function must be named if it is above a maximum cyclomatic complexity",
    recommended: false,
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
    complex: "This function has a complexity of {{complexity}}/{{min}} and must be named.",
  },
};

function create (context) {
  const option = context.options[0];
  let THRESHOLD = 20;

  if (
    typeof option === "object" &&
    (Object.prototype.hasOwnProperty.call(option, "maximum") || Object.prototype.hasOwnProperty.call(option, "max"))
  ) {
    THRESHOLD = option.maximum || option.max;
  } else if (typeof option === "number") {
    THRESHOLD = option;
  }

  // Using a stack to store complexity per code path
  const complexities = [];

  /**
   * Increase the complexity of the code path in context
   *
   * @returns {void}
   * @private
   */
  function increaseComplexity () {
    complexities[complexities.length - 1]++;
  }

  return {

    onCodePathStart () {

      // The initial complexity is 1, representing one execution path in the CodePath
      complexities.push(1);
    },

    // Each branching in the code adds 1 to the complexity
    CatchClause: increaseComplexity,
    ConditionalExpression: increaseComplexity,
    LogicalExpression: increaseComplexity,
    ForStatement: increaseComplexity,
    ForInStatement: increaseComplexity,
    ForOfStatement: increaseComplexity,
    IfStatement: increaseComplexity,
    WhileStatement: increaseComplexity,
    DoWhileStatement: increaseComplexity,

    // Avoid `default`
    "SwitchCase[test]": increaseComplexity,

    // Logical assignment operators have short-circuiting behavior
    AssignmentExpression (node) {
      if (isLogicalAssignmentOperator(node.operator)) {
        increaseComplexity();
      }
    },

    onCodePathEnd (codePath, node) {
      const complexity = complexities.pop();

      /*
       * This rule only evaluates complexity of functions, so "program" is excluded.
       */
      if (
        codePath.origin !== "function"
      ) {
        return;
      }

      if (complexity > THRESHOLD) {

        context.report({
          node,
          messageId: "complex",
          data: {
            complexity,
            min: THRESHOLD,
          },
        });
      }
    },
  };

}

export default {
  meta,
  create,
};

const LOGICAL_ASSIGNMENT_OPERATORS = new Set([ "&&=", "||=", "??=" ]);
function isLogicalAssignmentOperator (operator) {
  return LOGICAL_ASSIGNMENT_OPERATORS.has(operator);
}
