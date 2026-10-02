import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, UserRound } from 'lucide-react';
import { eventDate } from '@/lib/dates';
import { getEntity } from '@/lib/queries';
import { EntityView } from '../../entity-view';
import { getLang, getT } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEntity('PERSON', (await params).slug, await getLang());
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: [e.subtitle, e.companyName].filter(Boolean).join(' · ') } : {};
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { lang, t } = await getT();
  const e = await getEntity('PERSON', (await params).slug, lang);
  if (!e) notFound();
  const founder = e.extra.isFounder === true;
  const contributions = (e.extra.contributionsHtml as string | null | undefined) ?? null;
  const joined = eventDate(e.sortDate, e.datePrecision, null, null, lang);
  const left = eventDate(e.endDate, e.endDatePrecision, null, null, lang);
  const tenure = joined ? (left ? `${joined} – ${left}` : t.fromDate(joined)) : '';
  return (
    <EntityView
      e={e}
      label={founder ? t.founder : null}
      meta={
        <>
          <li className="inline-flex items-center gap-2">
            <UserRound size={16} strokeWidth={1.5} aria-hidden />
            {e.subtitle ?? t.member}
          </li>
          {tenure && (
            <li className="inline-flex items-center gap-2">
              <CalendarDays size={16} strokeWidth={1.5} aria-hidden />
              {tenure}
            </li>
          )}
        </>
      }
    >
      {contributions && (
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-md">{t.contributions}</h2>
          <div className="rich-text text-body-lg" dangerouslySetInnerHTML={{ __html: contributions }} />
        </section>
      )}
    </EntityView>
  );
}
