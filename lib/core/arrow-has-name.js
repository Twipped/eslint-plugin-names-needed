
// Copied from https://github.com/getify/eslint-plugin-proper-arrows/blob/f9036ca3c7ec943c9f85bda799a575e02ce3d296/lib/index.js#L653-L676
export default function arrowHasInferredName (node) {
  var parent = node.parent;

  return (
    (
      parent.type === "VariableDeclarator" &&
      parent.id.type === "Identifier" &&
      parent.init === node
    )
    || (
      [ "Property", "ClassProperty" ].includes(parent.type) &&
      parent.value === node
    )
    || (
      [ "AssignmentExpression", "AssignmentPattern" ].includes(parent.type) &&
      parent.left.type === "Identifier" &&
      parent.right === node
    )
    || (
      parent.type === "ExportDefaultDeclaration" &&
      parent.declaration === node
    )
  );
}
