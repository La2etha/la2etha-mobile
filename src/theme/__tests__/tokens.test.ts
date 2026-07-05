import { colors, bodyLegalOnCream } from '../tokens';

test('locked brand hexes are exact', () => {
  expect(colors.ink).toBe('#0b3b3a');
  expect(colors.paper).toBe('#faf4e8');
  expect(colors.stamp).toBe('#c8562a');
  expect(colors.glowTeal).toBe('#37d6c4');
  expect(colors.glowHot).toBe('#ff6a3d');
});

test('faint caption color is NOT body-legal on cream', () => {
  expect(bodyLegalOnCream).toContain(colors.ink);
  expect(bodyLegalOnCream).toContain(colors.inkSoft);
  expect(bodyLegalOnCream).not.toContain(colors.inkFaint);
});
