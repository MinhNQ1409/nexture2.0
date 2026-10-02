# 06. Màn hình Hub

Mọi màn hình dùng component và token ở `09-giao-dien.md`. Mọi chuỗi lấy từ `vi.json`; chuỗi trong ngoặc kép ở file này là **giá trị tiếng Việt mặc định** của khóa tương ứng.

Bố cục desktop là chính (≥ 1280 px). Từ 768–1279 px sidebar thu gọn thành icon. Dưới 768 px: sidebar thành menu trượt, bảng chuyển thành danh sách thẻ; Hub vẫn dùng được nhưng không tối ưu.

## 0. Quy ước chung cho mọi màn hình

**Trạng thái tải:** skeleton theo hình khối nội dung, không dùng spinner toàn trang.
**Lỗi tải:** khung "Không tải được dữ liệu." + nút "Thử lại".
**404:** "Không tìm thấy nội dung." + nút "Về trang Tổng quan".
**Toast:** thành công 3 giây; lỗi hiện `error.message` từ API, tồn tại tới khi đóng.
**Lỗi `VERSION_CONFLICT`:** dialog "Nội dung vừa được người khác cập nhật." với 2 nút "Tải lại bản mới" (mất thay đổi chưa lưu) và "Ở lại" (giữ form để người dùng tự chép).
**Rời trang khi có thay đổi chưa lưu:** dialog "Bạn có thay đổi chưa lưu. Rời trang?" ("Rời trang" / "Ở lại"). Áp dụng cho chuyển route trong app và `beforeunload`.
**Xác nhận hành động phá hủy** (xóa, bỏ xác minh, tắt Atlas, xóa thành viên): dialog nêu hậu quả cụ thể, nút chính màu `danger`.
**Nút bị khóa do quyền:** không hiển thị (không render disabled), trừ khi ghi khác.
**Nhãn trạng thái (badge):**

| Giá trị | Nhãn | Token màu |
|---|---|---|
| DRAFT | "Nháp" | `status-draft` |
| PENDING_REVIEW | "Chờ duyệt" | `status-pending` |
| VERIFIED | "Đã xác minh" | `status-verified` |
| PRIVATE | "Riêng tư" (icon khóa) | `neutral` |
| INTERNAL | "Nội bộ" | `neutral` |
| PUBLIC | "Công khai" (icon quả địa cầu) | `accent` |
| publicState LIVE | "Đang trên Atlas" | `success` |
| WAITING_ORG | "Chờ bật hồ sơ Atlas" | `warning` |
| HIDDEN_BY_NEXTURE | "Bị NexTure ẩn" | `danger` |
| NOT_USED (chỉ media) | "Công khai, chưa dùng trên Atlas" | `neutral` |

**Hiển thị ngày mờ:** `YEAR` → "2024"; `MONTH` → "05/2024"; `DAY` → "17/05/2024". Input ngày mờ là component `FuzzyDateInput`: dropdown chọn độ chính xác ("Năm" / "Tháng" / "Ngày") + ô nhập tương ứng.

**Nhãn enum** (dùng ở mọi nơi, kể cả Atlas):

| Enum | Nhãn |
|---|---|
| story_type | COMPANY "Câu chuyện doanh nghiệp", FOUNDER "Câu chuyện người sáng lập", CULTURE "Câu chuyện văn hóa", PEOPLE "Câu chuyện con người", PRODUCT "Câu chuyện sản phẩm" |
| event_type | FOUNDING "Thành lập", MILESTONE "Cột mốc", PRODUCT_LAUNCH "Ra mắt sản phẩm", ACHIEVEMENT "Thành tựu", EXPANSION "Mở rộng", CULTURE_ACTIVITY "Hoạt động văn hóa", PARTNERSHIP "Hợp tác", OTHER "Khác" |
| kind | PRODUCT "Sản phẩm", PROJECT "Dự án" |
| pp_status | PLANNED "Đang lên kế hoạch", ACTIVE "Đang hoạt động", COMPLETED "Đã hoàn thành", DISCONTINUED "Đã ngừng" |
| employee_size | S1_10 "1–10", S11_50 "11–50", S51_200 "51–200", S201_500 "201–500", S500_PLUS "Trên 500" (kèm "nhân sự") |
| media kind | IMAGE "Ảnh", DOCUMENT "Tài liệu", VIDEO "Video", AUDIO "Âm thanh" |
| role | ADMIN "Quản trị", EDITOR "Biên tập", VIEWER "Người xem" |

## 1. Bản đồ route

| Route | Màn hình | Vai trò |
|---|---|---|
| `/login` | Đăng nhập | khách |
| `/signup` | Đăng ký | khách |
| `/forgot-password` | Quên mật khẩu | khách |
| `/reset-password?token=` | Đặt lại mật khẩu | khách |
| `/` | Điều hướng (§2.5) | đã đăng nhập |
| `/new-org` | Tạo doanh nghiệp | đã đăng nhập |
| `/invite/[token]` | Nhận lời mời | mọi người |
| `/o/[orgId]/dashboard` | Tổng quan | mọi vai trò |
| `/o/[orgId]/timeline` | Culture Timeline | mọi vai trò |
| `/o/[orgId]/stories`, `/new`, `/[id]` | Stories | xem: mọi vai trò; tạo: ADMIN, EDITOR |
| `/o/[orgId]/events`, `/new`, `/[id]` | Events | như trên |
| `/o/[orgId]/people`, `/new`, `/[id]` | People | như trên |
| `/o/[orgId]/products`, `/new`, `/[id]` | Products & Projects | như trên |
| `/o/[orgId]/values` | Giá trị văn hóa | xem: mọi vai trò; sửa: ADMIN |
| `/o/[orgId]/library`, `/[id]` | Culture Library | mọi vai trò |
| `/o/[orgId]/review` | Chờ duyệt | ADMIN, EDITOR |
| `/o/[orgId]/atlas` | Culture Atlas | ADMIN, EDITOR |
| `/o/[orgId]/search?q=` | Kết quả tìm kiếm | mọi vai trò |
| `/o/[orgId]/settings/profile` | Hồ sơ doanh nghiệp | mọi vai trò (sửa: ADMIN) |
| `/o/[orgId]/settings/members` | Thành viên & lời mời | ADMIN, EDITOR (EDITOR chỉ xem) |
| `/o/[orgId]/settings/activity` | Nhật ký hoạt động | ADMIN |
| `/nexture-admin` | Danh sách doanh nghiệp | NEXTURE_ADMIN |
| `/nexture-admin/orgs/[orgId]` | Nội dung công khai của doanh nghiệp | NEXTURE_ADMIN |

Vai trò không đủ truy cập route → hiển thị trang 404 của app.

## 2. Tài khoản

### 2.1 Đăng nhập `/login`
- Trường: Email, Mật khẩu (có nút hiện/ẩn).
- Nút "Đăng nhập". Link "Quên mật khẩu?", "Chưa có tài khoản? Đăng ký".
- Sai thông tin: "Email hoặc mật khẩu không đúng." dưới form.
- Có `?next=` thì sau đăng nhập về `next` (chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/`).

### 2.2 Đăng ký `/signup`
- Trường: Họ và tên (2–100), Email, Mật khẩu (≥ 8), Nhập lại mật khẩu.
- Email đã tồn tại: "Email đã được sử dụng."
- Thành công: đăng nhập luôn, đi tới `next` nếu có, nếu không thì `/new-org`.

### 2.3 Quên mật khẩu / Đặt lại mật khẩu
- Quên: nhập Email → luôn hiện "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." (không tiết lộ email có tồn tại hay không).
- Đặt lại: Mật khẩu mới + Nhập lại → thành công chuyển `/login` với toast "Đã đặt lại mật khẩu."; token hỏng: "Liên kết đã hết hạn." + link gửi lại.

### 2.4 Nhận lời mời `/invite/[token]`
- Gọi `GET /invites/{token}`. Lỗi 410: "Lời mời không còn hiệu lực. Hãy liên hệ người đã mời bạn."
- Hiển thị: logo + "Bạn được mời tham gia **{tên doanh nghiệp}** với vai trò **{vai trò}**."
- Chưa đăng nhập: 2 nút "Đăng nhập để tham gia" / "Tạo tài khoản" (kèm `next=/invite/{token}`).
- Đã đăng nhập: nút "Tham gia" → `POST accept` → chuyển `/o/{orgId}/dashboard`. Lỗi `ALREADY_MEMBER`: chuyển thẳng vào tổ chức. Lỗi `INVITE_EMAIL_MISMATCH`: hiện message + nút "Đăng xuất".

### 2.5 Điều hướng `/`
- Chưa đăng nhập → `/login`.
- Không có tổ chức → `/new-org`.
- Có tổ chức → tổ chức trong cookie `last_org_id` nếu vẫn là thành viên, ngược lại tổ chức đầu tiên theo tên.

## 3. Tạo doanh nghiệp `/new-org`

Wizard 3 bước, thanh tiến trình ở trên. Dữ liệu giữ trong state client; chỉ gọi API ở bước cuối (`POST /orgs` một lần, gồm `founderNames` và `values`).

**Bước 1 – Thông tin cơ bản**
| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| Tên doanh nghiệp | ✅ | |
| Đường dẫn trên Atlas | ✅ | Tự điền từ tên (slugify) tới khi người dùng sửa tay. Hiện xem trước `atlas.<domain>/companies/{slug}`. Kiểm tra `GET /orgs/slug-availability` debounce 400 ms; trùng thì báo "Đã có doanh nghiệp dùng đường dẫn này. Gợi ý: {suggestion}". Ghi chú nhỏ: "Có thể đổi cho tới khi hồ sơ lên Atlas." |
| Năm thành lập | | số 1800–năm hiện tại |
| Ngành nghề | | dropdown INDUSTRIES |
| Quy mô nhân sự | | dropdown |
| Tỉnh/Thành phố | | dropdown có tìm kiếm |
| Website | | tự thêm `https://` nếu thiếu |
| Mô tả ngắn | | textarea, đếm ký tự /300 |

Logo không có ở wizard (cần tổ chức tồn tại để upload). Sau khi tạo, checklist ở Dashboard nhắc thêm logo.

**Bước 2 – Người sáng lập:** danh sách ô nhập tên, nút "+ Thêm người sáng lập" (tối đa 5). Có thể bỏ qua.
**Bước 3 – Giá trị cốt lõi:** danh sách (Tên giá trị + Mô tả ngắn), tối đa 10, kéo thả sắp xếp. Có thể bỏ qua.

Nút "Tạo Culture Hub" → thành công chuyển `/o/{id}/dashboard` với toast "Đã tạo Culture Hub cho {tên}."

## 4. Khung ứng dụng (App shell)

**Thanh bên trái** (theo thứ tự; mục người dùng không có quyền thì ẩn):
1. "Tổng quan"
2. "Culture Timeline"
3. "Câu chuyện" (Stories)
4. "Sự kiện" (Events)
5. "Con người" (People)
6. "Sản phẩm & Dự án"
7. "Giá trị văn hóa"
8. "Thư viện tư liệu" (Culture Library)
9. "Chờ duyệt" + badge số lượng (ADMIN, EDITOR)
10. "Culture Atlas" (ADMIN, EDITOR)
11. "Cài đặt"

Ghi chú so với docx: docx gộp Event vào Timeline; ở đây Events có mục danh sách riêng để CRUD, Timeline là màn hình xem. Mục "AI Assistant" bị bỏ.

**Thanh trên:**
- Trái: bộ chọn tổ chức (logo + tên, dropdown liệt kê tổ chức của user và "+ Tạo doanh nghiệp mới"). Chọn tổ chức → ghi cookie `last_org_id`, chuyển về dashboard tổ chức đó.
- Giữa: ô tìm kiếm "Tìm câu chuyện, sự kiện, con người…". Enter → `/o/{orgId}/search?q=`.
- Phải: nút "+ Thêm dữ liệu" (ADMIN, EDITOR; menu: Câu chuyện, Sự kiện, Con người, Sản phẩm/Dự án, Tải tư liệu lên), menu người dùng (tên, email, "Khu NexTure" nếu NEXTURE_ADMIN, "Đăng xuất").

## 5. Tổng quan `/o/[orgId]/dashboard`

Từ trên xuống:
1. **Lời chào:** "Xin chào, {tên}" + tên doanh nghiệp + vai trò.
2. **Checklist bắt đầu** (chỉ ADMIN, EDITOR; ẩn khi đủ 6 mục hoặc người dùng bấm "Ẩn" — lưu localStorage theo orgId):
   - "Thêm logo doanh nghiệp" (`logo` khác null) → `/settings/profile`
   - "Người sáng lập và câu chuyện hình thành" (`onboarding.hasFounder`) → `/people/new?founder=1`
   - "Ít nhất 3 cột mốc phát triển" (`hasEvents`) → `/events/new`
   - "Con người và đóng góp nổi bật" (`hasPeople`) → `/people/new`
   - "Giá trị và câu chuyện văn hóa" (`hasCultureStory`) → `/stories/new?type=CULTURE`
   - "Sản phẩm, dự án và thành tựu" (`hasProduct`) → `/products/new`
3. **Thẻ số liệu** (tối đa 7 thẻ, bấm vào đi tới danh sách): Câu chuyện, Sự kiện, Con người, Sản phẩm & Dự án, Tư liệu, Chờ duyệt (ADMIN/EDITOR), Đang trên Atlas (ADMIN/EDITOR).
4. **Hoạt động gần đây** (ADMIN; 10 dòng; định dạng "{người} {hành động} {đối tượng} · {thời gian tương đối}"; bấm đối tượng mở chi tiết). Bảng câu cho `action` nằm trong `vi.json` khóa `activity.<ACTION>` (VD `ENTITY_APPROVED`: "đã xác minh").

## 6. Danh sách nội dung (dùng chung cho Câu chuyện, Sự kiện, Con người, Sản phẩm & Dự án)

**Đầu trang:** tiêu đề + mô tả 1 dòng + nút "+ Thêm {loại}" (ADMIN, EDITOR).

**Bộ lọc** (đồng bộ lên query string để chia sẻ link):
- Ô tìm trong danh sách (`q`, debounce 300 ms).
- Trạng thái (ADMIN, EDITOR): Tất cả / Nháp / Chờ duyệt / Đã xác minh.
- Hiển thị: Tất cả / Riêng tư / Nội bộ / Công khai.
- Riêng theo loại: Stories: Loại câu chuyện; Events: Loại sự kiện, Từ năm–Đến năm; People: "Chỉ người sáng lập"; Products: Sản phẩm/Dự án.
- Lọc theo người liên quan (Stories, Events, Products): combobox chọn Person.
- Lọc theo giá trị văn hóa (Stories, Events): `valueId`, chỉ đặt được qua link từ màn hình Giá trị văn hóa; khi có, hiện chip "Giá trị: {tên}" có nút ✕.
- Sắp xếp theo giá trị `sort` của API.

**Bảng** (desktop):

| Cột | Stories | Events | People | Products |
|---|---|---|---|---|
| Ảnh nhỏ (48×48, bo góc) | cover | cover | avatar (tròn) | cover |
| Tiêu đề + dòng phụ | title + loại | title + loại | tên + vai trò | title + Sản phẩm/Dự án |
| Ngày | story_date | start_date (– end_date) | joined_date | launch_date |
| Trạng thái | badge | badge | badge | badge |
| Hiển thị | badge visibility + badge publicState nếu khác NOT_PUBLIC | | | |
| Cập nhật | thời gian tương đối, tooltip ngày giờ đầy đủ | | | |

Bấm dòng → trang chi tiết. Phân trang dưới bảng (20/trang).

**Trống:** minh họa + "Chưa có {loại} nào." + nút tạo (nếu có quyền). Trống do bộ lọc: "Không có kết quả phù hợp." + "Xóa bộ lọc".

## 7. Chi tiết / Tạo / Sửa nội dung

Một màn hình dùng cho cả tạo (`/new`) và xem/sửa (`/[id]`).

**Bố cục 2 cột:** trái (≈ 2/3) là nội dung có tab; phải (≈ 1/3) là **bảng trạng thái** dính khi cuộn.

**Chế độ:**
- Người có `permissions.canEdit`: form luôn ở chế độ sửa; nút "Lưu" (dính dưới cùng cột trái) chỉ bật khi có thay đổi. `Ctrl/Cmd+S` = Lưu.
- Người không có `canEdit`: hiển thị dạng đọc (render HTML, không có ô nhập).
- Trang `/new`: chỉ có tab Thông tin; các tab khác hiện sau lần lưu đầu. Nút: "Lưu nháp" và (ADMIN) "Lưu và xác minh". Sau khi tạo chuyển tới `/[id]`.

**Tab "Thông tin" theo loại:**

*Story*
| Trường | Control | Bắt buộc |
|---|---|---|
| Loại câu chuyện | select | ✅ (mặc định từ `?type=` hoặc CULTURE) |
| Tiêu đề | input | ✅ |
| Tóm tắt | textarea, đếm /500 | khi gửi duyệt |
| Nội dung | TipTap | khi gửi duyệt |
| Thời gian | FuzzyDateInput | |
| Ảnh bìa | MediaPicker (chỉ ảnh) | |
| Ghi chú nội bộ | textarea, nền khác màu, nhãn "Chỉ thành viên Hub thấy, không bao giờ lên Atlas" | |

*Event*: Loại sự kiện (select, mặc định MILESTONE), Tiêu đề ✅, Ngày bắt đầu ✅ (FuzzyDate), Ngày kết thúc (FuzzyDate, checkbox "Sự kiện kéo dài" để hiện), Tóm tắt, Nội dung (TipTap), Ảnh bìa, Ghi chú nội bộ.

*Person*: Họ tên ✅, Vai trò/Chức danh (khi gửi duyệt), checkbox "Là người sáng lập" (mặc định bật khi `?founder=1`), Thời gian gia nhập (FuzzyDate), Thời gian rời đi (FuzzyDate, checkbox "Đã rời doanh nghiệp"), Ảnh đại diện (MediaPicker, crop vuông khi hiển thị, không cắt file gốc), Tiểu sử (TipTap), Đóng góp nổi bật (TipTap), Ghi chú nội bộ. Dưới form có ghi chú: "Không nhập thông tin liên hệ cá nhân (số điện thoại, email, địa chỉ nhà)."

*Product/Project*: Loại (Sản phẩm/Dự án) ✅, Tên ✅, Tóm tắt (khi gửi duyệt), Ngày ra mắt/khởi động (FuzzyDate), Tình trạng (select pp_status), Mô tả (TipTap), Ảnh bìa, Ghi chú nội bộ.

Lỗi validate hiển thị dưới từng trường; khi lưu có lỗi, cuộn tới trường lỗi đầu tiên. Lỗi `REQUIRED_FOR_REVIEW` từ API: đánh dấu các trường trong `details.fields` và toast message.

**Tab "Liên quan":** một khối cho mỗi loại đích hợp lệ (theo bảng `02-database-ghi-chu.md` §6):
- Story: Sự kiện, Con người, Sản phẩm & Dự án, Giá trị văn hóa.
- Event: Con người, Câu chuyện, Sản phẩm & Dự án, Giá trị văn hóa.
- Person: Sự kiện, Câu chuyện, Sản phẩm & Dự án.
- Product: Sự kiện, Con người, Câu chuyện.
Mỗi khối: danh sách thẻ nhỏ (ảnh, tiêu đề, badge trạng thái, nút ✕ nếu `canEdit`) + combobox "Thêm…" tìm theo tên (gọi API danh sách loại đó với `q`, hiển thị tối đa 10). Thay đổi gửi ngay `PUT .../relations` (không cần bấm Lưu); lỗi thì hoàn tác và toast. Nút "+ Tạo mới" trong combobox mở tab mới tới `/new` của loại đó.

**Tab "Ảnh & video":** lưới ảnh kèm (`entity_media`), kéo thả sắp xếp, ô chú thích từng ảnh, nút "Thêm từ thư viện" (MediaPicker nhiều lựa chọn, chỉ IMAGE/VIDEO) và "Tải lên" (upload rồi tự gắn). Lưu ngay bằng `PUT .../media`. Ảnh có visibility khác PUBLIC hiện biểu tượng cảnh báo với tooltip "Ảnh này sẽ không hiển thị trên Atlas vì chưa được công khai".

**Tab "Nguồn & bằng chứng":** danh sách nguồn (tiêu đề, link hoặc tư liệu, ghi chú, công tắc "Hiển thị trên Atlas"), nút "+ Thêm nguồn" mở dialog 2 tab: "Từ thư viện" (MediaPicker, mọi loại) / "Đường link" (URL). Kéo thả sắp xếp.

**Bảng trạng thái (cột phải):**
1. Badge trạng thái + dòng "Tạo bởi {tên} · {ngày}", "Cập nhật bởi {tên} · {ngày}", "Xác minh bởi {tên} · {ngày}" (nếu có).
2. Nếu `returnNote`: hộp cảnh báo "Admin đã trả lại: {note}".
3. Nút hành động theo `permissions` (hiển thị theo thứ tự):
   - `canSubmit`: "Gửi duyệt"
   - `canApprove`: "Xác minh" (dạng nút chính)
   - `canReturn`: "Trả lại" → dialog nhập lý do (bắt buộc)
   - `canWithdraw`: "Rút lại"
   - `canUnverify`: "Bỏ xác minh" → dialog: "Nội dung sẽ trở về Nháp. Nếu đang công khai, nội dung sẽ bị gỡ khỏi Atlas."
   - Nếu form đang có thay đổi chưa lưu, các nút trên bị disable với tooltip "Hãy lưu thay đổi trước".
4. **Hiển thị:** radio Riêng tư / Nội bộ / Công khai; chỉ các giá trị trong `allowedVisibilities` bật được. Mô tả nhỏ dưới mỗi lựa chọn:
   - Riêng tư: "Chỉ Quản trị và Biên tập thấy."
   - Nội bộ: "Mọi thành viên thấy khi đã xác minh."
   - Công khai: "Hiển thị trên Culture Atlas cho mọi người."
   Chọn "Công khai" mở dialog xem trước (§7.1) rồi mới xác nhận. Chọn bỏ "Công khai" khi đang LIVE: dialog "Nội dung sẽ bị gỡ khỏi Atlas ngay." Option "Công khai" bị disable với tooltip "Cần xác minh trước" khi chưa VERIFIED (ngoại lệ với quy tắc ẩn nút).
5. **Atlas:** badge `publicState`; nếu LIVE có link "Xem trên Atlas ↗"; nếu HIDDEN hiện lý do.
6. "Xem trước trên Atlas" (ADMIN, EDITOR): mở dialog §7.1 bất kỳ lúc nào.
7. Story COMPANY (ADMIN): checkbox "Dùng làm câu chuyện doanh nghiệp trên Atlas" (gọi `PATCH /orgs/{id}` với `featuredStoryId`).
8. "Xóa" (nếu `canDelete`), cuối cùng, dạng nút chữ màu danger. Dialog: "Xóa {tiêu đề}? Liên kết với nội dung khác sẽ bị gỡ." + nếu LIVE: "Nội dung sẽ bị gỡ khỏi Atlas."

### 7.1 Dialog xem trước Atlas
- Gọi `GET .../public-preview`, render bằng **chính component trang chi tiết của Atlas** từ `packages/ui/atlas` trong khung giả lập trình duyệt (thanh địa chỉ hiện `path`).
- `warnings` hiển thị dạng danh sách phía trên: NOT_VERIFIED "Nội dung chưa được xác minh"; ORG_ATLAS_DISABLED "Hồ sơ doanh nghiệp chưa bật trên Atlas, nội dung sẽ chờ tới khi bật"; COVER_NOT_PUBLIC "Ảnh bìa chưa công khai nên sẽ không hiển thị"; SOME_MEDIA_NOT_PUBLIC "Một số ảnh chưa công khai"; NO_SUMMARY "Chưa có tóm tắt".
- Khi mở từ thao tác chọn "Công khai": 2 nút "Công khai" / "Hủy". Khi mở từ nút xem trước: chỉ "Đóng".

## 8. Culture Timeline `/o/[orgId]/timeline`
- Trục dọc ở giữa (desktop) hoặc bên trái (mobile), nhóm theo năm (tiêu đề năm lớn), trong năm sắp theo `start_date`, cùng ngày thì theo tiêu đề.
- Mỗi mục: chấm trên trục (màu theo event_type), ngày mờ, tiêu đề, loại, tóm tắt (2 dòng), ảnh bìa nhỏ, avatar các người liên quan (tối đa 3 + "+n"), badge trạng thái nếu không phải VERIFIED.
- Bấm mục → mở **drawer bên phải** hiển thị chi tiết dạng đọc: nội dung, Câu chuyện, Con người, Sản phẩm/Dự án liên quan, ảnh/video, nguồn; nút "Mở trang chi tiết".
- Bộ lọc trên cùng: Loại sự kiện, Người liên quan, Giá trị văn hóa; công tắc "Hiện cả nội dung chưa xác minh" (ADMIN, EDITOR; mặc định tắt).
- Trống: "Chưa có sự kiện nào trên dòng thời gian." + nút "+ Thêm sự kiện".

## 9. Giá trị văn hóa `/o/[orgId]/values`
- Danh sách thẻ theo `sort_order`: tên, mô tả, "{n} câu chuyện" (link `/stories?valueId=`), "{n} sự kiện" (link `/events?valueId=`), badge Nội bộ/Công khai.
- ADMIN: kéo thả sắp xếp (`PUT /values/order`), nút sửa (dialog: Tên, Mô tả, công tắc "Hiển thị trên hồ sơ Atlas"), xóa (dialog: "Các liên kết với câu chuyện và sự kiện sẽ bị gỡ.").
- Nút "+ Thêm giá trị" (ADMIN).

## 10. Thư viện tư liệu `/o/[orgId]/library`
- Chuyển chế độ **Lưới** (mặc định) / **Danh sách**, lưu localStorage.
- Bộ lọc: tìm theo tên, Loại (Ảnh/Tài liệu/Video/Âm thanh), Thẻ (tag), Trạng thái, Hiển thị.
- Lưới: thẻ vuông; ảnh hiện thumbnail (`url` presigned, `object-fit: cover`), loại khác hiện icon lớn theo loại + đuôi file; dưới là tên (1 dòng) và badge.
- Danh sách: cột Tên, Loại, Dung lượng (KB/MB), Ngày xảy ra, Người cung cấp, Trạng thái, Ngày tải lên.
- **Tải lên:** nút "Tải lên" và kéo thả file vào trang. Dialog liệt kê từng file với thanh tiến trình; file sai định dạng/quá dung lượng báo lỗi ngay ở client (cùng quy tắc với server). Sau khi tải xong từng file, hiện form metadata rút gọn (Tên, Ngày xảy ra, Nguồn, Người cung cấp, Thẻ) — có thể bỏ qua, sửa sau.
- **Chi tiết** `/library/[id]`: xem trước (ảnh: ảnh lớn; PDF: nhúng `<iframe>` presigned URL; video/audio: thẻ `<video>`/`<audio>`; DOC/DOCX: icon + nút "Tải xuống"), form metadata (Tên, Mô tả, Alt text cho ảnh, Ngày xảy ra, Nguồn, Người cung cấp, Thẻ), bảng trạng thái giống §7 (không có Atlas preview), mục "Đang được dùng ở" (từ `usedIn`), nút "Tải xuống", "Xóa".
- **MediaPicker** (dùng ở form): dialog có tìm kiếm + lọc loại cố định theo ngữ cảnh + lưới chọn + nút "Tải lên mới". Chỉ liệt kê media `READY`.

## 11. Chờ duyệt `/o/[orgId]/review`
- Danh sách mọi bản ghi `PENDING_REVIEW` (nội dung + tư liệu), cũ nhất trước: loại, tiêu đề, người gửi, thời gian gửi.
- ADMIN: mỗi dòng có nút "Xác minh", "Trả lại" (dialog lý do), "Xem" (mở chi tiết). Chọn nhiều dòng + "Xác minh các mục đã chọn" (gọi tuần tự từng API, báo kết quả "Đã xác minh {n}/{m}").
- EDITOR: chỉ xem, cột "Trạng thái" ghi "Đang chờ Quản trị xác minh".
- Trống: "Không có nội dung nào đang chờ duyệt."

## 12. Culture Atlas `/o/[orgId]/atlas`
1. **Thẻ hồ sơ:** logo, tên, đường dẫn Atlas; trạng thái "Đang hiển thị" / "Chưa bật" / "Bị NexTure ẩn: {lý do}"; công tắc "Hiển thị hồ sơ trên Atlas" (ADMIN).
   - Bật khi thiếu trường: không gọi API; hiện danh sách trường thiếu ("Logo", "Năm thành lập", "Ngành nghề", "Tỉnh/Thành phố", "Mô tả ngắn") với link tới Cài đặt.
   - Bật lần đầu: dialog "Sau khi bật, đường dẫn {slug} sẽ được khóa và không đổi được nữa." 
   - Tắt: dialog "Toàn bộ hồ sơ và nội dung sẽ bị gỡ khỏi Atlas. Dữ liệu trong Hub giữ nguyên."
   - Nút "Xem như khách ↗" khi đang hiển thị.
2. **Số liệu:** bảng loại × (Đang trên Atlas / Chờ bật hồ sơ / Bị ẩn / Đã xác minh nhưng chưa công khai).
3. **Tab danh sách:** "Đang trên Atlas", "Chờ bật hồ sơ", "Bị NexTure ẩn", "Đã xác minh, chưa công khai". Mỗi tab là bảng nội dung, client gọi song song API danh sách của 4 loại + media với `publicState=LIVE|WAITING_ORG|HIDDEN_BY_NEXTURE` (3 tab đầu) hoặc `status=VERIFIED&publicState=NOT_PUBLIC` (tab cuối), `pageSize=100`, rồi gộp và sắp theo `updatedAt` với nút "Xem trên Atlas", "Mở" và (ADMIN, tab cuối) nút "Công khai" mở dialog §7.1.

## 13. Tìm kiếm `/o/[orgId]/search`
- Ô tìm lớn ở đầu, bộ lọc: loại (checkbox), trạng thái, người liên quan, từ năm–đến năm.
- Kết quả nhóm theo loại, mỗi nhóm tối đa 20 dòng + "Xem tất cả {n}" (chuyển sang danh sách loại đó với `q`).
- Đánh dấu (in đậm) phần khớp từ khóa trong tiêu đề (khớp không dấu).
- Từ khóa < 2 ký tự: "Nhập ít nhất 2 ký tự."

## 14. Cài đặt

### 14.1 Hồ sơ doanh nghiệp `/settings/profile`
Form các trường của `OrgProfileFields` (giống wizard bước 1) + Logo (MediaPicker ảnh, có nút tải lên). Slug: nếu `slugLocked` thì hiển thị đọc với ghi chú "Đường dẫn đã khóa vì hồ sơ đã lên Atlas." Không phải ADMIN thì chỉ xem.

### 14.2 Thành viên `/settings/members`
- Bảng: Tên, Email, Vai trò (ADMIN: select đổi ngay, dialog xác nhận khi hạ Admin), Ngày tham gia, nút "Xóa" (ADMIN) / "Rời doanh nghiệp" (dòng của chính mình).
- Khối "Lời mời đang chờ" (ADMIN): vai trò, email (nếu có), hết hạn, người tạo, nút "Thu hồi".
- Nút "+ Mời thành viên" (ADMIN): dialog chọn Vai trò, Email (tùy chọn, "Chỉ email này dùng được lời mời"). Sau khi tạo: hiện link + nút "Sao chép", cảnh báo "Link chỉ hiển thị một lần, hết hạn sau 7 ngày."

### 14.3 Nhật ký `/settings/activity`
Bảng phân trang: Thời gian, Người, Hành động (câu từ `vi.json`), Đối tượng (link), nút mở rộng xem `changes` dạng bảng Trường / Trước / Sau.

## 15. Khu NexTure `/nexture-admin`
Layout riêng, thanh trên ghi "NexTure · Quản trị nội bộ", màu nền phân biệt (token `admin-surface`).

### 15.1 Danh sách doanh nghiệp
Bảng: Tên, Slug, Ngày tạo, Số thành viên, Atlas (Bật/Tắt/Bị ẩn), Số nội dung đang trên Atlas, link "Xem trên Atlas". Tìm theo tên. Bấm dòng → 15.2.

### 15.2 Chi tiết doanh nghiệp
- Đầu trang: tên, trạng thái hồ sơ, nút "Ẩn hồ sơ khỏi Atlas" / "Bỏ ẩn hồ sơ".
- Bảng nội dung (`GET /admin/organizations/{orgId}/public-entities`): Loại, Tiêu đề, Trạng thái (Đang hiển thị / Bị ẩn: lý do, ngày), link Atlas, nút "Ẩn" / "Bỏ ẩn".
- Dialog "Ẩn": ô lý do (bắt buộc, 5–500 ký tự), ghi chú "Doanh nghiệp sẽ thấy lý do này trong Hub."
