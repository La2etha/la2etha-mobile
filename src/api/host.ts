import { apiFetch } from './client';

export type DemotedItem = { photo_id: string; account_id: string; demote_reason?: string | null };
export type PoolPhoto = { id: string; processing_status: string; created_at: string };

/** Host: photos demoted into members' "maybe not you" sections + why (FR-014). */
export function listDemoted(eventId: string, token: string): Promise<DemotedItem[]> {
  return apiFetch<DemotedItem[]>(`/events/${eventId}/demoted`, { token });
}

/** Host: promote a demoted photo back to the main gallery for everyone in it. */
export function promoteDemoted(eventId: string, photoId: string, token: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}/demoted/${photoId}/promote`, { method: 'POST', token });
}

/** Host: the full event pool (host-only view). */
export function getPool(eventId: string, token: string): Promise<PoolPhoto[]> {
  return apiFetch<PoolPhoto[]>(`/events/${eventId}/pool`, { token });
}
