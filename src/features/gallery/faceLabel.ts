export type FaceLabelState = 'self' | 'member' | 'guest';

export type FaceLabelVM = { state: FaceLabelState; text: string };

/** is_me → self ("You", orange); has a name (future field) → member (username,
 *  teal); otherwise → guest ("Guest", muted) — never an internal id (FR-017/018). */
export function faceLabelState(face: { is_me: boolean; name?: string | null }): FaceLabelVM {
  if (face.is_me) return { state: 'self', text: 'You' };
  if (face.name) return { state: 'member', text: face.name };
  return { state: 'guest', text: 'Guest' };
}
