export type NormalizedCrop = { x: number; y: number; w: number; h: number } | null;
export type Rect = { x: number; y: number; w: number; h: number };

export const MIN_CROP_FRACTION = 0.1;

/** Clamps a normalized crop to the min size and keeps it within [0,1]^2 —
 *  shared by `outputRect` and the live crop-drag UI so they agree on bounds. */
export function clampCrop(crop: { x: number; y: number; w: number; h: number }) {
  const w = Math.min(1, Math.max(MIN_CROP_FRACTION, crop.w));
  const h = Math.min(1, Math.max(MIN_CROP_FRACTION, crop.h));
  const x = Math.min(1 - w, Math.max(0, crop.x));
  const y = Math.min(1 - h, Math.max(0, crop.y));
  return { x, y, w, h };
}

// ponytail: straighten inset is a simple sin-based approximation (not the
// exact "largest inscribed rect for a given rotation" formula) — good enough
// to keep rotated content free of empty corners at our +/-15deg range;
// swap for the exact inscribed-rect formula if straighten range grows.
function straightenInsetScale(straightenDeg: number): number {
  const rad = (Math.abs(straightenDeg) * Math.PI) / 180;
  const inset = Math.min(0.4, Math.sin(rad) * 0.5);
  return 1 - inset;
}

/** Resolves the final pixel crop rect for export/preview: normalizes rotation
 *  (90/270 swap the effective frame), clamps the crop to the minimum size,
 *  and insets for straighten so no empty corners show. Pure geometry. */
export function outputRect(
  imageW: number,
  imageH: number,
  crop: NormalizedCrop,
  rotation: 0 | 90 | 180 | 270,
  straighten: number
): Rect {
  const rotated = rotation === 90 || rotation === 270;
  const effW = rotated ? imageH : imageW;
  const effH = rotated ? imageW : imageH;

  const normalized = clampCrop(crop ?? { x: 0, y: 0, w: 1, h: 1 });

  const pixelRect: Rect = {
    x: normalized.x * effW,
    y: normalized.y * effH,
    w: normalized.w * effW,
    h: normalized.h * effH,
  };

  const scale = straightenInsetScale(straighten);
  const insetW = pixelRect.w * scale;
  const insetH = pixelRect.h * scale;
  return {
    x: pixelRect.x + (pixelRect.w - insetW) / 2,
    y: pixelRect.y + (pixelRect.h - insetH) / 2,
    w: Math.max(1, insetW),
    h: Math.max(1, insetH),
  };
}

/** Maps a rect from the "effective" (post hard-rotation) frame `outputRect`
 *  works in back to the image's natural (unrotated) pixel frame — the frame
 *  a renderer actually draws the source image in before rotating it. Only
 *  undoes the 90deg-multiple `rotation`; straighten is a continuous rotation
 *  applied separately by the renderer around this rect's center. */
export function naturalRectFromEffective(
  rect: Rect,
  imageW: number,
  imageH: number,
  rotation: 0 | 90 | 180 | 270
): Rect {
  switch (rotation) {
    case 0:
      return rect;
    case 90:
      return { x: rect.y, y: imageH - rect.x - rect.w, w: rect.h, h: rect.w };
    case 180:
      return { x: imageW - rect.x - rect.w, y: imageH - rect.y - rect.h, w: rect.w, h: rect.h };
    case 270:
      return { x: imageW - rect.y - rect.h, y: rect.x, w: rect.h, h: rect.w };
  }
}
