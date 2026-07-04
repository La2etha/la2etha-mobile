import { API_BASE_URL } from './config';
import { ApiError, toFriendly } from './errors';

type Opts = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  jsonBody?: unknown;
  formBody?: Record<string, string>;
  multipart?: FormData; // file uploads — let fetch set the multipart boundary itself
  token?: string;
};

export async function apiFetch<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: string | FormData | undefined;

  if (opts.jsonBody !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.jsonBody);
  }
  if (opts.formBody) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = Object.entries(opts.formBody)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }
  if (opts.multipart) {
    // Deliberately no Content-Type: fetch adds it with the correct boundary.
    body = opts.multipart;
  }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method: opts.method ?? 'GET', headers, body });
  } catch {
    throw new ApiError(0, toFriendly(0, 'network'));
  }
  if (!res.ok) throw new ApiError(res.status, toFriendly(res.status, 'http'), `HTTP ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
