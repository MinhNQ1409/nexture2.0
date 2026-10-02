# 09. Giao diện: design token và quy tắc component

**Trạng thái:** đã chốt bộ nhận diện (2026-10-02). Nguồn gốc là `docs/design/DESIGN.md` do người dùng cung cấp (bản chung ở `/mnt/project-files/nexture/design/DESIGN.md`). Khi DESIGN.md và file này khác nhau về màu, chữ, bo góc, bóng, trạng thái tương tác thì **DESIGN.md thắng**. File này chỉ ghi những gì riêng của NexTure: ánh xạ trạng thái nghiệp vụ sang badge, và chỗ Atlas khác Hub.

Token được khai báo một lần trong `packages/config/tokens.css` (Tailwind v4 `@theme`), tên token trùng tên trong DESIGN.md (`primary`, `ink`, `canvas`, `hairline`, `success`/`success-bg`, ...).

## 1. Nguyên tắc

1. Mọi màu, font, cỡ chữ, bo góc, bóng đổ trong component PHẢI lấy từ token. Bảng màu mặc định của Tailwind đã bị xóa (`--color-*: initial`), nên class như `bg-blue-500` không tồn tại. Không viết mã hex trong `.tsx`.
2. Hub và Atlas dùng **chung bộ token**. Hub theo đúng DESIGN.md (app nội bộ, mật độ cao). Atlas là trang công khai nên được dùng cỡ display lớn hơn và khoảng trắng rộng hơn (§4), nhưng vẫn cùng màu, font, bo góc.
3. Không dùng emoji hay ký tự thay icon (✓, ○, ⚠). Icon: `lucide-react`, nét 1.5, cỡ 16/20/24/32 theo DESIGN.md "Icon Sizes".
4. Chế độ tối: không làm trong MVP.

## 2. Font

- Tiêu đề, display: **Be Vietnam Pro** 600/700 (`font-display`, mặc định cho `h1–h3`).
- Thân, nút, bảng, form: **Inter** 400/600 (`font-sans`).
- Tải bằng `next/font/google` trong `apps/*/src/lib/fonts.ts`, subset `vietnamese` + `latin`, `display: swap`.
- Class cỡ chữ dùng tên token của DESIGN.md: `text-display-xl`, `text-display-md`, `text-heading-lg`, `text-heading-md`, `text-body-lg`, `text-body-md`, `text-caption`, `text-micro-cap`, `text-button-md`...
- Số liệu (đếm, ngày, năm) dùng class `tabular`, định dạng `vi-VN`.

## 3. Ánh xạ trạng thái NexTure sang badge

Badge luôn kèm chữ (không chỉ màu), dạng pill, không xuống dòng (DESIGN.md "Badge & Status Rules").

| Trạng thái | Nhãn | Badge |
|---|---|---|
| `DRAFT` | Nháp | `neutral` |
| `PENDING_REVIEW` | Chờ duyệt | `warning` |
| `VERIFIED` | Đã xác minh | `success` |
| visibility `PRIVATE` | Riêng tư | `neutral` + icon khóa |
| visibility `INTERNAL` | Nội bộ | `neutral` |
| visibility `PUBLIC` | Công khai | `info` |
| publicState `LIVE` | Đang hiển thị trên Atlas | `success` |
| publicState `WAITING_ORG` | Chờ bật hồ sơ Atlas | `warning` |
| publicState `HIDDEN_BY_NEXTURE` | Bị NexTure ẩn | `error` |
| publicState `NOT_USED` (media) | Công khai, chưa dùng trên Atlas | `neutral` |
| Vai trò ADMIN / EDITOR / VIEWER | Quản trị / Biên tập / Người xem | `success` / `info` / `neutral` |

- Màu `accent` (cam đất) chỉ dùng cho việc **cần chú ý**: nội dung bị trả lại (`return_note`), hàng chờ duyệt quá 7 ngày. Không dùng cho lỗi.
- Hàng đại diện một bản ghi có trạng thái (danh sách Story, Event, hàng chờ duyệt) dùng viền trái 4px: `primary` mặc định, `accent` khi bị trả lại (DESIGN.md "card-task").

## 4. Bố cục

**Hub** (DESIGN.md "Grid & Layout", "Responsive Behavior"):
- Sidebar nền `primary` 240px (≥1024px), thu về 64px chỉ icon (768–1023px), ẩn thành drawer (<768px). Topbar trắng 56px: tên doanh nghiệp (bấm để đổi doanh nghiệp), tên người dùng, avatar chữ cái, nút đăng xuất.
- Nội dung đệm 24px (16px trên mobile). Tổng quan, form, cài đặt: `standard-content` (tối đa 1200px, căn giữa). Danh sách, bảng, hàng chờ duyệt, thư viện: `workspace-content` (full width). Màn đọc dài: `reading-content` (760px).
- Màn quản trị theo "Data Management Screen": tiêu đề, mô tả, nút chính ở góc phải; thanh công cụ; vùng dữ liệu.
- Trang đăng nhập, đăng ký, nhận lời mời, wizard tạo doanh nghiệp: một `card-welcome` giữa nền `canvas`.

**Atlas**:
- Thanh trên trắng 56px, chân trang `surface-dark`. Nội dung tối đa 1200px, lề 16px (mobile) / 24px.
- Hero trang chủ `text-display-xl` (mobile `display-lg`); tiêu đề trang chi tiết `display-lg` (mobile `display-md`).
- Thân bài dài tối đa `760px` (`max-w-reading`), cỡ `body-lg`.
- Thẻ doanh nghiệp, nội dung: `card-default`, hover nền `canvas-section`. Thẻ giá trị văn hóa có viền trái `primary`.

## 5. Component

`apps/hub/src/components/ui.tsx` hiện có: `Button` (primary, secondary, ghost, ghost-primary, danger; md 44px, sm 40px), `linkButton`, `Input`, `Select`, `Textarea`, `Field`, `Card` (default, `section`, `welcome`), `Alert`, `Badge`, `PageHeader`, class bảng `tableHead`/`tableRow`. Khi Hub và Atlas cần dùng chung (từ bước 4), chuyển sang `packages/ui`.

Danh sách cần thêm ở các bước sau: `Combobox`, `Checkbox`, `Switch`, `Dialog`, `ConfirmDialog`, `Drawer`, `Tabs`, `Toast` (nền `surface-dark`), `Tooltip`, `Skeleton`, `EmptyState`, `Pagination`, `StatusBadge`, `VisibilityBadge`, `PublicStateBadge`, `FuzzyDateInput`, `RichTextEditor` (TipTap), `MediaPicker`, `UploadDialog` (dropzone viền nét đứt), `RelationEditor`, `SourceList`, `EntityStatusPanel`, và phần dùng chung Atlas: `EntityCard`, `CompanyCard`, `Timeline`, `Gallery`, `Lightbox`.

Mọi component tương tác có đủ hover, active, focus (`outline 2px focus-ring, offset 2px`), disabled theo bảng "Interaction States" của DESIGN.md.

## 6. Kiểm tra giao diện

1. Chụp màn hình bằng Playwright: đăng nhập, Tổng quan (1440px và 390px), Thành viên, wizard, trang chủ và hồ sơ doanh nghiệp của Atlas.
2. Chuỗi kiểm tra tiếng Việt: "Ấn tượng đầu tiên: Sự kiện ra mắt sản phẩm năm 2024. ẮẰẲẴẶ ỄỆỈỊỌỎỐỒỔỖỘ ỚỜỞỠỢ ỤỦỨỪỬỮỰ ỲỴỶỸ đĐ".
3. Không có mã hex trong `.tsx`: `grep -rnE "#[0-9a-fA-F]{3,8}\b" apps/*/src --include=*.tsx` phải rỗng.

## 7. Còn thiếu từ người dùng

- Logo NexTure (SVG, bản nền sáng và nền tối). Hiện sidebar và Atlas dùng chữ "NexTure Hub" / "Culture Atlas".
