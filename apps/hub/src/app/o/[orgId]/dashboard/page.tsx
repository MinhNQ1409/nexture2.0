import Link from "next/link";
import { Circle, CircleCheck, ImagePlus } from "lucide-react";
import { ROLE_LABELS } from "@nexture/contracts";
import { getOrg } from "@nexture/core";
import { Alert, Badge, Card } from "@/components/ui";
import { DemoButton } from "@/components/demo-button";
import { requirePageCtx } from "@/lib/session";

const CHECKLIST = [
  ["hasFounder", "Người sáng lập và câu chuyện hình thành", "people?founder=1"],
  ["hasEvents", "Ít nhất 3 cột mốc trên Culture Timeline", "events"],
  ["hasPeople", "Con người tiêu biểu", "people"],
  ["hasCultureStory", "Câu chuyện văn hóa", "stories"],
  ["hasProduct", "Sản phẩm hoặc dự án", "products"],
] as const;

export default async function Dashboard({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ created?: string; demo?: string }>;
}) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const sp = await searchParams;
  const created = sp.created === "1";
  const demo = sp.demo === "1";
  const done = CHECKLIST.filter(([k]) => org.onboarding[k]).length;

  return (
    // standard-content
    <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
      {created && (
        <Alert tone="success">Đã tạo Culture Hub cho {org.name}.</Alert>
      )}
      {demo && (
        <Alert tone="success">
          Đã tạo doanh nghiệp demo với đủ câu chuyện, sự kiện, con người, sản
          phẩm ở mọi trạng thái, thành viên, giá trị văn hóa và hồ sơ đang hiển
          thị trên Culture Atlas.
          {org.atlasUrl && (
            <>
              {" "}
              <a
                href={org.atlasUrl}
                target="_blank"
                rel="noopener"
                className="underline"
              >
                Xem trên Atlas
              </a>
            </>
          )}
        </Alert>
      )}

      <section className="rounded-xl border border-hairline bg-canvas-white p-8 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-heading-lg md:text-display-md">
            Chào mừng tới Culture Hub
          </h1>
          <Badge tone="info">{ROLE_LABELS[org.myRole]}</Badge>
        </div>
        <p className="mt-2 max-w-reading text-body-lg text-ink-mute">
          Đây là nơi lưu giữ câu chuyện, cột mốc và con người làm nên văn hóa
          của {org.name}. Bắt đầu với vài mục dưới đây.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading-md">Bắt đầu xây dựng Culture Hub</h2>
            <span className="tabular whitespace-nowrap text-caption text-ink-mute">
              {done}/{CHECKLIST.length} mục
            </span>
          </div>
          <ul className="mt-3 flex flex-col">
            {CHECKLIST.map(([k, label, href]) => {
              const ok = org.onboarding[k];
              const Icon = ok ? CircleCheck : Circle;
              return (
                <li
                  key={k}
                  className="flex items-center gap-3 border-b border-hairline py-3 last:border-b-0"
                >
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    aria-hidden
                    className={ok ? "text-success" : "text-ink-subtle"}
                  />
                  <Link
                    href={`/o/${orgId}/${href}`}
                    className={`${ok ? "text-ink" : "text-ink-mute"} hover:text-primary`}
                  >
                    {label}
                  </Link>
                  <span className="sr-only">{ok ? "đã xong" : "chưa làm"}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="self-start lg:col-span-4">
          <h2 className="text-heading-md">Xem thử với dữ liệu mẫu</h2>
          <p className="mt-2 text-body-md text-ink-mute">
            Tạo một doanh nghiệp demo có sẵn sự kiện, thành viên và hồ sơ trên
            Culture Atlas để trải nghiệm mọi tính năng.
          </p>
          <div className="mt-4">
            <DemoButton />
          </div>
        </Card>

        {!org.logoMediaId && (
          <section className="self-start rounded-xl bg-surface-dark p-8 text-on-dark lg:col-span-4">
            <ImagePlus size={32} strokeWidth={1.5} aria-hidden />
            <h2 className="mt-4 text-heading-md">
              Hoàn tất hồ sơ doanh nghiệp
            </h2>
            <p className="mt-2 text-body-md text-on-dark-mute">
              Thêm logo, năm thành lập, ngành và mô tả ngắn để hồ sơ sẵn sàng
              lên Culture Atlas.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
