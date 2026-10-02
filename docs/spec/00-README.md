# NexTure MVP: Bộ đặc tả triển khai

Phiên bản: 1.0 (2026-10-02). Trạng thái: **đã chốt** (c đồng ý toàn bộ quyết định ở `12-cau-hoi-cho-po.md` ngày 2026-10-02).
Nguồn: `NEXTURE MVP (1).docx` + mô tả của PO + quyết định của người dùng trong thread ngày 2026-10-02.
Nếu bộ đặc tả này mâu thuẫn với `../nexture-mvp-phan-tich-kien-truc.md` hoặc với docx, **bộ đặc tả này thắng**.

## Phạm vi đợt này (đã chốt)

Người dùng đã chốt ngày 2026-10-02:

1. **Không có AI.** Không phân tích tư liệu, không đề xuất cấu trúc, không chuyển giọng nói thành văn bản, không trích văn bản từ PDF/DOCX. Toàn bộ nội dung nhập bằng form.
2. **Công khai bằng bật/tắt.** Doanh nghiệp (vai trò Admin) tự bật công khai một nội dung đã xác minh, nội dung lên Atlas ngay. Không có hàng chờ NexTure duyệt, không có snapshot phiên bản. Đội NexTure chỉ có quyền **ẩn** nội dung vi phạm (kiểm duyệt sau).
3. **Giao diện theo bộ nhận diện của người dùng** (màu, font). Khi chưa nhận được, dùng token tạm trong `09-giao-dien.md`; chỉ cần thay giá trị token, không sửa component.

Các phần docx mô tả nhưng **không làm** đợt này: AI Story Structuring, Contributor, Semantic Search, NexTure Review, Public Snapshot và versioning, CHANGED_AFTER_PUBLISH, chọn từng trường công khai, bản đồ, song ngữ (schema vẫn có cột `_en`), Featured Content management.

## Cách đọc

| File | Nội dung | Ai cần đọc |
|---|---|---|
| `00-README.md` | Phạm vi, quy ước, thuật ngữ, quy tắc chung | Tất cả |
| `01-kien-truc.md` | Kiến trúc, techstack, cấu trúc repo, biến môi trường | Tất cả dev |
| `02-database.sql` | DDL PostgreSQL đầy đủ, **nguồn chuẩn cho schema** | Backend |
| `02-database-ghi-chu.md` | Giải thích bảng, ràng buộc, danh mục | Backend |
| `03-phan-quyen.md` | Vai trò, ma trận quyền, quy tắc ai thấy gì | Backend, FE |
| `04-trang-thai.md` | Trạng thái nội dung, điều kiện công khai, trạng thái upload | Backend, FE |
| `05-api.yaml` | OpenAPI 3.1 của Hub API, **nguồn chuẩn cho hợp đồng API** | Backend, FE Hub |
| `05-api-ghi-chu.md` | Quy ước API, mã lỗi, phân trang, upload | Backend, FE Hub |
| `06-hub-man-hinh.md` | Đặc tả từng màn hình Hub và khu NexTure Admin | FE Hub |
| `07-atlas-man-hinh.md` | Đặc tả từng trang Atlas, SEO, cache | FE Atlas |
| `08-cong-khai.md` | Thuật toán đồng bộ sang Atlas (projection), slug, gỡ nội dung | Backend |
| `09-giao-dien.md` | Design token, quy tắc component, chỗ điền bộ nhận diện | FE |
| `10-use-case-nghiem-thu.md` | Use case và tiêu chí nghiệm thu Given/When/Then | Tất cả, QA |
| `11-seed-deploy.md` | Dữ liệu demo, tài khoản test, các bước deploy | DevOps, Backend |
| `12-cau-hoi-cho-po.md` | Quyết định đang dùng mặc định, cần PO xác nhận | PO |

**Thứ tự ưu tiên khi các file mâu thuẫn:** `02-database.sql` > `05-api.yaml` > `04-trang-thai.md` > `03-phan-quyen.md` > các file còn lại. Ai phát hiện mâu thuẫn PHẢI ghi vào `12-cau-hoi-cho-po.md` (mục "Mâu thuẫn phát hiện khi code"), không tự đoán.

## Từ khóa bắt buộc

- **PHẢI**: bắt buộc. Không làm là lỗi nghiệm thu.
- **KHÔNG ĐƯỢC**: cấm.
- **NÊN**: khuyến nghị mạnh; bỏ qua phải ghi lý do trong PR.
- **CÓ THỂ**: tùy chọn.

## Thuật ngữ

| Thuật ngữ | Nghĩa trong hệ thống | Tên trong code |
|---|---|---|
| Doanh nghiệp / Tổ chức | Một khách hàng dùng Hub | `organization` |
| Hub | Ứng dụng private cho doanh nghiệp, `hub.<domain>` | `apps/hub` |
| Atlas | Website public, `atlas.<domain>` | `apps/atlas` |
| NexTure Admin | Khu quản trị nội bộ của đội NexTure, trong app Hub, đường dẫn `/nexture-admin` | |
| Nội dung (entity) | Story, Event, Person, Product/Project, Culture Value | `entity` |
| Loại nội dung | `STORY`, `EVENT`, `PERSON`, `PRODUCT_PROJECT`, `CULTURE_VALUE` | `EntityType` |
| Tư liệu | File trong Culture Library | `media_asset` |
| Nguồn / bằng chứng | Tư liệu hoặc đường link được gắn vào một nội dung để chứng minh | `entity_source` |
| Ảnh của nội dung | Ảnh/video gắn vào một nội dung để hiển thị | `entity_media` |
| Quan hệ | Liên kết giữa hai nội dung (VD: Person tham gia Event) | `relationship` |
| Xác minh | Admin xác nhận nội dung là chính thức (`VERIFIED`) | |
| Công khai | Nội dung có `visibility = PUBLIC` và đủ điều kiện ở `04-trang-thai.md` §3 | |
| Projection | Bản sao dữ liệu công khai trong schema `atlas`, thứ duy nhất Atlas đọc | `atlas.*` |
| Ẩn bởi NexTure | NexTure gỡ một nội dung/doanh nghiệp khỏi Atlas vì vi phạm | `atlas_hidden_at` |

## Quy tắc chung

1. **Ngôn ngữ giao diện:** tiếng Việt. Mọi chuỗi giao diện PHẢI nằm trong file từ điển `packages/i18n/vi.json`, không viết cứng trong component.
2. **Ngôn ngữ code:** tiếng Anh cho tên biến, bảng, cột, API, mã lỗi.
3. **Thời gian:** lưu `timestamptz` (UTC). Hiển thị theo `Asia/Ho_Chi_Minh`. Ngày: `dd/MM/yyyy`. Ngày giờ: `HH:mm dd/MM/yyyy`.
4. **Ngày lịch sử không chắc chắn:** dùng cặp cột `<x>_date date` + `<x>_date_precision` (`YEAR` | `MONTH` | `DAY`).
   - `YEAR`: lưu `YYYY-01-01`, hiển thị `YYYY`.
   - `MONTH`: lưu `YYYY-MM-01`, hiển thị `MM/YYYY`.
   - `DAY`: lưu đúng ngày, hiển thị `dd/MM/yyyy`.
   - API nhận và trả dạng `{ "date": "2024-05-01", "precision": "MONTH" }`. Server PHẢI chuẩn hóa ngày theo precision (VD nhận `2024-05-17` + `MONTH` thì lưu `2024-05-01`).
5. **ID:** UUID v7 sinh ở ứng dụng (package `uuidv7`). Riêng bảng auth của Better Auth dùng `text`.
6. **Xóa:** nội dung, tư liệu, quan hệ, nguồn dùng xóa mềm (`deleted_at`). Không có xóa cứng qua giao diện. Bản ghi đã xóa mềm không xuất hiện ở bất kỳ API danh sách nào.
7. **Multi-tenant:** mọi bảng nghiệp vụ có `organization_id`. Mọi truy vấn trong `packages/core` PHẢI lọc theo `organization_id` lấy từ đường dẫn `/orgs/{orgId}` **sau khi** đã kiểm tra người gọi là thành viên của tổ chức đó. KHÔNG ĐƯỢC tin `organization_id` trong body.
8. **Activity log:** mọi hành động ghi PHẢI ghi `activity_logs` trong cùng transaction (danh sách action ở `02-database-ghi-chu.md` §8).
9. **Chuyển trạng thái:** chỉ qua các hàm trong `packages/core/src/state/`. Không update cột `status`, `visibility` ở nơi khác.
10. **Đồng bộ Atlas:** mọi thay đổi có thể ảnh hưởng dữ liệu công khai PHẢI gọi `syncPublic(...)` trong cùng transaction (`08-cong-khai.md`).
11. **Xung đột sửa đồng thời:** mọi `PATCH` nội dung gửi kèm `version`. Lệch version trả `409 VERSION_CONFLICT`.
12. **"Xong" cho một tính năng:** có code; có test đơn vị cho logic trong `packages/core`; có test E2E nếu thuộc use case trong `10-use-case-nghiem-thu.md`; đã chạy được trên staging.
