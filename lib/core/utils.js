
export class Counter {
  constructor () {
    this.seen = {};
  }

  add (type) {
    if (!this.seen[type]) this.seen[type] = 1;
    else this.seen[type]++;
  }

  has (type) {
    return !!this.seen[type];
  }

  get (type) {
    return this.seen[type] || 0;
  }
}

export function coalesceNumbers (...vals) {
  return vals.find((v) => typeof v === 'number');
}

export function sum (...collection) {
  collection = collection.flat(Infinity);
  return collection.reduce((a, b) => a + b, 0);
}
