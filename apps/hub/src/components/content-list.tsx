// Shared list screen for Story, Event, Person, Product (06 §6).
import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";
import {
  formatFuzzyDate,
  type ContentStatus,
  type Visibility,
} from "@nexture/contracts";
import {
  PublicStateBadge,
  StatusBadge,
  VisibilityBadge,
  type PublicStateValue,
} from "@/components/badges";
import {
  PageHeader,
  Select,
  linkButton,
  tableHead,
  tableRow,
} from "@/components/ui";
import Form from 'next/form';

type Fuzzy = { date: string; precision: "YEAR" | "MONTH" | "DAY" } | null;
export type ListItem = {
  id: string;
  title: string;
  subtitle: string | null;
  date: Fuzzy;
  endDate: Fuzzy;
  status: ContentStatus;
  visibility: Visibility;
  publicState: PublicStateValue;
  updatedAt: Date;
  thumbnailUrl?: string | null;
};

export function ContentList(props: {
  orgId: string;
  collection: string;
  title: string;
  description: string;
  addLabel: string;
  noun: string;
  icon: LucideIcon;
  /** Header of the first column ("Câu chuyện", "Người"...). */
  column: string;
  dateColumn: string;
  canCreate: boolean;
  showStatus: boolean;
  sp: Record<string, string>;
  /** Kind-specific filter controls inside the filter form. */
  filters?: React.ReactNode;
  filterKeys: string[];
  list: { items: ListItem[]; total: number };
}) {
  const { orgId, collection, sp, list, icon: Icon } = props;
  const base = `/o/${orgId}/${collection}`;
  const filtered = ["q", "status", "visibility", ...props.filterKeys].some(
    (k) => sp[k],
  );

  return (
    // workspace-content
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PageHeader
        title={props.title}
        description={props.description}
        action={
          props.canCreate && (
            <Link href={`${base}/new`} className={linkButton()}>
              <Plus size={20} strokeWidth={1.5} aria-hidden />
              {props.addLabel}
            </Link>
          )
        }
      />
      <Form className="flex flex-wrap gap-2" action={base}>
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Tìm trong danh sách"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-hairline bg-canvas-white px-3 text-body-md md:max-w-sm"
        />
        {props.showStatus && (
          <div className="w-44">
            <Select
              name="status"
              defaultValue={sp.status ?? ""}
              aria-label="Trạng thái"
            >
              <option value="">Mọi trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="PENDING_REVIEW">Chờ duyệt</option>
              <option value="VERIFIED">Đã xác minh</option>
            </Select>
          </div>
        )}
        <div className="w-40">
          <Select
            name="visibility"
            defaultValue={sp.visibility ?? ""}
            aria-label="Hiển thị"
          >
            <option value="">Mọi chế độ</option>
            <option value="PRIVATE">Riêng tư</option>
            <option value="INTERNAL">Nội bộ</option>
            <option value="PUBLIC">Công khai</option>
          </Select>
        </div>
        {props.filters}
        <button className={linkButton("secondary")}>Lọc</button>
      </Form>

      {list.items.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-lg border border-hairline bg-canvas-white p-12 text-center">
          <Icon
            size={32}
            strokeWidth={1.5}
            className="text-ink-subtle"
            aria-hidden
          />
          <p className="text-body-lg text-ink-mute">
            {filtered
              ? "Không có kết quả phù hợp."
              : `Chưa có ${props.noun} nào ở đây.`}
          </p>
          {filtered ? (
            <Link
              href={base}
              className="text-link underline hover:text-link-hover"
            >
              Xóa bộ lọc
            </Link>
          ) : (
            props.canCreate && (
              <Link href={`${base}/new`} className={linkButton()}>
                {props.addLabel}
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas-white shadow-card">
          <table className="w-full min-w-[760px] text-body-md">
            <thead className={tableHead}>
              <tr>
                <th>{props.column}</th>
                <th>{props.dateColumn}</th>
                <th>Trạng thái</th>
                <th>Hiển thị</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((e) => (
                <tr
                  key={e.id}
                  className={`${tableRow} border-l-4 ${e.status === "DRAFT" ? "border-l-hairline" : "border-l-primary"}`}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      {e.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img loading="lazy" decoding="async" src={e.thumbnailUrl} alt="" className="size-10 shrink-0 rounded-md border border-hairline object-cover" />
                      ) : (
                        <span className="size-10 shrink-0 rounded-md bg-canvas-section" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`${base}/${e.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {e.title}
                        </Link>
                        {e.subtitle && (
                          <p className="text-caption text-ink-mute">{e.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="tabular whitespace-nowrap">
                    {formatFuzzyDate(e.date)}
                    {e.endDate && ` – ${formatFuzzyDate(e.endDate)}`}
                  </td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <VisibilityBadge visibility={e.visibility} />
                      <PublicStateBadge state={e.publicState} />
                    </div>
                  </td>
                  <td className="tabular whitespace-nowrap text-ink-mute">
                    {e.updatedAt.toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tabular border-t border-hairline px-4 py-3 text-caption text-ink-mute">
            {list.total.toLocaleString("vi-VN")} {props.noun}
          </p>
        </div>
      )}
    </div>
  );
}
