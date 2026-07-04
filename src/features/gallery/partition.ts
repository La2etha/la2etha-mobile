import type { GalleryPhoto } from '../../api/gallery';

/** Split a gallery page into the main relevance (leads) and the demoted
 *  "maybe not you" section (F3/F4 — collapsed by default in the UI). */
export function partitionGallery(items: GalleryPhoto[]): {
  main: GalleryPhoto[];
  demoted: GalleryPhoto[];
} {
  const main = items.filter((i) => i.relevance !== 'low');
  const demoted = items.filter((i) => i.relevance === 'low');
  return { main, demoted };
}
