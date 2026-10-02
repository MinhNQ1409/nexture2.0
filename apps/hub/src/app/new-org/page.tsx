import { requirePageCtx } from '@/lib/session';
import { NewOrgWizard } from './wizard';

export default async function NewOrgPage() {
  await requirePageCtx('/new-org');
  return (
    <main className="mx-auto w-full max-w-[760px] p-4 md:p-6">
      <NewOrgWizard />
    </main>
  );
}
