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

/** Spec 004 US1/T005: ids of the top-ranked "best of you" photos, by
 *  `best_score`. Returns an empty set (no badges) when scores are flat or too
 *  few are scored — a badge on a coin-flip is worse than no badge. */
export function bestOfYouIds(items: GalleryPhoto[], count = 3): Set<string> {
  const scored = items.filter(
    (i): i is GalleryPhoto & { best_score: number } => typeof i.best_score === 'number'
  );
  if (scored.length < 2) return new Set();
  const scores = scored.map((i) => i.best_score);
  if (Math.max(...scores) - Math.min(...scores) < 0.02) return new Set();
  return new Set(
    [...scored]
      .sort((a, b) => b.best_score - a.best_score)
      .slice(0, count)
      .map((i) => i.photo_id)
  );
}
