
import { parse } from 'espree';
import { test } from 'libtap';
import computeWeight from '../core/compute-weight.js';

function evaluate (input) {
  const ast = parse(input, { ecmaVersion: 'latest' });
  return computeWeight(ast.body[0].expression);
}

const tests = {
  '(a) => a': 4,
  '(a) => a()': 7,
  '(a) => a.b': 6,
  '(a) => a.b()': 9,
  '(a) => {}': 3,
  '(a) => { a(); }': 7,
  '(a) => { console.log(a); a();\n}': 41,
  '() => { a(); b(); c(); }': 86,
};

test('computeWeight function', async (t) => {
  for (const [ input, expected ] of Object.entries(tests)) {
    t.equal(evaluate(input), expected, input);
  }
});
