import { apiFetch } from './client';

export type DemotedItem = { photo_id: string; account_id: string; demote_reason?: string | null };
export type PoolPhoto = {
  id: string;
  contributor_id: string;
  processing_status: string;
  media_type?: string;
  duration_s?: number | null;
  created_at: string;
};

/** Host: photos demoted into members' "maybe not you" sections + why (FR-014). */
export function listDemoted(eventId: string, token: string): Promise<DemotedItem[]> {
  return apiFetch<DemotedItem[]>(`/events/${eventId}/demoted`, { token });
}

/** Host: promote a demoted photo back to the main gallery for everyone in it. */
export function promoteDemoted(eventId: string, photoId: string, token: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}/demoted/${photoId}/promote`, { method: 'POST', token });
}

/** The full event pool. Host-only by default; widened to every member when the
 *  host sets gallery_visibility=everyone_sees_all (spec 005 US5). */
export function getPool(eventId: string, token: string): Promise<PoolPhoto[]> {
  return apiFetch<PoolPhoto[]>(`/events/${eventId}/pool`, { token });
}
