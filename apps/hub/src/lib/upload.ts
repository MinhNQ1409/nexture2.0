// 3-step upload (05-api-ghi-chu §5): ask for a URL, PUT the file, confirm.
import { api } from './fetcher';

export type MediaRef = { id: string; title: string; url: string; width: number | null; height: number | null };

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
  const put = await fetch(uploadUrl, { method: 'PUT', headers, body: file });
  if (!put.ok) throw { code: 'UPLOAD_MISMATCH', message: 'Tải tệp chưa hoàn tất. Hãy thử lại.' };
  return api<MediaRef>(`/orgs/${orgId}/media/${mediaId}/complete`, { method: 'POST', json: await imageSize(file) });
}
