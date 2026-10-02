// Plain GET form: works without JavaScript.
import { Search } from 'lucide-react';

export function SearchBox({ q = '', type, large }: { q?: string; type?: string | null; large?: boolean }) {
  return (
    <form action="/search" role="search" className="flex w-full max-w-2xl gap-2">
      <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-md border border-hairline-strong bg-canvas-white px-4 focus-within:border-primary">
        <Search size={large ? 20 : 16} strokeWidth={1.5} className="shrink-0 text-ink-mute" aria-hidden />
        <input
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder="Tìm doanh nghiệp, câu chuyện, con người, sản phẩm"
          aria-label="Từ khóa tìm kiếm"
          className="w-full bg-transparent text-body-lg outline-none"
        />
      </label>
      {type && <input type="hidden" name="type" value={type} />}
      <button type="submit" className="rounded-md bg-primary px-5 text-body-md font-semibold text-on-primary hover:bg-primary-dark">
        Tìm
      </button>
    </form>
  );
}
