# 05. Ghi chú API

Hợp đồng chi tiết: `05-api.yaml`. Client trong `apps/hub` PHẢI sinh type từ file này (`openapi-typescript`) và gọi qua `openapi-fetch`. CI chạy `redocly lint docs/spec/05-api.yaml`.

## 1. Quy ước

- JSON, `camelCase` ở API; `snake_case` ở database. Mapping nằm trong `packages/core` (không để lộ tên cột ra ngoài).
- Trường không gửi trong `PATCH` = giữ nguyên. Gửi `null` = xóa giá trị (chỉ với trường cho phép null).
- Mọi `POST/PATCH/PUT/DELETE` trả bản ghi mới nhất (hoặc `204`), để client cập nhật cache TanStack Query mà không cần gọi lại.
- Thời gian dạng ISO 8601 UTC (`2026-10-02T09:00:00.000Z`). Ngày lịch sử dạng `FuzzyDate` (`00-README.md` quy tắc 4).
- Chuỗi đầu vào: server `trim()` mọi chuỗi; chuỗi rỗng sau trim với trường nullable được coi là `null`.
- `collection` trong đường dẫn ↔ `entity_type`: `stories`=STORY, `events`=EVENT, `people`=PERSON, `products`=PRODUCT_PROJECT, `media`=media_assets.

## 2. Thứ tự xử lý trong mỗi route

1. Parse + validate body/query bằng zod (sinh từ cùng định nghĩa với OpenAPI trong `packages/contracts`). Lỗi → `422 VALIDATION_FAILED` với `details.fields: { [path]: message }`.
2. Lấy session. Không có → `401 UNAUTHENTICATED`.
3. Route `/orgs/{orgId}/*`: kiểm tra membership. Không phải thành viên → `404 NOT_FOUND`.
4. Route `/admin/*`: kiểm tra `platform_role = NEXTURE_ADMIN`. Không phải → `404 NOT_FOUND`.
5. Tải bản ghi theo `id` **và** `organization_id`. Không có hoặc bị bộ lọc hiển thị loại → `404 NOT_FOUND`.
6. Kiểm tra quyền hành động. Không đủ → `403 FORBIDDEN`.
7. Kiểm tra version (nếu có). Lệch → `409 VERSION_CONFLICT`.
8. Kiểm tra trạng thái/nghiệp vụ → `409`/`422` tương ứng.
9. Thực hiện trong transaction, ghi activity log, `syncPublic`.
10. Sau commit: gọi revalidate Atlas (lỗi ở bước này không làm request thất bại, xem `08-cong-khai.md` §6).

## 3. Mã lỗi

Body lỗi luôn có dạng `{ "error": { "code", "message", "details"? } }`. `message` là câu tiếng Việt lấy từ `vi.json` khóa `errors.<CODE>`.

| HTTP | code | Khi nào | message mặc định |
|---|---|---|---|
| 401 | `UNAUTHENTICATED` | Chưa đăng nhập / phiên hết hạn | Vui lòng đăng nhập lại. |
| 403 | `FORBIDDEN` | Là thành viên nhưng không đủ quyền | Bạn không có quyền thực hiện thao tác này. |
| 403 | `INVITE_EMAIL_MISMATCH` | Lời mời giới hạn email khác | Lời mời này dành cho một email khác. |
| 404 | `NOT_FOUND` | Không tồn tại hoặc không được thấy | Không tìm thấy nội dung. |
| 409 | `VERSION_CONFLICT` | `version` lệch | Nội dung vừa được người khác cập nhật. Hãy tải lại trước khi lưu. |
| 409 | `INVALID_TRANSITION` | Chuyển trạng thái không hợp lệ | Không thể thực hiện thao tác ở trạng thái hiện tại. |
| 409 | `NOT_VERIFIED` | Bật PUBLIC khi chưa VERIFIED | Chỉ nội dung đã xác minh mới được công khai. |
| 409 | `SLUG_TAKEN` | Slug tổ chức đã dùng | Đường dẫn này đã có doanh nghiệp khác sử dụng. |
| 409 | `SLUG_LOCKED` | Sửa slug khi đã khóa | Không thể đổi đường dẫn sau khi hồ sơ đã lên Atlas. |
| 409 | `LAST_ADMIN` | Hạ/xóa Admin cuối | Tổ chức cần ít nhất một Admin. |
| 409 | `ALREADY_MEMBER` | Nhận lời mời khi đã là thành viên | Bạn đã là thành viên của doanh nghiệp này. |
| 409 | `MEDIA_IN_USE` | Xóa media đang được dùng; `details.usedIn` | Tư liệu đang được sử dụng. Hãy gỡ khỏi các nội dung trước. |
| 409 | `VALUE_NAME_TAKEN` | Trùng tên giá trị văn hóa | Giá trị này đã tồn tại. |
| 410 | `INVITE_INVALID` | Lời mời hết hạn/thu hồi/đã dùng/sai | Lời mời không còn hiệu lực. |
| 422 | `VALIDATION_FAILED` | Sai định dạng; `details.fields` | Thông tin chưa hợp lệ. |
| 422 | `REQUIRED_FOR_REVIEW` | Thiếu trường khi gửi duyệt/duyệt; `details.fields` | Cần bổ sung thông tin trước khi gửi duyệt. |
| 422 | `ATLAS_PROFILE_INCOMPLETE` | Thiếu trường hồ sơ; `details.fields` | Hồ sơ doanh nghiệp chưa đủ thông tin để hiển thị trên Atlas. |
| 422 | `INVALID_RELATION` | Quan hệ sai loại/khác tổ chức | Liên kết không hợp lệ. |
| 422 | `MEDIA_NOT_READY` | Gắn media chưa READY | Tư liệu chưa tải lên xong. |
| 422 | `MEDIA_KIND_INVALID` | Gắn sai loại media (VD PDF làm ảnh bìa) | Loại tư liệu không phù hợp. |
| 422 | `FILE_TYPE_NOT_ALLOWED` | MIME/đuôi không cho phép | Định dạng tệp không được hỗ trợ. |
| 422 | `FILE_TOO_LARGE` | Vượt dung lượng; `details.maxBytes` | Tệp vượt quá dung lượng cho phép. |
| 422 | `UPLOAD_MISMATCH` | File trên R2 thiếu/sai kích thước | Tải tệp chưa hoàn tất. Hãy thử lại. |
| 422 | `FEATURED_STORY_INVALID` | featuredStoryId không phải Story COMPANY của tổ chức | Chỉ chọn được câu chuyện loại "Câu chuyện doanh nghiệp". |
| 429 | `RATE_LIMITED` | Vượt giới hạn | Bạn thao tác quá nhanh, hãy thử lại sau. |
| 500 | `INTERNAL` | Lỗi không lường trước (gửi Sentry) | Đã có lỗi xảy ra. Vui lòng thử lại. |

## 4. Phân trang, lọc, sắp xếp

- `page` (từ 1), `pageSize` (mặc định 20, tối đa 100). Response có `page`, `pageSize`, `total`.
- Lọc `q` dùng quy tắc tìm kiếm ở `02-database-ghi-chu.md` §11.
- Giá trị `sort` không hợp lệ → `422`.

## 5. Upload tư liệu (3 bước)

1. `POST /orgs/{orgId}/media/upload-url` với `{filename, mimeType, sizeBytes}`.
   Server kiểm tra quyền upload, MIME + đuôi + dung lượng (`02-database-ghi-chu.md` §7), tạo `media_assets` (`PENDING`, `title` = tên file không đuôi, `status = DRAFT`, `visibility = INTERNAL`), trả `uploadUrl` presigned PUT (15 phút) và `headers: { "Content-Type": mimeType }`.
2. Client `PUT uploadUrl` với đúng header. Hiển thị tiến trình bằng `XMLHttpRequest.upload.onprogress`.
3. `POST /orgs/{orgId}/media/{id}/complete` với metadata (và `width/height` với ảnh, đọc bằng `createImageBitmap` ở client). Server `HeadObject`, so `ContentLength`, chuyển `READY`, ghi log `MEDIA_UPLOADED`.

Upload nhiều file: client chạy song song tối đa 3 file. File lỗi hiển thị riêng, không chặn file khác.

CORS của bucket private PHẢI cho phép `PUT` và `GET` từ `HUB_BASE_URL`.

## 6. Giới hạn tần suất

Áp dụng theo user, lưu trong bộ nhớ (MVP chạy ít instance, chấp nhận không chính xác tuyệt đối):
- Ghi (POST/PATCH/PUT/DELETE): 120 request/phút.
- `upload-url`: 60 request/phút.
- Better Auth đăng nhập: dùng rate limit tích hợp của Better Auth (mặc định).

## 7. Auth (Better Auth)

- Bật `emailAndPassword` với `minPasswordLength: 8`, `requireEmailVerification: false`.
- `sendResetPassword` gửi email qua Resend, link `{HUB_BASE_URL}/reset-password?token=...`, hết hạn 1 giờ.
- Session: cookie httpOnly, `sameSite=lax`, hết hạn 30 ngày, gia hạn khi dùng.
- Khi đăng ký: `name` bắt buộc (2–100 ký tự).
- Không có đăng nhập bằng Google trong MVP.
