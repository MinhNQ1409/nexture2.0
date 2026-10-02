'use client';
// Leaflet + OpenStreetMap tiles (no API key). Leaflet touches `window`, so it is imported only in the browser.
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, MapPin, X } from 'lucide-react';
import type { Map as LeafletMap, Marker } from 'leaflet';

export type MapProvince = {
  code: string;
  name: string;
  at: [number, number];
  companies: { slug: string; name: string; logoUrl: string | null; meta: string; shortDesc: string | null }[];
};
type Labels = { pick: string; empty: string; count: string; all: string; viewList: string; companies: string; loading: string; hoangSa: string; truongSa: string; bienDong: string };

// Mainland plus both archipelagos.
const VIETNAM: [[number, number], [number, number]] = [
  [8.2, 102.1],
  [23.4, 115.0],
];
const SEA_LABELS = (l: Labels): [string, [number, number], string][] => [
  [l.hoangSa, [16.5, 111.9], 'map-label-islands'],
  [l.truongSa, [9.6, 114.0], 'map-label-islands'],
  [l.bienDong, [13.4, 112.6], 'map-label-sea'],
];

function dotHtml(n: number, active: boolean) {
  const size = Math.round(Math.min(56, 28 + Math.sqrt(n) * 6));
  const tone = active ? 'bg-accent ring-4 ring-accent-light' : 'bg-primary ring-2 ring-canvas-white';
  return `<span class="map-dot ${tone}" style="width:${size}px;height:${size}px;margin-left:-${size / 2}px;margin-top:-${size / 2}px">${n}</span>`;
}

export function MapView({ provinces, initial, labels }: { provinces: MapProvince[]; initial: string | null; labels: Labels }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(initial);
  const pick = useRef<(code: string | null) => void>(() => {});
  pick.current = (code) => {
    setSelected(code);
    const u = new URL(window.location.href);
    if (code) u.searchParams.set('p', code);
    else u.searchParams.delete('p');
    window.history.replaceState(null, '', u);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const L = (await import('leaflet')).default;
      if (!alive || !box.current || map.current) return;
      const m = L.map(box.current, { zoomSnap: 0.25, minZoom: 4, maxZoom: 12, scrollWheelZoom: false, attributionControl: true });
      m.fitBounds(VIETNAM, { padding: [8, 8] });
      m.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(m);
      for (const [text, at, cls] of SEA_LABELS(labels)) {
        L.marker(at, { interactive: false, keyboard: false, icon: L.divIcon({ className: cls, html: `<span>${text}</span>`, iconSize: undefined }) }).addTo(m);
      }
      for (const p of provinces) {
        const mk = L.marker(p.at, {
          title: `${p.name}: ${p.companies.length}`,
          alt: p.name,
          riseOnHover: true,
          icon: L.divIcon({ className: 'map-dot-wrap', html: dotHtml(p.companies.length, p.code === initial), iconSize: undefined }),
        })
          .on('click', () => pick.current(p.code))
          .addTo(m);
        markers.current.set(p.code, mk);
      }
      m.on('focus', () => m.scrollWheelZoom.enable());
      m.on('blur', () => m.scrollWheelZoom.disable());
      map.current = m;
      setReady(true);
    })();
    return () => {
      alive = false;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
    };
    // Built once; selection changes only restyle the markers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    import('leaflet').then(({ default: L }) => {
      for (const p of provinces) {
        const mk = markers.current.get(p.code);
        mk?.setIcon(L.divIcon({ className: 'map-dot-wrap', html: dotHtml(p.companies.length, p.code === selected), iconSize: undefined }));
        mk?.setZIndexOffset(p.code === selected ? 1000 : 0);
      }
    });
    const p = provinces.find((x) => x.code === selected);
    // Only move the map when the picked dot is out of view, so the rest of the country stays in sight.
    if (p && map.current && !map.current.getBounds().pad(-0.1).contains(p.at)) map.current.panTo(p.at, { animate: true });
  }, [selected, ready, provinces]);

  const current = provinces.find((p) => p.code === selected) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-lg border border-hairline bg-canvas-section lg:h-[680px]">
        <div ref={box} className="absolute inset-0" />
        {!ready && <div className="absolute inset-0 flex items-center justify-center text-body-md text-ink-mute">{labels.loading}</div>}
      </div>
      <aside className="flex max-h-[680px] flex-col overflow-hidden rounded-lg border border-hairline bg-canvas-white shadow-card">
        {current ? (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-hairline p-4">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 font-display text-heading-md">
                  <MapPin size={20} strokeWidth={1.5} aria-hidden className="text-primary" />
                  {current.name}
                </p>
                <p className="text-caption text-ink-mute">{labels.companies.replace('{n}', String(current.companies.length))}</p>
              </div>
              <button type="button" onClick={() => pick.current(null)} aria-label={labels.all} title={labels.all} className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-mute hover:bg-canvas-section hover:text-ink">
                <X size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <ul className="flex flex-col overflow-y-auto">
              {current.companies.map((c) => (
                <li key={c.slug} className="border-b border-hairline last:border-b-0">
                  <Link href={`/companies/${c.slug}`} className="flex gap-3 p-4 transition-colors duration-[120ms] hover:bg-canvas-section">
                    {c.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logoUrl} alt="" loading="lazy" className="size-11 shrink-0 rounded-md object-contain" />
                    ) : (
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
                        <Building2 size={20} strokeWidth={1.5} aria-hidden />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-display text-heading-sm text-ink">{c.name}</span>
                      {c.meta && <span className="block truncate text-caption text-ink-mute">{c.meta}</span>}
                      {c.shortDesc && <span className="mt-1 line-clamp-2 block text-body-md text-ink-mute">{c.shortDesc}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/companies?province=${current.code}`} className="mt-auto inline-flex items-center gap-2 border-t border-hairline p-4 text-body-md font-semibold text-primary hover:text-primary-dark">
              {labels.viewList}
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <div className="border-b border-hairline p-4">
              <p className="font-display text-heading-md">{labels.all}</p>
              <p className="text-caption text-ink-mute">{provinces.length ? labels.count : labels.empty}</p>
            </div>
            {provinces.length > 0 && <p className="px-4 pt-3 text-body-md text-ink-mute">{labels.pick}</p>}
            <ul className="flex flex-col overflow-y-auto p-2">
              {provinces.map((p) => (
                <li key={p.code}>
                  <button type="button" onClick={() => pick.current(p.code)} className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-body-md hover:bg-canvas-section">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} strokeWidth={1.5} aria-hidden className="text-primary" />
                      {p.name}
                    </span>
                    <span className="tabular rounded-full bg-primary-light px-2.5 text-caption font-semibold text-primary">{p.companies.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
