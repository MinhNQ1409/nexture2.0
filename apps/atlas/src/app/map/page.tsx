// Company map: one dot per province with a company count; the list beside it shows the picked province.
import type { Metadata } from 'next';
import { PROVINCE_COORDS, provinceName, provinceNameEn } from '@nexture/contracts';
import { getMapCompanies, type MapCompany } from '@/lib/queries';
import { getT } from '@/lib/i18n';
import { MapView, type MapProvince } from './map-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.mapTitle} · Culture Atlas`, description: t.mapDesc };
}

export default async function MapPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const [{ lang, t }, sp] = await Promise.all([getT(), searchParams]);
  const companies = await getMapCompanies(lang);
  const byCode = new Map<string, MapCompany[]>();
  for (const c of companies) {
    if (!PROVINCE_COORDS[c.provinceCode]) continue;
    byCode.set(c.provinceCode, [...(byCode.get(c.provinceCode) ?? []), c]);
  }
  const provinces: MapProvince[] = [...byCode.entries()]
    .map(([code, list]) => ({
      code,
      name: (lang === 'en' ? provinceNameEn(code) : provinceName(code)) ?? code,
      at: PROVINCE_COORDS[code]!,
      companies: list.map((c) => ({ slug: c.slug, name: c.name, logoUrl: c.logoUrl, meta: [c.industryName, c.foundedYear && t.since(c.foundedYear)].filter(Boolean).join(' · '), shortDesc: c.shortDesc })),
    }))
    .sort((x, y) => y.companies.length - x.companies.length || x.name.localeCompare(y.name, lang));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-md">{t.mapTitle}</h1>
        <p className="max-w-reading text-body-lg text-ink-mute">{t.mapDesc}</p>
      </div>
      <MapView
        key={lang}
        provinces={provinces}
        initial={sp.p && byCode.has(sp.p) ? sp.p : null}
        labels={{
          pick: t.mapPick,
          empty: t.mapEmpty,
          count: t.mapProvinces(provinces.length),
          all: t.mapAll,
          viewList: t.mapViewList,
          companies: t.companiesN('{n}'),
          loading: t.loading,
          hoangSa: t.hoangSa,
          truongSa: t.truongSa,
          bienDong: t.bienDong,
        }}
      />
    </div>
  );
}
