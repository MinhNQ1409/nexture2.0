import { requirePageCtx } from '@/lib/session';
import { NewOrgWizard } from './wizard';
import { Card } from '@/components/ui';
import { DemoButton } from '@/components/demo-button';

export default async function NewOrgPage() {
  await requirePageCtx('/new-org');
  return (
    <main className="mx-auto w-full max-w-[760px] p-4 md:p-6">
      <Card className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-heading-sm">Chỉ muốn xem thử?</h2>
          <p className="text-body-md text-ink-mute">Nạp ngay hồ sơ song ngữ của Vinamilk, FPT và Vingroup để trải nghiệm mọi tính năng.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DemoButton set="corps" />
        </div>
      </Card>
      <NewOrgWizard />
    </main>
  );
}
