// Instant placeholder while an Atlas page renders; the header stays in place.
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-3">
        <div className="h-10 w-2/3 max-w-[560px] rounded-md bg-canvas-section" />
        <div className="h-5 w-full max-w-[640px] rounded-md bg-canvas-section" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-white p-5">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-md bg-canvas-section" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 rounded bg-canvas-section" />
                <div className="h-3 w-1/2 rounded bg-canvas-section" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-canvas-section" />
            <div className="h-3 w-5/6 rounded bg-canvas-section" />
          </div>
        ))}
      </div>
    </div>
  );
}
