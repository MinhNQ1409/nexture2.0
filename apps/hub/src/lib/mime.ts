export function contentType(key: string) {
  const ext = key.split('.').pop()?.toLowerCase();
  return (
    { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf', mp4: 'video/mp4', mp3: 'audio/mpeg', wav: 'audio/wav' } as Record<string, string>
  )[ext ?? ''] ?? 'application/octet-stream';
}
