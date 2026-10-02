import { requirePageCtx } from '@/lib/session';
import { NewOrgWizard } from './wizard';

export default async function NewOrgPage() {
  await requirePageCtx('/new-org');
  return (
    <main className="mx-auto max-w-2xl p-6">
      <NewOrgWizard />
    </main>
  );
}
