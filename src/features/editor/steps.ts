import { NEUTRAL_ADJUSTMENTS, type Adjustments } from './colorMatrix';

export type Crop = { x: number; y: number; w: number; h: number } | null;

export type EditState = {
  crop: Crop;
  rotation: 0 | 90 | 180 | 270;
  straighten: number;
  adjustments: Adjustments;
  presetId: string | null;
  aiBaseImage: string | null;
};

export const INITIAL_EDIT_STATE: EditState = {
  crop: null,
  rotation: 0,
  straighten: 0,
  adjustments: NEUTRAL_ADJUSTMENTS,
  presetId: null,
  aiBaseImage: null,
};

export type EditStep =
  | { kind: 'crop'; crop: Crop }
  | { kind: 'rotate'; rotation: 0 | 90 | 180 | 270 }
  | { kind: 'straighten'; straighten: number }
  | { kind: 'adjust'; adjustments: Adjustments }
  | { kind: 'preset'; presetId: string | null; adjustments: Adjustments }
  | { kind: 'aiResult'; aiBaseImage: string };

export type History = { steps: EditStep[]; cursor: number };

export const EMPTY_HISTORY: History = { steps: [], cursor: 0 };

/** Applies one step on top of a state, returning the next state. */
export function apply(state: EditState, step: EditStep): EditState {
  switch (step.kind) {
    case 'crop':
      return { ...state, crop: step.crop };
    case 'rotate':
      return { ...state, rotation: step.rotation };
    case 'straighten':
      return { ...state, straighten: step.straighten };
    case 'adjust':
      return { ...state, adjustments: step.adjustments, presetId: null };
    case 'preset':
      return { ...state, presetId: step.presetId, adjustments: step.adjustments };
    case 'aiResult':
      return { ...state, aiBaseImage: step.aiBaseImage };
  }
}

/** Re-derives EditState by folding steps[0..cursor) onto the initial state. */
export function fold(steps: EditStep[], cursor: number): EditState {
  let state = INITIAL_EDIT_STATE;
  for (let i = 0; i < cursor; i++) {
    state = apply(state, steps[i]);
  }
  return state;
}

/** Appends a step, truncating any redo tail. */
export function commit(history: History, step: EditStep): History {
  const steps = history.steps.slice(0, history.cursor);
  steps.push(step);
  return { steps, cursor: steps.length };
}

export function undo(history: History): History {
  if (history.cursor === 0) return history;
  return { ...history, cursor: history.cursor - 1 };
}

export function redo(history: History): History {
  if (history.cursor >= history.steps.length) return history;
  return { ...history, cursor: history.cursor + 1 };
}

export function canUndo(history: History): boolean {
  return history.cursor > 0;
}

export function canRedo(history: History): boolean {
  return history.cursor < history.steps.length;
}
