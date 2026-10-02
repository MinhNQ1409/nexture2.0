// Bold the part of a title that matches the query, ignoring Vietnamese accents (06 §13).
const fold = (c: string) =>
  c
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

export function Highlight({ text, q }: { text: string; q: string }) {
  const needle = fold(q.trim());
  if (!needle) return <>{text}</>;
  // Fold char by char so indexes in the folded string map back to the original.
  const chars = [...text];
  const folded = chars.map(fold);
  const flat = folded.join('');
  const at = flat.indexOf(needle);
  if (at < 0) return <>{text}</>;
  let pos = 0;
  let start = -1;
  let end = chars.length;
  for (let i = 0; i < chars.length; i++) {
    if (start < 0 && pos + folded[i]!.length > at) start = i;
    pos += folded[i]!.length;
    if (pos >= at + needle.length) {
      end = i + 1;
      break;
    }
  }
  return (
    <>
      {chars.slice(0, start).join('')}
      <strong className="font-bold text-ink">{chars.slice(start, end).join('')}</strong>
      {chars.slice(end).join('')}
    </>
  );
}
