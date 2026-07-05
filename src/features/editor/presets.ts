import { NEUTRAL_ADJUSTMENTS, type Adjustments } from './colorMatrix';

export type Preset = { id: string; name: string; adjustments: Adjustments };

/** Static brand adjustment bundles (not user data) — composes under manual
 *  tweaks by construction: applying one is just an 'adjust' step like any
 *  slider commit (FR-008). */
export const PRESETS: Preset[] = [
  { id: 'none', name: 'None', adjustments: NEUTRAL_ADJUSTMENTS },
  {
    id: 'lumen',
    name: 'Lumen',
    adjustments: { brightness: 0.08, contrast: 0.12, saturation: 0.1, warmth: 0.05 },
  },
  {
    id: 'kishk',
    name: 'Kishk',
    adjustments: { brightness: 0, contrast: 0.15, saturation: -1, warmth: -0.05 },
  },
  {
    id: 'asr',
    name: 'Asr',
    adjustments: { brightness: 0.05, contrast: -0.05, saturation: -0.15, warmth: 0.35 },
  },
  {
    id: 'nada',
    name: 'Nada',
    adjustments: { brightness: 0.12, contrast: -0.1, saturation: -0.3, warmth: 0.1 },
  },
  {
    id: 'zafir',
    name: 'Zafir',
    adjustments: { brightness: -0.05, contrast: 0.25, saturation: 0.2, warmth: -0.15 },
  },
];
