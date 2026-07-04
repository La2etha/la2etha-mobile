import { enrollPhase, enrollMessage, processingPhase } from '../jobs';

test('enroll is working until the job finishes', () => {
  expect(enrollPhase(undefined)).toBe('working');
  expect(enrollPhase({ job_id: 'j', status: 'started' })).toBe('working');
});

test('finished + enrolled is done; finished + not enrolled is failed', () => {
  expect(enrollPhase({ job_id: 'j', status: 'finished', enrolled: true })).toBe('done');
  expect(enrollPhase({ job_id: 'j', status: 'finished', enrolled: false })).toBe('failed');
});

test('rq failed / unknown are failures', () => {
  expect(enrollPhase({ job_id: 'j', status: 'failed' })).toBe('failed');
  expect(enrollPhase({ job_id: 'j', status: 'unknown' })).toBe('failed');
});

test('done message counts gallery entries, failed message surfaces the reason', () => {
  expect(enrollMessage({ job_id: 'j', status: 'finished', enrolled: true, gallery_entries: 3 })).toMatch(/3 photos/);
  expect(enrollMessage({ job_id: 'j', status: 'finished', enrolled: true, gallery_entries: 1 })).toMatch(/1 photo\b/);
  expect(enrollMessage({ job_id: 'j', status: 'failed', reason: 'No face found' })).toBe('No face found');
});

test('processing done only when finished', () => {
  expect(processingPhase({ job_id: 'j', status: 'started' })).toBe('working');
  expect(processingPhase({ job_id: 'j', status: 'finished' })).toBe('done');
});
