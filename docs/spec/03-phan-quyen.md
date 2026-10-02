# 03. Phân quyền

Mọi kiểm tra quyền PHẢI thực hiện ở backend trong `packages/core/src/authz.ts`. Frontend chỉ ẩn/disable nút dựa trên trường `permissions` mà API trả về (xem §6), KHÔNG tự tính quyền.

## 1. Vai trò

| Vai trò | Phạm vi | Ai có |
|---|---|---|
| `ADMIN` | Một tổ chức | Người tạo tổ chức; người được mời với vai trò Admin |
| `EDITOR` | Một tổ chức | Người được mời |
| `VIEWER` | Một tổ chức | Người được mời |
| `NEXTURE_ADMIN` | Toàn nền tảng | Gán bằng seed theo `NEXTURE_ADMIN_EMAILS` hoặc SQL tay. Không có UI gán. |

- Một user có thể là thành viên nhiều tổ chức với vai trò khác nhau.
- `NEXTURE_ADMIN` **không** tự động là thành viên của tổ chức nào. Muốn nhập liệu hộ doanh nghiệp thì phải được mời như người dùng thường.
- Người chưa đăng nhập: chỉ truy cập trang auth và trang xem lời mời.

## 2. Ma trận quyền trong một tổ chức

Ký hiệu: ✅ được, ❌ không, ⚠️ có điều kiện (ghi chú bên dưới).

| Hành động | ADMIN | EDITOR | VIEWER |
|---|---|---|---|
| **Tổ chức** | | | |
| Xem hồ sơ tổ chức | ✅ | ✅ | ✅ |
| Sửa hồ sơ tổ chức (tên, logo, ngành…) | ✅ | ❌ | ❌ |
| Sửa slug tổ chức | ⚠️1 | ❌ | ❌ |
| Bật/tắt hồ sơ trên Atlas | ✅ | ❌ | ❌ |
| Chọn Story nổi bật | ✅ | ❌ | ❌ |
| **Thành viên** | | | |
| Xem danh sách thành viên | ✅ | ✅ | ❌ |
| Tạo / thu hồi lời mời | ✅ | ❌ | ❌ |
| Đổi vai trò, xóa thành viên | ⚠️2 | ❌ | ❌ |
| Tự rời tổ chức | ⚠️2 | ✅ | ✅ |
| **Nội dung (Story, Event, Person, Product/Project)** | | | |
| Xem nội dung `VERIFIED` có visibility `INTERNAL`/`PUBLIC` | ✅ | ✅ | ✅ |
| Xem nội dung `DRAFT`/`PENDING_REVIEW` | ✅ | ✅ | ❌ |
| Xem nội dung visibility `PRIVATE` | ✅ | ✅ | ❌ |
| Xem `internal_notes` | ✅ | ✅ | ❌ |
| Tạo nội dung | ✅ | ✅ | ❌ |
| Sửa nội dung `DRAFT` | ✅ | ✅ | ❌ |
| Sửa nội dung `PENDING_REVIEW` | ✅ | ❌ | ❌ |
| Sửa nội dung `VERIFIED` | ✅ | ❌ | ❌ |
| Gửi duyệt (`DRAFT → PENDING_REVIEW`) | ✅ | ✅ | ❌ |
| Rút lại (`PENDING_REVIEW → DRAFT`) | ✅ | ⚠️3 | ❌ |
| Duyệt (`→ VERIFIED`) / Trả lại (`→ DRAFT`) | ✅ | ❌ | ❌ |
| Bỏ xác minh (`VERIFIED → DRAFT`) | ✅ | ❌ | ❌ |
| Đặt visibility `PRIVATE` / `INTERNAL` | ✅ | ⚠️4 | ❌ |
| Đặt visibility `PUBLIC` (lên Atlas) | ✅ | ❌ | ❌ |
| Xóa nội dung | ✅ | ⚠️5 | ❌ |
| Sửa quan hệ, ảnh, nguồn của nội dung | = quyền sửa nội dung đó | | |
| **Giá trị văn hóa** | | | |
| Xem | ✅ | ✅ | ✅ (chỉ khi visibility khác PRIVATE; giá trị không có PRIVATE nên luôn thấy) |
| Tạo / sửa / xóa / sắp xếp / đổi visibility | ✅ | ❌ | ❌ |
| **Tư liệu (Culture Library)** | | | |
| Xem danh sách, tải file | ✅ | ✅ | ⚠️6 |
| Upload | ✅ | ✅ | ❌ |
| Sửa metadata | ✅ | ⚠️7 | ❌ |
| Gửi duyệt / duyệt / visibility | như nội dung | như nội dung | ❌ |
| Xóa | ✅ | ⚠️5 | ❌ |
| **Khác** | | | |
| Dashboard, Timeline, Tìm kiếm | ✅ | ✅ | ✅ (áp dụng bộ lọc hiển thị §3) |
| Trang Chờ duyệt | ✅ | ✅ (chỉ xem) | ❌ |
| Trang Culture Atlas (trạng thái công khai) | ✅ | ✅ (chỉ xem) | ❌ |
| Nhật ký hoạt động | ✅ | ❌ | ❌ |

Ghi chú:
1. Chỉ khi `organizations.slug_locked = false`.
2. Không được hạ vai trò, xóa, hoặc tự rời nếu đó là Admin cuối cùng của tổ chức → `409 LAST_ADMIN`.
3. Editor chỉ rút lại được nội dung do chính mình gửi (`submitted_by = user`).
4. Editor chỉ đổi visibility giữa `PRIVATE` và `INTERNAL`, và chỉ trên nội dung đang `DRAFT`. Nội dung đang `PUBLIC` thì Editor không đổi được.
5. Editor chỉ xóa được nội dung/tư liệu đang `DRAFT` do chính mình tạo (`created_by = user`).
6. Viewer chỉ thấy tư liệu `VERIFIED` có visibility `INTERNAL` hoặc `PUBLIC`.
7. Editor sửa metadata tư liệu khi tư liệu đang `DRAFT`.

## 3. Bộ lọc hiển thị (áp dụng cho mọi API đọc)

Hàm `core.authz.visibilityFilter(role)` trả điều kiện SQL thêm vào mọi truy vấn danh sách và chi tiết:

| Vai trò | Điều kiện |
|---|---|
| ADMIN, EDITOR | `deleted_at IS NULL` |
| VIEWER | `deleted_at IS NULL AND status = 'VERIFIED' AND visibility IN ('INTERNAL','PUBLIC')` |

- Viewer truy cập chi tiết một nội dung không thỏa điều kiện → `404 NOT_FOUND` (không trả 403 để không lộ sự tồn tại).
- Với Viewer, các nội dung liên quan (quan hệ, ảnh, nguồn) cũng PHẢI lọc theo cùng điều kiện; nội dung liên quan không thỏa thì không xuất hiện.
- Với Viewer, các trường `internal_notes`, `return_note`, `submitted_by`, `verified_by` bị bỏ khỏi response.

## 4. Quan hệ, ảnh, nguồn

- Sửa quan hệ của nội dung A với danh sách B: cần quyền sửa A. Không cần quyền sửa B. (VD Editor sửa Story DRAFT có thể liên kết tới Person đã VERIFIED.)
- Khi đó quan hệ cũng xuất hiện ở B. Đây là chủ ý: quan hệ thuộc về cả hai nhưng chỉ cần quyền một đầu.
- Nếu B đang công khai và A cũng công khai, thay đổi quan hệ làm thay đổi Atlas. Vì A công khai thì A đã `VERIFIED`, nên chỉ Admin sửa được A trong trường hợp này. Đảm bảo: **chỉ Admin làm thay đổi được nội dung trên Atlas.**

## 5. NEXTURE_ADMIN

| Hành động | Được |
|---|---|
| Vào `/nexture-admin` | ✅ |
| Xem danh sách tổ chức (tên, slug, ngày tạo, số thành viên, số nội dung theo trạng thái, `atlas_enabled`) | ✅ |
| Xem nội dung của tổ chức | ⚠️ Chỉ nội dung đang công khai trên Atlas (đọc từ `atlas.*`) |
| Ẩn / bỏ ẩn một nội dung khỏi Atlas (bắt buộc nhập lý do khi ẩn) | ✅ |
| Ẩn / bỏ ẩn cả hồ sơ doanh nghiệp khỏi Atlas | ✅ |
| Sửa nội dung, đổi visibility, xem dữ liệu PRIVATE/INTERNAL | ❌ |

Người dùng không phải `NEXTURE_ADMIN` truy cập `/nexture-admin` hoặc `/api/v1/admin/*` → `404`.

## 6. Trường `permissions` trong response

Mọi response chi tiết nội dung, tư liệu và tổ chức PHẢI có trường `permissions` tính từ §2 cho người gọi:

```json
"permissions": {
  "canEdit": true,
  "canDelete": false,
  "canSubmit": true,
  "canWithdraw": false,
  "canApprove": false,
  "canReturn": false,
  "canUnverify": false,
  "allowedVisibilities": ["PRIVATE", "INTERNAL"]
}
```

Response tổ chức có: `canEditProfile`, `canManageMembers`, `canToggleAtlas`, `canViewActivity`.

## 7. Test bắt buộc

`packages/core/test/authz.test.ts` PHẢI có test cho **mọi ô** của bảng §2 (dạng bảng dữ liệu `it.each`), cộng các trường hợp:
- User không phải thành viên gọi API tổ chức → 404.
- Viewer gọi chi tiết nội dung DRAFT → 404.
- Viewer nhận response không có `internal_notes`.
- Hạ vai trò Admin cuối cùng → 409 `LAST_ADMIN`.
- `NEXTURE_ADMIN` không là thành viên gọi `GET /orgs/{orgId}/stories` → 404.
