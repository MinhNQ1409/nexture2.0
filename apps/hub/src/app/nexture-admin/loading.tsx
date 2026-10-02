// Shown instantly while a Hub page renders on the server; the sidebar and topbar stay in place.
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải…</span>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 rounded-md bg-canvas-section" />
          <div className="h-4 w-96 max-w-full rounded-md bg-canvas-section" />
        </div>
        <div className="h-11 w-36 rounded-md bg-canvas-section" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-md bg-canvas-section" />
        <div className="h-11 w-40 rounded-md bg-canvas-section" />
      </div>
      <div className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-canvas-white">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-hairline p-4 last:border-b-0">
            <div className="size-10 rounded-md bg-canvas-section" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/2 rounded bg-canvas-section" />
              <div className="h-3 w-1/3 rounded bg-canvas-section" />
            </div>
            <div className="h-6 w-20 rounded-pill bg-canvas-section" />
          </div>
        ))}
      </div>
    </div>
  );
}
