# 04. Trạng thái và điều kiện

Áp dụng cho `stories`, `events`, `people`, `products_projects`, `media_assets`. `culture_values` không có `status` (luôn coi như `VERIFIED`).

## 1. Trạng thái xác minh (`status`)

```
            submit (Admin, Editor)              approve (Admin)
   DRAFT ───────────────────────────► PENDING_REVIEW ─────────────────► VERIFIED
     ▲  ▲                                  │                               │
     │  └──── withdraw (Admin, Editor*) ───┤                               │
     │  └──── return(note) (Admin) ────────┘                               │
     └──────────────────────────── unverify (Admin) ───────────────────────┘

   Admin có thêm: DRAFT ──approve──► VERIFIED (xác minh thẳng, bỏ qua bước gửi duyệt)
   Admin có thêm: tạo mới với status VERIFIED ngay ("Lưu và xác minh")
```

Hàm trong `packages/core/src/state/content.ts`. Mỗi hàm chạy trong transaction, nhận `expectedVersion`, tăng `version` lên 1, ghi activity log, gọi `syncPublic`.

| Hàm | Từ | Đến | Ai | Điều kiện thêm | Tác dụng phụ |
|---|---|---|---|---|---|
| `submit` | DRAFT | PENDING_REVIEW | ADMIN, EDITOR | Trường bắt buộc §4 hợp lệ | `submitted_by/at` = người gọi/now; `return_note = NULL` |
| `withdraw` | PENDING_REVIEW | DRAFT | ADMIN; EDITOR nếu `submitted_by` = mình | | `submitted_by/at = NULL` |
| `approve` | DRAFT hoặc PENDING_REVIEW | VERIFIED | ADMIN | Trường bắt buộc §4 hợp lệ | `verified_by/at` = người gọi/now; `return_note = NULL` |
| `returnToDraft` | PENDING_REVIEW | DRAFT | ADMIN | `note` bắt buộc, 1–1000 ký tự | `return_note = note`; `submitted_* = NULL` |
| `unverify` | VERIFIED | DRAFT | ADMIN | Nếu `visibility = PUBLIC` thì tự đổi visibility thành `INTERNAL` trong cùng transaction (ghi thêm log `VISIBILITY_CHANGED`) | `verified_* = NULL`; gỡ khỏi Atlas |

- Gọi hàm khi trạng thái hiện tại không nằm ở cột "Từ" → `409 INVALID_TRANSITION` với `details: { from, action }`.
- Không có trạng thái `REJECTED`. Từ chối = `returnToDraft` kèm lý do.
- Sửa nội dung (PATCH) không đổi `status`. Admin sửa nội dung `VERIFIED` thì vẫn `VERIFIED`; nếu đang công khai, Atlas cập nhật ngay.
- `create` với `status` trong body: Editor chỉ được `DRAFT`; Admin được `DRAFT` hoặc `VERIFIED`. Giá trị khác → `422`.

## 2. Visibility

| Giá trị | Ý nghĩa |
|---|---|
| `PRIVATE` | Chỉ Admin và Editor thấy. |
| `INTERNAL` | Mọi thành viên thấy (Viewer chỉ thấy khi `VERIFIED`). **Mặc định.** |
| `PUBLIC` | Như INTERNAL, cộng hiển thị trên Atlas nếu đủ điều kiện §3. |

Hàm `setVisibility(entity, value)` trong `packages/core/src/state/visibility.ts`:

| Đổi sang | Điều kiện | Lỗi nếu vi phạm |
|---|---|---|
| `PRIVATE`, `INTERNAL` | Theo quyền ở `03` §2 | 403 `FORBIDDEN` |
| `PUBLIC` | Người gọi là ADMIN; `status = VERIFIED` | 403 `FORBIDDEN`; 409 `NOT_VERIFIED` |

Đổi sang `PUBLIC` khi tổ chức chưa bật Atlas vẫn **được phép** (để chuẩn bị trước). Response trả thêm `publicState` (§3) để giao diện báo "Sẽ hiển thị khi hồ sơ Atlas được bật".

## 3. Điều kiện hiển thị trên Atlas

Một nội dung X **đang hiển thị trên Atlas** khi và chỉ khi tất cả đúng:

1. `X.deleted_at IS NULL`
2. `X.status = 'VERIFIED'`
3. `X.visibility = 'PUBLIC'`
4. `X.atlas_hidden_at IS NULL`
5. Tổ chức: `atlas_enabled = true` và `atlas_hidden_at IS NULL`

Hồ sơ doanh nghiệp hiển thị khi điều kiện 5 đúng.

Hàm thuần `core.public.isPublic(entity, org): boolean` là **nguồn duy nhất** của quy tắc này, dùng ở cả `syncPublic` và phần hiển thị trạng thái trong Hub.

API trả cho mỗi nội dung trường `publicState`:

| Giá trị | Khi nào | Nhãn hiển thị trong Hub |
|---|---|---|
| `NOT_PUBLIC` | visibility ≠ PUBLIC | (không hiện nhãn) |
| `LIVE` | đủ 5 điều kiện | "Đang hiển thị trên Atlas" + link |
| `WAITING_ORG` | visibility = PUBLIC, VERIFIED, chưa ẩn, nhưng tổ chức chưa bật Atlas | "Chờ bật hồ sơ Atlas" |
| `HIDDEN_BY_NEXTURE` | `X.atlas_hidden_at` hoặc tổ chức `atlas_hidden_at` khác NULL | "Bị NexTure ẩn: {lý do}" |

(Trường hợp visibility = PUBLIC mà không VERIFIED không thể xảy ra vì `unverify` hạ visibility.)

**Với media (tư liệu)** `publicState` tính như sau:
| Giá trị | Khi nào | Nhãn |
|---|---|---|
| `NOT_PUBLIC` | visibility ≠ PUBLIC, hoặc chưa VERIFIED | (không hiện nhãn) |
| `LIVE` | có dòng trong `atlas.media` | "Đang trên Atlas" |
| `WAITING_ORG` | đủ điều kiện công khai (`08-cong-khai.md` §4) nhưng tổ chức chưa bật Atlas | "Chờ bật hồ sơ Atlas" |
| `HIDDEN_BY_NEXTURE` | tổ chức bị NexTure ẩn | "Bị NexTure ẩn" |
| `NOT_USED` | đủ điều kiện, tổ chức đang public, nhưng chưa gắn vào nội dung nào đang công khai | "Công khai, chưa dùng trên Atlas" |

Media dùng chung luồng `unverify` như nội dung: bỏ xác minh media PUBLIC thì visibility tự về INTERNAL.

## 4. Trường bắt buộc khi gửi duyệt / duyệt

Khi tạo hoặc lưu DRAFT chỉ cần các trường NOT NULL của DDL. Khi `submit` hoặc `approve` PHẢI thêm:

| Loại | Bắt buộc thêm |
|---|---|
| STORY | `summary_vi`, `content_vi` |
| EVENT | (không thêm; `start_date` đã bắt buộc từ đầu) |
| PERSON | `role_title_vi` |
| PRODUCT_PROJECT | `summary_vi` |
| MEDIA | (không thêm) |

Thiếu → `422 REQUIRED_FOR_REVIEW` với `details.fields = [...]`.

## 5. Hồ sơ Atlas của tổ chức

```
atlas_enabled=false ──enableAtlas (Admin, hồ sơ đủ trường)──► atlas_enabled=true
                    ◄──disableAtlas (Admin)─────────────────
```

- `enableAtlas`: kiểm tra trường bắt buộc (`02-database-ghi-chu.md` §2); set `atlas_enabled = true`; nếu `atlas_first_enabled_at` NULL thì set now và `slug_locked = true`; gọi `syncPublic({ org })` để đẩy hồ sơ + mọi nội dung đủ điều kiện.
- `disableAtlas`: set `false`; `syncPublic({ org })` xóa toàn bộ dữ liệu tổ chức khỏi `atlas.*` và ghi tombstone cho mọi đường dẫn.
- Khi `atlas_enabled = true`, Admin sửa hồ sơ tổ chức làm thiếu trường bắt buộc (VD xóa logo) → `422 ATLAS_PROFILE_INCOMPLETE`. Muốn xóa thì tắt Atlas trước.

## 6. Ẩn bởi NexTure

| Hàm | Ai | Tác dụng |
|---|---|---|
| `hideEntity(type, id, reason)` | NEXTURE_ADMIN | set `atlas_hidden_at/by/reason`; `syncPublic`; log `ATLAS_HIDDEN_BY_NEXTURE` với `organization_id` của nội dung |
| `unhideEntity(type, id)` | NEXTURE_ADMIN | set 3 cột về NULL; `syncPublic` |
| `hideOrg(orgId, reason)` / `unhideOrg(orgId)` | NEXTURE_ADMIN | tương tự trên `organizations` |

- `reason`: 5–500 ký tự.
- Doanh nghiệp thấy lý do trong Hub (§3 `HIDDEN_BY_NEXTURE`), không tự bỏ ẩn được. Sửa nội dung không tự bỏ ẩn.

## 7. Upload tư liệu

```
(xin URL) ──► PENDING ──complete (HeadObject khớp)──► READY
```

Chi tiết ở `02-database-ghi-chu.md` §7 và `05-api-ghi-chu.md` §5.

## 8. Test bắt buộc

`packages/core/test/state.test.ts`:
- Mọi cặp (trạng thái hiện tại × hàm) — hợp lệ thì đúng trạng thái đích, không hợp lệ thì 409.
- `unverify` nội dung PUBLIC → visibility thành INTERNAL và biến mất khỏi `atlas.entities`.
- `isPublic` cho cả 2^5 tổ hợp 5 điều kiện.
- Version lệch → 409 `VERSION_CONFLICT`, không có thay đổi nào được ghi.
