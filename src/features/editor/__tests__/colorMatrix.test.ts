import { composeMatrix, NEUTRAL_ADJUSTMENTS } from '../colorMatrix';

const IDENTITY = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

test('neutral adjustments compose to the identity matrix', () => {
  expect(composeMatrix(NEUTRAL_ADJUSTMENTS)).toEqual(IDENTITY);
});

test('full brightness adds a +1 (normalized) offset to each color channel', () => {
  const m = composeMatrix({ ...NEUTRAL_ADJUSTMENTS, brightness: 1 });
  expect(m[4]).toBeCloseTo(1);
  expect(m[9]).toBeCloseTo(1);
  expect(m[14]).toBeCloseTo(1);
  expect(m[19]).toBe(0); // alpha untouched
});

test('zero saturation collapses to luma-weighted grayscale rows', () => {
  const m = composeMatrix({ ...NEUTRAL_ADJUSTMENTS, saturation: -1 });
  // each output channel is the same luma weighting of r,g,b
  expect(m.slice(0, 3)).toEqual(m.slice(5, 8));
  expect(m.slice(5, 8)).toEqual(m.slice(10, 13));
  expect(m[0] + m[1] + m[2]).toBeCloseTo(1);
});

test('warmth shifts red up and blue down symmetrically', () => {
  const m = composeMatrix({ ...NEUTRAL_ADJUSTMENTS, warmth: 1 });
  expect(m[4]).toBeGreaterThan(0);
  expect(m[14]).toBeLessThan(0);
  expect(m[4]).toBeCloseTo(-m[14]);
});

test('positive contrast scales around the mid-grey pivot (0.5 normalized)', () => {
  const m = composeMatrix({ ...NEUTRAL_ADJUSTMENTS, contrast: 1 });
  expect(m[0]).toBeCloseTo(2); // scale
  expect(m[4]).toBeCloseTo(0.5 * (1 - 2));
});
