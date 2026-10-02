import { canOrg, getOrg, listPeople, listValues, timeline } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { TimelineView } from './view';

export default async function TimelinePage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const [data, people, values] = await Promise.all([timeline(ctx, orgId), listPeople(ctx, orgId, { pageSize: 100, sort: 'name_asc' }), listValues(ctx, orgId)]);
  return (
    <TimelineView
      orgId={orgId}
      canSeeUnverified={org.myRole !== 'VIEWER'}
      canCreate={canOrg(org.myRole, 'content.create')}
      initial={JSON.parse(JSON.stringify(data.years))}
      people={people.items.map((p) => ({ id: p.id, name: p.title }))}
      values={values.items.map((v) => ({ id: v.id, name: v.nameVi }))}
    />
  );
}
