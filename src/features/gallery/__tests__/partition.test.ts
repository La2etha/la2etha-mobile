import { partitionGallery } from '../partition';
import type { GalleryPhoto } from '../../../api/gallery';

const p = (photo_id: string, relevance: string): GalleryPhoto => ({
  photo_id,
  origin: 'auto',
  relevance,
  contributor_id: 'u1',
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
