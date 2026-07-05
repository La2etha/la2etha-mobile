import { bestOfYouIds, partitionGallery } from '../partition';
import type { GalleryPhoto } from '../../../api/gallery';

const p = (photo_id: string, relevance: string, best_score?: number): GalleryPhoto => ({
  photo_id,
  origin: 'auto',
  relevance,
  contributor_id: 'u1',
  best_score,
});

test('splits main relevance from demoted low-relevance', () => {
  const { main, demoted } = partitionGallery([p('a', 'main'), p('b', 'low'), p('c', 'main')]);
  expect(main.map((x) => x.photo_id)).toEqual(['a', 'c']);
  expect(demoted.map((x) => x.photo_id)).toEqual(['b']);
});

test('unknown relevance counts as main (never hidden)', () => {
  const { main, demoted } = partitionGallery([p('a', '')]);
  expect(main).toHaveLength(1);
  expect(demoted).toHaveLength(0);
});

test('bestOfYouIds badges the top-scored photos', () => {
  const items = [p('a', 'main', 0.9), p('b', 'main', 0.2), p('c', 'main', 0.5), p('d', 'main', 0.1)];
  const ids = bestOfYouIds(items, 2);
  expect(ids).toEqual(new Set(['a', 'c']));
});

test('bestOfYouIds badges nothing when scores are flat', () => {
  const items = [p('a', 'main', 0.5), p('b', 'main', 0.501), p('c', 'main', 0.499)];
  expect(bestOfYouIds(items).size).toBe(0);
});

test('bestOfYouIds badges nothing with fewer than 2 scored photos', () => {
  expect(bestOfYouIds([p('a', 'main', 0.9)]).size).toBe(0);
});
