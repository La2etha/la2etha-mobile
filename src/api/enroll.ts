import { apiFetch } from './client';
import { filesFormData } from './uploads';

export type EnrollmentAccepted = { job_id: string; sample_count: number };

export type EnrollmentStatus = {
  job_id: string;
  status: string; // rq: queued | started | finished | failed | unknown
  enrolled?: boolean | null;
  quality_ok?: boolean | null;
  sample_count?: number | null;
  gallery_entries?: number | null;
  reason?: string | null;
};

/** POST 3–8 multi-angle face photos → background centroid build. */
export function enroll(eventId: string, uris: string[], token: string): Promise<EnrollmentAccepted> {
  return apiFetch<EnrollmentAccepted>(`/events/${eventId}/enroll`, {
    method: 'POST',
    multipart: filesFormData(uris, 'enroll'),
    token,
  });
}

export function enrollStatus(eventId: string, jobId: string, token: string): Promise<EnrollmentStatus> {
  return apiFetch<EnrollmentStatus>(
    `/events/${eventId}/enroll/status?job_id=${encodeURIComponent(jobId)}`,
    { token }
  );
}
