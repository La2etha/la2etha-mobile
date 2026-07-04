import type { DemotedItem } from '../../api/host';

/** The demoted list has one row per (photo, member), so a photo demoted for
 *  several people repeats. Collapse to one entry per photo for the host view —
 *  promoting is per-photo (it lifts it for everyone). */
export function uniqueDemotedPhotos(items: DemotedItem[]): DemotedItem[] {
  const seen = new Set<string>();
  const out: DemotedItem[] = [];
  for (const it of items) {
    if (seen.has(it.photo_id)) continue;
    seen.add(it.photo_id);
    out.push(it);
  }
  return out;
}
