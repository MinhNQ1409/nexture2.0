// Links and labels for activity rows (06 §14.3).
const PATH: Record<string, string> = { STORY: 'stories', EVENT: 'events', PERSON: 'people', PRODUCT_PROJECT: 'products', MEDIA: 'library' };

export function activityHref(orgId: string, targetType: string, targetId: string, action: string): string | null {
  if (action.endsWith('_DELETED')) return null;
  if (targetType === 'ORGANIZATION') return `/o/${orgId}/settings/profile`;
  if (targetType === 'CULTURE_VALUE') return `/o/${orgId}/values`;
  if (targetType === 'MEMBER' || targetType === 'INVITE') return `/o/${orgId}/settings/members`;
  return PATH[targetType] ? `/o/${orgId}/${PATH[targetType]}/${targetId}` : null;
}

export function relativeTime(iso: string | Date, now = Date.now()): string {
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export const showValue = (v: unknown): string => (v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));
