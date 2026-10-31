import test from 'node:test';
import assert from 'node:assert/strict';
import { estimate } from '../assets/estimate.js';
const input = { type: 'bulk', measured: 1080, depth: 3, factor: 1, waste: 10, pack: 1, unitCost: 40, hours: 4, hourlyCost: 25, delivery: 60, otherCost: 0, pricing: 'margin', percent: 25 };
test('bulk volume converts inches and square feet to yards, then rounds supplier order', () => {
  const r = estimate(input); assert.equal(r.net, 10); assert.equal(r.quantity, 11); assert.equal(r.ordered, 11); assert.equal(r.cost, 600); assert.equal(r.price, 800); assert.equal(r.grossMargin, .25);
});
test('markup and margin use distinct formulas', () => {
  assert.equal(estimate({ ...input, pricing: 'markup' }).price, 750);
});
test('compaction factor applies before supplier rounding', () => {
  const r = estimate({ ...input, factor: 1.25, waste: 0 }); assert.equal(r.quantity, 12.5); assert.equal(r.ordered, 13);
});
test('pavers round to pallet coverage, edging rounds to lengths and plants to each', () => {
  assert.equal(estimate({ ...input, type: 'area', measured: 168, pack: 100, waste: 5 }).ordered, 200);
  assert.equal(estimate({ ...input, type: 'linear', measured: 75, pack: 8, waste: 0 }).ordered, 80);
  assert.equal(estimate({ ...input, type: 'count', measured: 9, pack: 1, waste: 0 }).ordered, 9);
});
test('floating point boundaries do not add an unnecessary increment', () => {
  assert.equal(estimate({ ...input, type: 'area', measured: .3, pack: .1, waste: 0 }).packs, 3);
});
test('invalid or dangerous inputs cannot produce an estimate', () => {
  for (const invalid of [{ measured: -1 }, { measured: '' }, { depth: 0 }, { pack: 0 }, { percent: 100 }, { unitCost: Infinity }, { type: 'unknown' }, { pricing: 'unknown' }, { factor: .5 }]) assert.throws(() => estimate({ ...input, ...invalid }));
});
