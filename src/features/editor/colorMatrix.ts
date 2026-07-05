export type Adjustments = {
  brightness: number; // -1..1, 0 = neutral
  contrast: number; // -1..1, 0 = neutral
  saturation: number; // -1..1, 0 = neutral
  warmth: number; // -1..1, 0 = neutral
};

export const NEUTRAL_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
};

const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

function identity(): number[] {
  // prettier-ignore
  return [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function multiply(a: number[], b: number[]): number[] {
  const out = new Array(20).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row * 5 + k] * b[k * 5 + col];
      }
      if (col === 4) sum += a[row * 5 + 4];
      out[row * 5 + col] = sum;
    }
  }
  return out;
}

// Skia's color matrix operates on NORMALIZED color values (0..1), so every
// bias/translation term below is in 0..1 units — NOT 0..255. (Getting this
// wrong blows the image to solid white on the smallest nudge.)
function brightnessMatrix(brightness: number): number[] {
  const offset = brightness; // -1..1 → full black..full white at the extremes
  // prettier-ignore
  return [
    1, 0, 0, 0, offset,
    0, 1, 0, 0, offset,
    0, 0, 1, 0, offset,
    0, 0, 0, 1, 0,
  ];
}

function contrastMatrix(contrast: number): number[] {
  // scale around the mid-grey pivot (0.5 in normalized space); contrast in [-1,1] -> scale in [0,2]
  const scale = contrast + 1;
  const offset = 0.5 * (1 - scale);
  // prettier-ignore
  return [
    scale, 0, 0, 0, offset,
    0, scale, 0, 0, offset,
    0, 0, scale, 0, offset,
    0, 0, 0, 1, 0,
  ];
}

function saturationMatrix(saturation: number): number[] {
  // saturation in [-1,1] -> s in [0,2]; s=0 collapses to luma-weighted grayscale
  const s = saturation + 1;
  const invS = 1 - s;
  const r = LUMA_R * invS;
  const g = LUMA_G * invS;
  const b = LUMA_B * invS;
  // prettier-ignore
  return [
    r + s, g,     b,     0, 0,
    r,     g + s, b,     0, 0,
    r,     g,     b + s, 0, 0,
    0,     0,     0,     1, 0,
  ];
}

function warmthMatrix(warmth: number): number[] {
  const shift = warmth * 0.15; // gentle red-up / blue-down, normalized units
  // prettier-ignore
  return [
    1, 0, 0, 0, shift,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, -shift,
    0, 0, 0, 1, 0,
  ];
}

/** Composes brightness/contrast/saturation/warmth into one 4x5 row-major
 *  color matrix, applied in that order (contrast around mid-grey, then
 *  saturation, so brightness/warmth offsets aren't rescaled by contrast). */
export function composeMatrix(adjustments: Adjustments): number[] {
  let m = identity();
  m = multiply(contrastMatrix(adjustments.contrast), m);
  m = multiply(saturationMatrix(adjustments.saturation), m);
  m = multiply(brightnessMatrix(adjustments.brightness), m);
  m = multiply(warmthMatrix(adjustments.warmth), m);
  return m;
}
