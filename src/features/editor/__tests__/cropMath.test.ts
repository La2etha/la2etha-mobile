import { MIN_CROP_FRACTION, naturalRectFromEffective, outputRect } from '../cropMath';

test('no crop, no rotation, no straighten returns the full image', () => {
  expect(outputRect(1000, 500, null, 0, 0)).toEqual({ x: 0, y: 0, w: 1000, h: 500 });
});

test('90-degree rotation swaps the effective frame before applying crop', () => {
  const r = outputRect(1000, 500, { x: 0, y: 0, w: 1, h: 1 }, 90, 0);
  expect(r).toEqual({ x: 0, y: 0, w: 500, h: 1000 });
});

test('a crop smaller than the minimum is clamped up to it', () => {
  const r = outputRect(1000, 1000, { x: 0.5, y: 0.5, w: 0.01, h: 0.01 }, 0, 0);
  expect(r.w).toBeCloseTo(MIN_CROP_FRACTION * 1000);
  expect(r.h).toBeCloseTo(MIN_CROP_FRACTION * 1000);
});

test('crop origin is clamped so the crop never overflows the image', () => {
  const r = outputRect(1000, 1000, { x: 0.9, y: 0.9, w: 0.5, h: 0.5 }, 0, 0);
  expect(r.x + r.w).toBeLessThanOrEqual(1000);
  expect(r.y + r.h).toBeLessThanOrEqual(1000);
});

test('straighten of 0 degrees applies no inset', () => {
  const r = outputRect(1000, 1000, { x: 0, y: 0, w: 1, h: 1 }, 0, 0);
  expect(r).toEqual({ x: 0, y: 0, w: 1000, h: 1000 });
});

test('straighten insets the rect symmetrically around its center', () => {
  const r = outputRect(1000, 1000, { x: 0, y: 0, w: 1, h: 1 }, 0, 15);
  expect(r.w).toBeLessThan(1000);
  expect(r.h).toBeLessThan(1000);
  expect(r.x).toBeCloseTo((1000 - r.w) / 2);
  expect(r.y).toBeCloseTo((1000 - r.h) / 2);
});

test('straighten is symmetric for positive and negative degrees', () => {
  const pos = outputRect(800, 600, null, 0, 12);
  const neg = outputRect(800, 600, null, 0, -12);
  expect(pos).toEqual(neg);
});

test('naturalRectFromEffective is a no-op at rotation 0', () => {
  const r = { x: 10, y: 20, w: 100, h: 50 };
  expect(naturalRectFromEffective(r, 800, 600, 0)).toEqual(r);
});

test('naturalRectFromEffective maps the full 90-rotated frame back to the full natural image', () => {
  // outputRect swaps W/H for a 90/270 rotation, so the effective frame here is 600x800
  const full = outputRect(800, 600, null, 90, 0); // {x:0,y:0,w:600,h:800}
  expect(naturalRectFromEffective(full, 800, 600, 90)).toEqual({ x: 0, y: 0, w: 800, h: 600 });
});

test('naturalRectFromEffective maps a sub-rect of a 90-rotated (800x600) image back into its 800x600 natural frame', () => {
  // effective frame is 600(w)x800(h) per the W/H swap for a 90/270 rotation
  const eff = { x: 50, y: 100, w: 200, h: 300 };
  expect(naturalRectFromEffective(eff, 800, 600, 90)).toEqual({ x: 100, y: 350, w: 300, h: 200 });
});
