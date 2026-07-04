import { apiFetch } from './client';
import { filesFormData } from './uploads';

export type UploadAccepted = {
  job_id: string;
  photo_ids: string[];
  accepted: number;
  duplicates: number;
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

export function processingStatus(eventId: string, jobId: string, token: string): Promise<ProcessingStatus> {
  return apiFetch<ProcessingStatus>(
    `/events/${eventId}/photos/processing?job_id=${encodeURIComponent(jobId)}`,
    { token }
  );
}
