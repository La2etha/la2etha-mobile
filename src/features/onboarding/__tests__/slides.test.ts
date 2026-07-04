import { slides } from '../slides';

test('three slides tell the pool→find→private story', () => {
  expect(slides).toHaveLength(3);
  expect(slides.map((s) => s.key)).toEqual(['pool', 'find', 'private']);
});
