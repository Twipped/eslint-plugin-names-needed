import rule from '../rules/by-complexity.js';
import { RuleTester } from 'eslint';
import { test } from 'libtap';

const ruleTester = new RuleTester();

test('by-complexity', async () => {
  ruleTester.run("by-size", rule, {
    valid: [
      // give me some code that won't trigger a warning
    ],

    invalid: [
      {
        code: "",
        errors: [
          { message: "Fill me in.", type: "Me too" },
        ],
      },
    ],
  });
});

