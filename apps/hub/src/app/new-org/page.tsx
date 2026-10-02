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
          <p className="text-body-md text-ink-mute">Tạo ngay một doanh nghiệp demo có đủ dữ liệu, không cần điền gì.</p>
        </div>
        <DemoButton />
      </Card>
      <NewOrgWizard />
    </main>
  );
}
