import { NEUTRAL_ADJUSTMENTS } from '../colorMatrix';
import {
  EMPTY_HISTORY,
  INITIAL_EDIT_STATE,
  canRedo,
  canUndo,
  commit,
  fold,
  redo,
  undo,
  type EditStep,
} from '../steps';

const brighten: EditStep = {
  kind: 'adjust',
  adjustments: { ...NEUTRAL_ADJUSTMENTS, brightness: 0.5 },
};
const rotate90: EditStep = { kind: 'rotate', rotation: 90 };

test('fold with cursor 0 is the initial state', () => {
  expect(fold([brighten], 0)).toEqual(INITIAL_EDIT_STATE);
});

test('commit appends and moves the cursor to the end', () => {
  let h = commit(EMPTY_HISTORY, brighten);
  h = commit(h, rotate90);
  expect(h.steps).toEqual([brighten, rotate90]);
  expect(h.cursor).toBe(2);
  expect(fold(h.steps, h.cursor)).toEqual({
    ...INITIAL_EDIT_STATE,
    adjustments: brighten.adjustments,
    rotation: 90,
  });
});

test('undo moves the cursor back one and re-derives the prior state', () => {
  let h = commit(EMPTY_HISTORY, brighten);
  h = commit(h, rotate90);
  const undone = undo(h);
  expect(undone.cursor).toBe(1);
  expect(fold(undone.steps, undone.cursor)).toEqual(fold(h.steps, h.cursor - 1));
});

test('redo restores a step that was undone', () => {
  let h = commit(EMPTY_HISTORY, brighten);
  h = undo(h);
  expect(canUndo(h)).toBe(false);
  expect(canRedo(h)).toBe(true);
  h = redo(h);
  expect(fold(h.steps, h.cursor)).toEqual({ ...INITIAL_EDIT_STATE, adjustments: brighten.adjustments });
});

test('a new commit after undo truncates the redo tail', () => {
  let h = commit(EMPTY_HISTORY, brighten);
  h = undo(h);
  h = commit(h, rotate90);
  expect(h.steps).toEqual([rotate90]);
  expect(canRedo(h)).toBe(false);
});

test('undo/redo are no-ops at the history bounds', () => {
  expect(undo(EMPTY_HISTORY)).toEqual(EMPTY_HISTORY);
  const full = commit(EMPTY_HISTORY, brighten);
  expect(redo(full)).toEqual(full);
});
