import { apiFetch } from './client';
import { filesFormData, mediaFormData } from './uploads';

export type RejectedUpload = { filename: string | null; reason: string };

export type UploadAccepted = {
  job_id: string;
  photo_ids: string[];
  accepted: number;
  duplicates: number;
  rejected: RejectedUpload[];
};

export type ProcessingStatus = {
  job_id: string;
  status: string;
  processed?: number | null;
  total?: number | null;
  progress?: number | null;
};

/** POST a batch of camera-roll photos into the event pool. */
export function uploadPhotos(eventId: string, uris: string[], token: string): Promise<UploadAccepted> {
  return apiFetch<UploadAccepted>(`/events/${eventId}/photos`, {
    method: 'POST',
    multipart: filesFormData(uris, 'photo'),
    token,
  });
}

/** POST a batch of camera-roll photos and/or short videos into the event pool
 * (spec 003 US2). Videos ≤60s; per-item rejects (undecodable, too long,
 * unsupported type) come back in `rejected` without failing the batch. */
export function uploadMedia(eventId: string, uris: string[], token: string): Promise<UploadAccepted> {
  return apiFetch<UploadAccepted>(`/events/${eventId}/photos`, {
    method: 'POST',
    multipart: mediaFormData(uris, 'media'),
    token,
  });
}

export function processingStatus(eventId: string, jobId: string, token: string): Promise<ProcessingStatus> {
  return apiFetch<ProcessingStatus>(
    `/events/${eventId}/photos/processing?job_id=${encodeURIComponent(jobId)}`,
    { token }
  );
}
