const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCm, sizeFor, SIZES } = require('../main.js');

test('table has 7 sizes in order', () => {
  assert.deepEqual(SIZES.map(s => s.size), ['XXS','XS','S','M','L','XL','XXL']);
});
test('exact ranges', () => {
  const cases = { 50:'XXS', 58:'XS', 62:'XS', 70:'S', 75:'M', 83:'L', 90:'XL', 100:'XXL', 110:'XXL' };
  for (const [cm, size] of Object.entries(cases)) assert.equal(sizeFor(+cm), size, cm);
});
test('overlaps pick the larger size', () => {
  assert.equal(sizeFor(67), 'S');
  assert.equal(sizeFor(71), 'M');
  assert.equal(sizeFor(72), 'M');
});
test('gaps pick the next larger size', () => {
  assert.equal(sizeFor(57), 'XS');
  assert.equal(sizeFor(80.5), 'L');
  assert.equal(sizeFor(86.5), 'XL');
  assert.equal(sizeFor(96.5), 'XXL');
});
test('out of range / invalid -> null', () => {
  for (const v of [39, 111, 0, -5, NaN, Infinity]) assert.equal(sizeFor(v), null, String(v));
});
test('parseCm handles Vietnamese decimal comma and junk', () => {
  assert.equal(parseCm('72,5'), 72.5);
  assert.equal(parseCm(' 72.5 '), 72.5);
  assert.equal(sizeFor(parseCm('72,5')), 'M');
  for (const v of ['', '   ', 'abc', '7 2']) assert.ok(Number.isNaN(parseCm(v)), JSON.stringify(v));
});
