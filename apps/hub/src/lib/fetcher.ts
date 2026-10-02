// Client-side calls to /api/v1; throws { code, message, details } from the error body.
export type ApiError = { code: string; message: string; details?: Record<string, unknown> };

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api/v1${path}`, {
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw (data as { error: ApiError }).error;
  return data as T;
}

/** Only internal paths are allowed as ?next= targets (06 §2.1). */
export const safeNext = (next: string | null | undefined, fallback = '/') => (next && next.startsWith('/') && !next.startsWith('//') ? next : fallback);
