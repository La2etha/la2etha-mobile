export function validateEventName(name: string): { ok: boolean; error?: string } {
  if (name.trim().length < 2) return { ok: false, error: 'Give your لمّة a name.' };
  if (name.trim().length > 80) return { ok: false, error: 'That name is a little long — keep it under 80 characters.' };
  return { ok: true };
}

/** Backend join codes are 6 hex chars. We accept any case and trim, but the
 *  field must not be empty. The real "does this code exist" check is the API. */
export function normalizeJoinCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validateJoinCode(raw: string): { ok: boolean; error?: string } {
  if (normalizeJoinCode(raw).length === 0) return { ok: false, error: 'Enter the event code your host shared.' };
  return { ok: true };
}
