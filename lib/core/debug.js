import { inspect } from 'util';

export default function debug (input, { depth = 4 } = {}) {
  // eslint-disable-next-line no-console
  console.log(inspect(input, { depth, colors: true }));
}
