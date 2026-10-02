// 3-step upload (05-api-ghi-chu §5): ask for a URL, PUT the file, confirm.
import { api } from './fetcher';

/** Vercel caps request bodies at 4.5 MB. */
const HUB_UPLOAD_LIMIT = 4 * 1024 * 1024;

export type MediaRef = { id: string; title: string; kind: string; url: string; width: number | null; height: number | null };

async function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith('image/')) return { width: null, height: null };
  try {
    const bmp = await createImageBitmap(file);
    return { width: bmp.width, height: bmp.height };
  } catch {
    return { width: null, height: null };
  }
}

export async function uploadFile(orgId: string, file: File): Promise<MediaRef> {
  const { mediaId, uploadUrl, headers } = await api<{ mediaId: string; uploadUrl: string; headers: Record<string, string> }>(`/orgs/${orgId}/media/upload-url`, {
    method: 'POST',
    json: { filename: file.name, mimeType: file.type, sizeBytes: file.size },
  });
  let ok = false;
  try {
    ok = (await fetch(uploadUrl, { method: 'PUT', headers, body: file })).ok;
  } catch {
    // Storage refused the browser (bucket CORS not set): small files go through the Hub instead.
    if (file.size > HUB_UPLOAD_LIMIT) throw { code: 'UPLOAD_MISMATCH', message: 'Không tải được tệp lớn hơn 4 MB lúc này. Hãy chọn tệp nhỏ hơn.' };
    await api(`/orgs/${orgId}/media/${mediaId}/upload`, { method: 'POST', body: file, headers: { 'Content-Type': 'application/octet-stream' } });
    ok = true;
  }
  if (!ok) throw { code: 'UPLOAD_MISMATCH', message: 'Tải tệp chưa hoàn tất. Hãy thử lại.' };
  return api<MediaRef>(`/orgs/${orgId}/media/${mediaId}/complete`, { method: 'POST', json: await imageSize(file) });
}
