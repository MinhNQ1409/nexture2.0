import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, UserRound } from 'lucide-react';
import { eventDate } from '@/lib/dates';
import { getEntity } from '@/lib/queries';
import { EntityView } from '../../entity-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEntity('PERSON', (await params).slug);
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: [e.subtitle, e.companyName].filter(Boolean).join(' · ') } : {};
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEntity('PERSON', (await params).slug);
  if (!e) notFound();
  const founder = e.extra.isFounder === true;
  const contributions = (e.extra.contributionsHtml as string | null | undefined) ?? null;
  const joined = eventDate(e.sortDate, e.datePrecision);
  const left = eventDate(e.endDate, e.endDatePrecision);
  const tenure = joined ? (left ? `${joined} – ${left}` : `Từ ${joined}`) : '';
  return (
    <EntityView
      e={e}
      label={founder ? 'Người sáng lập' : null}
      meta={
        <>
          <li className="inline-flex items-center gap-2">
            <UserRound size={16} strokeWidth={1.5} aria-hidden />
            {e.subtitle ?? 'Thành viên'}
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
          <h2 className="text-heading-md">Đóng góp nổi bật</h2>
          <div className="rich-text text-body-lg" dangerouslySetInnerHTML={{ __html: contributions }} />
        </section>
      )}
    </EntityView>
  );
}
