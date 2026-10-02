import { BookOpen } from "lucide-react";
import { STORY_TYPE_LABELS, STORY_TYPES } from "@nexture/contracts";
import { canOrg, listStories } from "@nexture/core";
import { ContentList } from "@/components/content-list";
import { Select } from "@/components/ui";
import { orgOf, requirePageCtx } from "@/lib/session";

export default async function StoriesPage({
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
      collection="stories"
      title="Câu chuyện"
      description="Câu chuyện doanh nghiệp, người sáng lập, văn hóa, con người và sản phẩm."
      addLabel="Thêm câu chuyện"
      noun="câu chuyện"
      icon={BookOpen}
      column="Câu chuyện"
      dateColumn="Thời điểm"
      canCreate={canOrg(org.myRole, "content.create")}
      showStatus={org.myRole !== "VIEWER"}
      sp={sp}
      filterKeys={["storyType"]}
      filters={
        <div className="w-56">
          <Select
            name="storyType"
            defaultValue={sp.storyType ?? ""}
            aria-label="Loại câu chuyện"
          >
            <option value="">Mọi loại</option>
            {STORY_TYPES.map((t) => (
              <option key={t} value={t}>
                {STORY_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      }
      list={await listStories(ctx, orgId, sp)}
    />
  );
}
