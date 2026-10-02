import { Flag } from "lucide-react";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@nexture/contracts";
import { canOrg, listEvents } from "@nexture/core";
import { ContentList } from "@/components/content-list";
import { Select } from "@/components/ui";
import { orgOf, requirePageCtx } from "@/lib/session";

export default async function EventsPage({
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
      collection="events"
      title="Sự kiện"
      description="Các cột mốc trên hành trình của doanh nghiệp."
      addLabel="Thêm sự kiện"
      noun="sự kiện"
      icon={Flag}
      column="Sự kiện"
      dateColumn="Thời gian"
      canCreate={canOrg(org.myRole, "content.create")}
      showStatus={org.myRole !== "VIEWER"}
      sp={sp}
      filterKeys={["eventType"]}
      filters={
        <div className="w-48">
          <Select
            name="eventType"
            defaultValue={sp.eventType ?? ""}
            aria-label="Loại sự kiện"
          >
            <option value="">Mọi loại</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      }
      list={await listEvents(ctx, orgId, sp)}
    />
  );
}
