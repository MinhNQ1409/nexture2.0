# 08. Đồng bộ dữ liệu công khai sang Atlas

Mục tiêu: `atlas.*` luôn phản ánh đúng tập nội dung thỏa `isPublic` (`04-trang-thai.md` §3), chỉ chứa trường được phép công khai, và được cập nhật trong **cùng transaction** với thay đổi gốc.

Toàn bộ code nằm trong `packages/core/src/public/`. Không nơi nào khác được ghi vào schema `atlas`.

## 1. API nội bộ

```ts
// Gọi trong transaction của mọi thay đổi có thể ảnh hưởng dữ liệu công khai.
syncPublic(tx, scope: SyncScope): Promise<RevalidateTag[]>

type SyncScope =
  | { kind: 'entity'; type: EntityType; id: string }   // một nội dung (kể cả media)
  | { kind: 'org'; orgId: string }                     // toàn bộ tổ chức

// Gọi SAU commit với các tag thu được.
flushRevalidate(tags: RevalidateTag[]): Promise<void>
```

Thao tác → scope:

| Thao tác | Scope |
|---|---|
| Tạo/sửa/xóa/đổi trạng thái/đổi visibility một Story/Event/Person/Product | `entity` của nó |
| Sửa quan hệ của X | `entity` X **và** `entity` của từng nội dung được thêm/bớt |
| Sửa ảnh kèm / ảnh bìa / avatar / nguồn của X | `entity` X |
| Sửa/xóa/đổi visibility/duyệt một media | `entity` của **mọi** nội dung đang tham chiếu media đó; nếu là logo thì `org` |
| Sửa hồ sơ tổ chức, bật/tắt Atlas, giá trị văn hóa, Story nổi bật | `org` |
| NexTure ẩn/bỏ ẩn nội dung | `entity` |
| NexTure ẩn/bỏ ẩn tổ chức | `org` |

Để đơn giản và tránh sót, triển khai MVP của `syncPublic` với scope `entity` NÊN là: đồng bộ nội dung đó + **tính lại toàn bộ `atlas.relations` và `atlas.companies` của tổ chức**. Quy mô MVP (≤ vài nghìn nội dung/tổ chức) cho phép điều này.

## 2. Thuật toán `syncEntity(tx, type, id)`

```
1. Tải X từ core (kể cả đã xóa mềm) + org.
2. Nếu isPublic(X, org):
     0. rebuildCompany(tx, org.id) để chắc chắn dòng atlas.companies tồn tại (FK của atlas.entities).
     a. Nếu X.public_slug NULL: gán slug (§5) và UPDATE core.<table> SET public_slug.
     b. Dựng dòng atlas.entities theo §3.
     c. UPSERT atlas.entities (ON CONFLICT (id) DO UPDATE).
        published_at: giữ giá trị cũ nếu đã có, ngược lại now().
     d. DELETE FROM atlas.tombstones WHERE path = đường dẫn của X.
     e. Đồng bộ media của X (§4).
   Ngược lại:
     a. Nếu atlas.entities có dòng id = X.id:
          DELETE dòng đó (cascade xóa relations, entity_media).
          INSERT atlas.tombstones(path, now()) ON CONFLICT DO UPDATE SET removed_at = now().
     b. Dọn media không còn được tham chiếu (§4).
3. rebuildRelations(tx, org.id)        (§6)
4. rebuildCompany(tx, org.id)          (§7; chạy lại để cập nhật public_entity_count, bỏ qua nếu org không public)
5. Trả tags: ['entity:<path>', 'company:<org.slug>', 'home', 'companies'] + path của các nội dung liên quan.
```

`syncOrg(tx, orgId)`:
```
Nếu org không public (atlas_enabled=false hoặc bị ẩn):
   Ghi tombstone cho /companies/<slug> và mọi path trong atlas.entities của org,
   DELETE FROM atlas.companies WHERE org_id (cascade toàn bộ), dọn media public của org.
Ngược lại:
   rebuildCompany; với mọi nội dung của org: syncEntity (bỏ qua bước 3–4, chạy 1 lần cuối).
```

## 3. Dữ liệu được công khai theo loại

**Danh sách trắng.** Trường không có trong bảng này KHÔNG BAO GIỜ được ghi vào `atlas.*`. Hằng số `PUBLIC_FIELDS` trong `packages/core/src/public/fields.ts` PHẢI khớp bảng này và có test so sánh.

| atlas.entities | STORY | EVENT | PERSON | PRODUCT_PROJECT |
|---|---|---|---|---|
| `entity_type` | `STORY` | `EVENT` | `PERSON` | `PRODUCT` hoặc `PROJECT` theo `kind` |
| `title` | `title_vi` | `title_vi` | `full_name` | `title_vi` |
| `subtitle` | nhãn `story_type` | nhãn `event_type` | `role_title_vi` | nhãn `kind` |
| `summary` | `summary_vi` | `summary_vi` | NULL | `summary_vi` |
| `body_html` | `content_vi` | `content_vi` | `bio_vi` | `description_vi` |
| `sort_date`, `date_precision` | `story_date*` | `start_date*` | `joined_date*` | `launch_date*` |
| `end_date`, `end_date_precision` | NULL | `end_date*` | `left_date*` | NULL |
| `extra` | `{ "values": string[] }` (§6) | `{ "values": string[], "eventType": event_type }` | `{ "isFounder": bool, "contributionsHtml": contributions_vi }` | `{ "status": pp_status }` |
| `cover_url`, `cover_alt` | `cover_media_id` | `cover_media_id` | `avatar_media_id` | `cover_media_id` |

Chung cho mọi loại: `company_slug`, `company_name` từ org; `sources` = các `entity_sources` có `is_public = true` và chưa xóa, mỗi phần tử `{ title, url, note }` với `url` = link ngoài, hoặc **NULL nếu nguồn là media** (file nguồn gốc KHÔNG được công khai trong MVP, chỉ hiển thị tên); `search_text` = `f_search_norm(title || ' ' || coalesce(subtitle,'') || ' ' || coalesce(summary,'') || ' ' || company_name)`.

Không bao giờ công khai: `internal_notes`, `return_note`, `status`, `visibility`, mọi cột `*_by`, `*_en` (MVP chỉ tiếng Việt), `occurred_date`/`provided_by`/`source_note`/`tags` của media, email người dùng.

Ảnh bìa: chỉ dùng nếu media đủ điều kiện công khai (§4); không đủ thì `cover_url = NULL` (Atlas dùng ảnh placeholder).

## 4. Media công khai

Media M **đủ điều kiện công khai** khi: `M.deleted_at IS NULL`, `upload_status = READY`, `status = VERIFIED`, `visibility = PUBLIC`, `kind ∈ {IMAGE, VIDEO}`.

M **được đẩy lên Atlas** khi đủ điều kiện **và** được tham chiếu bởi ít nhất một nội dung đang public (là cover/avatar hoặc nằm trong `entity_media`), hoặc là logo của tổ chức đang public.

Đồng bộ media của X:
```
cho mỗi M thuộc (cover/avatar của X) ∪ (entity_media của X):
  nếu M đủ điều kiện:
     nếu M.public_storage_key NULL:
        key = 'public/' || M.id || '/' || basename(M.storage_key)
        R2 CopyObject private → public bucket (key), Cache-Control: public, max-age=31536000, immutable
        UPDATE core.media_assets SET public_storage_key = key
     UPSERT atlas.media(id=M.id, url=R2_PUBLIC_BASE_URL/key, ...)
ghi lại atlas.entity_media của X = các M đủ điều kiện trong entity_media của X (giữ sort_order, caption)
```

Dọn media (sau mỗi sync, cho các M liên quan):
```
nếu M không còn được đẩy lên Atlas (theo định nghĩa trên):
   DELETE atlas.media WHERE id = M.id
   R2 DeleteObject public bucket (M.public_storage_key); UPDATE public_storage_key = NULL
```

Thao tác R2 nằm trong transaction logic nhưng không rollback được. Quy tắc: **copy trước khi commit, xóa sau khi commit** (đưa danh sách key cần xóa vào kết quả `syncPublic`, `flushRevalidate` xóa chúng). Nếu transaction rollback sau khi copy, file public thừa vô hại vì không có dòng `atlas.media` trỏ tới. Lưu ý: URL file public là ngẫu nhiên theo UUID nên không đoán được.

`logo_url` của company: logo đủ điều kiện **trừ** yêu cầu `status=VERIFIED, visibility=PUBLIC` (logo luôn được coi là công khai khi tổ chức bật Atlas, vì là trường bắt buộc của hồ sơ). Nêu trong `12-cau-hoi-cho-po.md`.

## 5. Slug và đường dẫn

| Loại | Đường dẫn Atlas |
|---|---|
| Company | `/companies/{org.slug}` |
| STORY | `/stories/{public_slug}` |
| EVENT | `/events/{public_slug}` |
| PERSON | `/people/{public_slug}` |
| PRODUCT_PROJECT kind PRODUCT | `/products/{public_slug}` |
| PRODUCT_PROJECT kind PROJECT | `/projects/{public_slug}` |

- `public_slug` gán lần đầu nội dung public, theo `02-database-ghi-chu.md` §9, không đổi về sau.
- Đổi `kind` của Product/Project đang public: đường dẫn đổi từ `/products/x` sang `/projects/x`. Ghi tombstone cho đường dẫn cũ? **Không**: ghi vào `atlas.tombstones` sẽ trả 410; thay vào đó Atlas tra `atlas.entities` theo slug với type còn lại và **redirect 308** (xem `07-atlas-man-hinh.md` §9).

## 6. `rebuildRelations(tx, orgId)`

```
DELETE FROM atlas.relations WHERE from_id IN (SELECT id FROM atlas.entities WHERE org_id = :orgId);
INSERT INTO atlas.relations(from_id, to_id)
  SELECT r.source_id, r.target_id FROM core.relationships r
   WHERE r.organization_id = :orgId
     AND r.source_id IN (SELECT id FROM atlas.entities WHERE org_id = :orgId)
     AND r.target_id IN (SELECT id FROM atlas.entities WHERE org_id = :orgId)
  UNION
  SELECT r.target_id, r.source_id ... (cùng điều kiện)          -- chiều ngược
ON CONFLICT DO NOTHING;
```

Quan hệ tới `CULTURE_VALUE` không vào `atlas.relations` (giá trị không phải `atlas.entities`). Thay vào đó, khi dựng `atlas.entities` của Story/Event, ghi `extra.values = [name_vi của các giá trị có visibility PUBLIC được liên kết, theo sort_order]`. Vì vậy sửa/xóa/đổi visibility một giá trị văn hóa dùng scope `org` (đồng bộ lại mọi Story/Event của tổ chức).

## 7. `rebuildCompany(tx, orgId)`

Nếu tổ chức public: UPSERT `atlas.companies` với:
- Trường hồ sơ từ `organizations` (`short_desc` = `short_desc_vi`), `industry_name`/`province_name` từ danh mục, `employee_size` dạng nhãn ("11–50 nhân sự").
- `featured_story_slug` = `public_slug` của `featured_story_id` nếu Story đó đang public, ngược lại NULL.
- `culture_values` = giá trị visibility PUBLIC, chưa xóa, theo `sort_order`: `[{ "name": name_vi, "description": description_vi }]`.
- `public_entity_count` = số dòng `atlas.entities` của tổ chức.
- `first_published_at` = `organizations.atlas_first_enabled_at`.
- `updated_at` = now().

## 8. Revalidate Atlas

Tag Next.js (Atlas dùng `unstable_cache`/`fetch` cache với các tag này):

| Tag | Trang dùng |
|---|---|
| `home` | `/` |
| `companies` | `/companies` |
| `company:{slug}` | `/companies/{slug}` |
| `entity:{path}` (VD `entity:/stories/abc`) | trang chi tiết đó |

`flushRevalidate(tags)`: `POST {ATLAS_BASE_URL}/api/revalidate` body `{ "tags": [...] }`, header `x-revalidate-secret: {ATLAS_REVALIDATE_SECRET}`, timeout 3 giây, thử lại 2 lần (500 ms, 1500 ms). Thất bại cuối cùng: ghi Sentry, không báo lỗi người dùng. Mọi trang Atlas có `revalidate = 300` làm lưới an toàn, nên tệ nhất dữ liệu trễ 5 phút.

Ở chi tiết nội dung, khi X thay đổi, các trang của nội dung liên quan cũng hiển thị X (tên, ảnh) nên PHẢI revalidate tag của mọi nội dung có quan hệ với X (trước và sau thay đổi).

## 9. Test bắt buộc

`packages/core/test/public.test.ts` (chạy với Postgres thật qua Testcontainers hoặc Neon branch):
1. Bật PUBLIC cho Story VERIFIED khi tổ chức đã bật Atlas → có dòng `atlas.entities`, không có trường nằm ngoài danh sách trắng (so sánh bằng snapshot của toàn dòng).
2. `internal_notes` có chuỗi đánh dấu `SECRET-123` → chuỗi này không xuất hiện ở bất kỳ bảng nào trong schema `atlas` (quét toàn bộ dạng text).
3. Hai nội dung public có quan hệ → `atlas.relations` có cả hai chiều; bỏ public một bên → quan hệ biến mất.
4. Unverify / xóa / tắt Atlas / NexTure ẩn → dòng biến mất, có tombstone.
5. Công khai lại sau khi gỡ → cùng `public_slug`, tombstone bị xóa, `published_at` được giữ nếu dòng còn, hoặc đặt mới nếu đã xóa (chấp nhận).
6. Media PRIVATE làm ảnh bìa của Story public → `cover_url` NULL, không có file trong bucket public.
7. Role `atlas_reader` không SELECT được `core.stories` (test kết nối bằng role thật).
