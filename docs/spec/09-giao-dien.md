# 09. Giao diện: design token và quy tắc component

**Trạng thái:** đang dùng giá trị tạm. Khi nhận bộ nhận diện (màu, font, logo) của NexTure, **chỉ** cập nhật các giá trị ở §2–§4 và file `packages/config/tokens.css`; không sửa component.

## 1. Nguyên tắc

1. Mọi màu, font, cỡ chữ, bo góc, bóng đổ trong code PHẢI lấy từ token (CSS variable khai báo qua `@theme` của Tailwind v4). KHÔNG ĐƯỢC viết mã màu hex/rgb trực tiếp trong component. ESLint rule (`no-restricted-syntax` cho chuỗi `#[0-9a-f]{3,8}` trong `.tsx`) chặn việc này.
2. Hub và Atlas dùng **chung bộ token**. Atlas được phép dùng cỡ chữ display và khoảng trắng rộng hơn (token riêng `display-*`), Hub ưu tiên mật độ thông tin.
3. Chế độ tối: **không làm** trong MVP. Token vẫn đặt tên theo vai trò (không theo màu) để thêm sau.
4. Font PHẢI hỗ trợ đầy đủ tiếng Việt (kiểm bằng chuỗi mẫu §6).

## 2. Màu (token theo vai trò)

Cột "Giá trị tạm" dùng cho tới khi có bộ nhận diện. Cột "Lấy từ bộ nhận diện" chỉ cách ánh xạ.

| Token | Dùng cho | Giá trị tạm | Lấy từ bộ nhận diện |
|---|---|---|---|
| `--color-brand` | Nút chính, link, điểm nhấn | `#1F4E79` | Màu chính |
| `--color-brand-hover` | Hover nút chính | `#173B5C` | Màu chính tối hơn ~10% |
| `--color-brand-soft` | Nền nhạt nhấn mạnh, chip | `#E8F0F8` | Màu chính nhạt ~90% |
| `--color-on-brand` | Chữ trên nền brand | `#FFFFFF` | Trắng hoặc đen, chọn theo tương phản ≥ 4.5:1 |
| `--color-accent` | Badge "Công khai", điểm nhấn phụ, chấm timeline | `#C8873A` | Màu phụ |
| `--color-accent-soft` | Nền badge accent | `#FBF1E4` | Màu phụ nhạt |
| `--color-bg` | Nền trang | `#FAFAF8` | Màu nền |
| `--color-surface` | Thẻ, bảng, dialog | `#FFFFFF` | |
| `--color-surface-muted` | Nền vùng phụ, ghi chú nội bộ | `#F2F1EE` | |
| `--color-admin-surface` | Nền thanh trên khu NexTure Admin | `#2B2B2B` | |
| `--color-border` | Viền | `#E2E0DB` | |
| `--color-text` | Chữ chính | `#1C1C1A` | Màu chữ |
| `--color-text-muted` | Chữ phụ | `#5F5E59` | |
| `--color-success` / `-soft` | LIVE, thành công | `#2E7D4F` / `#E6F4EC` | |
| `--color-warning` / `-soft` | WAITING_ORG, cảnh báo | `#B26A00` / `#FFF4E0` | |
| `--color-danger` / `-soft` | Lỗi, xóa, HIDDEN | `#B3261E` / `#FCE8E6` | |
| `--color-status-draft` / `-soft` | Badge Nháp | `#6B6A65` / `#EFEEEA` | |
| `--color-status-pending` / `-soft` | Badge Chờ duyệt | `#8A5A00` / `#FFF1D6` | |
| `--color-status-verified` / `-soft` | Badge Đã xác minh | `#1F6F5C` / `#E3F3EE` | |
| `--color-timeline-<event_type>` | Chấm timeline theo 8 loại sự kiện | dải 8 sắc độ của brand + accent | Sinh từ màu chính/phụ |

Badge: chữ dùng màu đậm, nền dùng `-soft`.

## 3. Chữ

| Token | Giá trị tạm | Lấy từ bộ nhận diện |
|---|---|---|
| `--font-sans` (thân bài, UI) | "Be Vietnam Pro", system-ui, sans-serif | Font chữ thân |
| `--font-display` (tiêu đề Atlas, H1–H2) | "Be Vietnam Pro" | Font tiêu đề |
| `--font-serif` (thân bài dài trên Atlas, tùy chọn) | không dùng | Nếu bộ nhận diện có font serif cho đọc dài |

Font tải bằng `next/font` (Google Fonts hoặc file local nếu là font thương mại; file đặt trong `packages/ui/fonts`), `display: swap`, subset `vietnamese` + `latin`.

Thang cỡ chữ (rem, line-height):

| Token | Hub | Atlas | Dùng cho |
|---|---|---|---|
| `text-xs` | 0.75 / 1.4 | 0.75 / 1.4 | Badge, chú thích |
| `text-sm` | 0.875 / 1.5 | 0.875 / 1.5 | Bảng, nhãn form |
| `text-base` | 1 / 1.6 | 1.0625 / 1.75 | Thân bài |
| `text-lg` | 1.125 / 1.5 | 1.25 / 1.6 | Tóm tắt, tiêu đề thẻ |
| `text-xl` | 1.25 / 1.4 | 1.5 / 1.4 | H3 |
| `text-2xl` | 1.5 / 1.3 | 2 / 1.25 | H2 |
| `display-md` | — | 2.5 / 1.15 | H1 trang chi tiết |
| `display-lg` | — | 3.5 / 1.1 (mobile 2.25) | Hero trang chủ |

Độ đậm: 400 thân bài, 500 nhãn/nút, 600 tiêu đề, 700 chỉ cho display. Độ rộng dòng thân bài Atlas tối đa `68ch`.

## 4. Hình khối

| Token | Giá trị tạm | Ghi chú |
|---|---|---|
| `--radius-sm` | 6px | input, badge |
| `--radius-md` | 10px | nút, thẻ Hub |
| `--radius-lg` | 16px | thẻ Atlas, dialog |
| `--radius-full` | 9999px | avatar, chip |
| `--shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.06)` | thẻ |
| `--shadow-md` | `0 4px 16px rgb(0 0 0 / 0.08)` | dropdown, dialog |
| Khoảng cách | thang 4px của Tailwind | |
| Container Atlas | tối đa 1200px, lề 16px (mobile) / 32px (≥ 768) | |
| Container Hub | full width, nội dung tối đa 1440px | |

Icon: `lucide-react`, nét 1.75, cỡ 16 (Hub) / 20 (Atlas).

## 5. Component (`packages/ui`)

Dựa trên shadcn/ui, đã theme bằng token. Danh sách tối thiểu (tên export cố định):

- Cơ bản: `Button` (variant: primary, secondary, ghost, danger; size: sm, md, lg), `Input`, `Textarea` (có đếm ký tự), `Select`, `Combobox` (tìm kiếm, async), `Checkbox`, `Switch`, `RadioGroup`, `Dialog`, `ConfirmDialog`, `Drawer`, `Tabs`, `Toast`, `Tooltip`, `Badge`, `Skeleton`, `EmptyState`, `Pagination`, `DataTable`.
- Nghiệp vụ Hub: `StatusBadge`, `VisibilityBadge`, `PublicStateBadge`, `FuzzyDateInput`, `FuzzyDateText`, `RichTextEditor` (TipTap), `RichTextView`, `MediaPicker`, `UploadDialog`, `RelationEditor`, `SourceList`, `EntityStatusPanel`, `OrgSwitcher`.
- Dùng chung Hub preview và Atlas (`packages/ui/atlas`): `AtlasStoryPage`, `AtlasEventPage`, `AtlasPersonPage`, `AtlasProductPage`, `EntityCard`, `CompanyCard`, `Timeline`, `Gallery`, `Lightbox`. Các component này nhận dữ liệu đúng cấu trúc `atlas.entities` (+ relations, media) và **không** gọi API.

Mọi component tương tác PHẢI dùng được bằng bàn phím và có focus ring dùng `--color-brand`.

## 6. Kiểm tra khi thay bộ nhận diện

1. Chạy trang `/_design` (chỉ có ở môi trường dev và staging) hiển thị toàn bộ token, thang chữ, component và chuỗi mẫu tiếng Việt: "Ấn tượng đầu tiên: Sự kiện ra mắt sản phẩm năm 2024 — Đội ngũ đã cùng nhau vượt qua thử thách. ẮẰẲẴẶ ỄỆỈỊỌỎỐỒỔỖỘ ỚỜỞỠỢ ỤỦỨỪỬỮỰ ỲỴỶỸ đĐ".
2. Kiểm tra tương phản: chữ trên nền và chữ trên badge đạt ≥ 4.5:1 (script `pnpm check:contrast` đọc `tokens.css`).
3. Chụp ảnh màn hình trang company và story của Atlas, dashboard và form Story của Hub để người dùng duyệt.

## 7. Cần người dùng cung cấp

- Mã màu (hex) của màu chính, màu phụ, màu nền, màu chữ (và các màu khác nếu bộ nhận diện có).
- Tên font tiêu đề và font thân; file font nếu là font thương mại.
- Logo NexTure (SVG, bản trên nền sáng và nền tối nếu có).
- Tùy chọn: link Figma hoặc 1–2 website tham khảo phong cách.
