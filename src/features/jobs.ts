import type { EnrollmentStatus } from '../api/enroll';
import type { ProcessingStatus } from '../api/photos';

export type Phase = 'working' | 'done' | 'failed';

/** Interpret an enrollment job. A finished job still "fails" if the CV couldn't
 *  build a usable face signature (enrolled=false) — that's retryable, not an error. */
export function enrollPhase(s?: EnrollmentStatus): Phase {
  if (!s) return 'working';
  if (s.status === 'failed' || s.status === 'unknown') return 'failed';
  if (s.status === 'finished') return s.enrolled ? 'done' : 'failed';
  return 'working';
}

export function enrollMessage(s?: EnrollmentStatus): string {
  const phase = enrollPhase(s);
  if (phase === 'done') {
    const n = s?.gallery_entries ?? 0;
    return n > 0
      ? `Found you in ${n} photo${n === 1 ? '' : 's'} so far.`
      : 'You’re enrolled — new photos will find you automatically.';
  }
  if (phase === 'failed') {
    return (
      s?.reason ??
      'We couldn’t get a clear read. Try again in good light, facing the camera.'
    );
  }
  return 'Building your face signature…';
}

export function processingPhase(s?: ProcessingStatus): Phase {
  if (!s) return 'working';
  if (s.status === 'failed' || s.status === 'unknown') return 'failed';
  return s.status === 'finished' ? 'done' : 'working';
}
