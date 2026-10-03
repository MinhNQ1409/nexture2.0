import Link from "next/link";
import { ArrowRight, Circle, CircleCheck, ClipboardCheck, ImagePlus } from "lucide-react";
import { ACTIVITY_LABELS, ROLE_LABELS, TARGET_TYPE_LABELS } from "@nexture/contracts";
import { canOrg, listActivity, reviewQueue } from "@nexture/core";
import { activityHref, relativeTime } from "@/lib/activity";
import { Alert, Badge, Card } from "@/components/ui";
import { DemoButton } from "@/components/demo-button";
import { orgOf, requirePageCtx } from "@/lib/session";

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
  const org = await orgOf(ctx, orgId);
  const sp = await searchParams;
  const created = sp.created === "1";
  const demo = sp.demo === "1";
  const done = CHECKLIST.filter(([k]) => org.onboarding[k]).length;
  const [pending, activity] = await Promise.all([
    canOrg(org.myRole, "review.view") ? reviewQueue(ctx, orgId).then((r) => r.items.length) : null,
    canOrg(org.myRole, "activity.view") ? listActivity(ctx, orgId, { pageSize: 10 }).then((r) => r.items) : null,
  ]);

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
            Nạp hồ sơ mẫu của Vinamilk, FPT và Vingroup, có sẵn sự kiện, câu
            chuyện, con người và hồ sơ trên Culture Atlas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <DemoButton set="corps" />
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

        {pending !== null && pending > 0 && (
          <Link
            href={`/o/${orgId}/review`}
            className="flex items-center gap-4 self-start rounded-xl border border-hairline bg-canvas-white p-6 shadow-card hover:border-primary lg:col-span-4"
          >
            <ClipboardCheck size={28} strokeWidth={1.5} aria-hidden className="shrink-0 text-warning" />
            <span className="flex-1">
              <span className="block text-heading-sm">{pending} mục đang chờ duyệt</span>
              <span className="block text-body-md text-ink-mute">Mở hàng chờ duyệt</span>
            </span>
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        )}

        {activity && activity.length > 0 && (
          <Card className="lg:col-span-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-heading-md">Hoạt động gần đây</h2>
              <Link href={`/o/${orgId}/settings/activity`} className="text-body-md text-link underline">
                Xem tất cả
              </Link>
            </div>
            <ul className="mt-3 flex flex-col">
              {activity.map((a) => {
                const href = activityHref(orgId, a.targetType, a.targetId, a.action);
                return (
                  <li key={a.id} className="border-b border-hairline py-2 text-body-md last:border-b-0">
                    <span className="font-semibold">{a.actor?.name ?? "Hệ thống"}</span> {ACTIVITY_LABELS[a.action] ?? a.action}{" "}
                    <span className="text-ink-mute">{TARGET_TYPE_LABELS[a.targetType] ?? ""} </span>
                    {href ? (
                      <Link href={href} className="text-link hover:underline">
                        {a.targetLabel}
                      </Link>
                    ) : (
                      a.targetLabel
                    )}
                    <span className="text-caption text-ink-mute"> · {relativeTime(a.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
