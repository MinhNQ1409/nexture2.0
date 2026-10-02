import { Package } from "lucide-react";
import { PP_KIND_LABELS, PP_KINDS } from "@nexture/contracts";
import { canOrg, getOrg, listProducts } from "@nexture/core";
import { ContentList } from "@/components/content-list";
import { Select } from "@/components/ui";
import { requirePageCtx } from "@/lib/session";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { orgId } = await params;
  const sp = await searchParams;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  return (
    <ContentList
      orgId={orgId}
      collection="products"
      title="Sản phẩm & Dự án"
      description="Những gì doanh nghiệp làm ra và các dự án đã thực hiện."
      addLabel="Thêm sản phẩm hoặc dự án"
      noun="sản phẩm và dự án"
      icon={Package}
      column="Tên"
      dateColumn="Ra mắt / khởi động"
      canCreate={canOrg(org.myRole, "content.create")}
      showStatus={org.myRole !== "VIEWER"}
      sp={sp}
      filterKeys={["kind"]}
      filters={
        <div className="w-44">
          <Select name="kind" defaultValue={sp.kind ?? ""} aria-label="Loại">
            <option value="">Sản phẩm và dự án</option>
            {PP_KINDS.map((k) => (
              <option key={k} value={k}>
                {PP_KIND_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
      }
      list={await listProducts(ctx, orgId, sp)}
    />
  );
}
