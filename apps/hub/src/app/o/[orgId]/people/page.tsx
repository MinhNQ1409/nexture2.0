import { Users } from "lucide-react";
import { canOrg, listPeople } from "@nexture/core";
import { ContentList } from "@/components/content-list";
import { orgOf, requirePageCtx } from "@/lib/session";

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { orgId } = await params;
  const sp = await searchParams;
  const ctx = await requirePageCtx();
  const org = await orgOf(ctx, orgId);
  return (
    <ContentList
      orgId={orgId}
      collection="people"
      title="Con người"
      description="Người sáng lập và những người làm nên văn hóa doanh nghiệp."
      addLabel="Thêm người"
      noun="người"
      icon={Users}
      column="Họ tên"
      dateColumn="Gắn bó"
      canCreate={canOrg(org.myRole, "content.create")}
      showStatus={org.myRole !== "VIEWER"}
      sp={sp}
      filterKeys={["founder"]}
      filters={
        <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-hairline bg-canvas-white px-3 text-body-md">
          <input
            type="checkbox"
            name="founder"
            value="1"
            defaultChecked={sp.founder === "1"}
            className="size-4 accent-primary"
          />
          Chỉ người sáng lập
        </label>
      }
      list={await listPeople(ctx, orgId, sp)}
    />
  );
}
