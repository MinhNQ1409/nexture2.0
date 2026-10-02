# 10. Use case và tiêu chí nghiệm thu

Mỗi use case (UC) có tiêu chí Given/When/Then. UC đánh dấu **[E2E]** PHẢI có test Playwright trong `e2e/` (tên file `uc-XX-*.spec.ts`), chạy trên database seed sạch (`11-seed-deploy.md` §2, bộ `test`).

Tài khoản trong test (seed `test`): `admin@a.test` (ADMIN tổ chức A), `editor@a.test` (EDITOR A), `viewer@a.test` (VIEWER A), `admin@b.test` (ADMIN tổ chức B), `nexture@nexture.test` (NEXTURE_ADMIN, không thuộc tổ chức nào). Mật khẩu chung `Test@12345`.

## Nhóm A. Tài khoản và tổ chức

**UC-01 Đăng ký và tạo Culture Hub [E2E]**
- Given khách chưa có tài khoản
- When đăng ký với tên, email, mật khẩu hợp lệ
- Then được đăng nhập và chuyển tới `/new-org`
- When nhập tên "Công ty Thử Nghiệm", bỏ qua slug, thêm 1 người sáng lập "Nguyễn Văn A", 2 giá trị "Tận tâm", "Sáng tạo", bấm "Tạo Culture Hub"
- Then chuyển tới dashboard; slug = `cong-ty-thu-nghiem`; Con người có "Nguyễn Văn A" (Đã xác minh, Nội bộ, là người sáng lập); Giá trị văn hóa có 2 mục đúng thứ tự; người dùng có vai trò Quản trị; nhật ký có `ORG_CREATED`.

**UC-02 Slug trùng**
- Given đã có tổ chức slug `cong-ty-thu-nghiem`
- When tổ chức khác nhập slug này ở wizard
- Then hiện "Đã có doanh nghiệp dùng đường dẫn này. Gợi ý: cong-ty-thu-nghiem-2"; gửi API vẫn bằng slug trùng → 409 `SLUG_TAKEN`.

**UC-03 Mời thành viên [E2E]**
- Given `admin@a.test` ở Cài đặt › Thành viên
- When tạo lời mời vai trò Biên tập, không email
- Then thấy link một lần; user mới mở link khi chưa đăng nhập → thấy tên tổ chức + vai trò → tạo tài khoản → bấm "Tham gia" → vào dashboard tổ chức A với vai trò Biên tập.
- And mở lại link đó lần nữa → "Lời mời không còn hiệu lực."

**UC-04 Lời mời giới hạn email**
- Given lời mời gắn email `x@a.test`
- When user `y@a.test` bấm "Tham gia"
- Then 403 `INVITE_EMAIL_MISMATCH`, không tạo membership.

**UC-05 Bảo vệ Admin cuối cùng**
- Given tổ chức chỉ có 1 Admin
- When Admin tự hạ vai trò thành Biên tập, hoặc tự rời
- Then 409 `LAST_ADMIN`, giao diện báo "Tổ chức cần ít nhất một Admin."

**UC-06 Cô lập dữ liệu giữa tổ chức [E2E]**
- Given `admin@b.test`
- When gọi `GET /api/v1/orgs/{orgA}/stories` và `GET /api/v1/orgs/{orgA}/stories/{storyA}` và mở `/o/{orgA}/dashboard`
- Then cả ba đều 404.
- And `GET /api/v1/orgs/{orgB}/stories/{storyA}` (id của A dưới đường dẫn B) → 404.

**UC-07 Quên mật khẩu**
- When nhập email tồn tại và không tồn tại
- Then cả hai hiện cùng một thông báo; chỉ email tồn tại nhận được mail (kiểm tra bằng mock Resend trong test); link đặt lại dùng được một lần, hết hạn sau 1 giờ.

## Nhóm B. Nội dung và xác minh

**UC-10 Editor tạo và gửi duyệt Story [E2E]**
- Given `editor@a.test`
- When tạo Story loại "Câu chuyện văn hóa", chỉ nhập tiêu đề, bấm "Lưu nháp"
- Then Story ở trạng thái Nháp, Nội bộ; tab Liên quan/Ảnh/Nguồn xuất hiện.
- When bấm "Gửi duyệt"
- Then 422 `REQUIRED_FOR_REVIEW`, trường Tóm tắt và Nội dung được đánh dấu.
- When nhập tóm tắt, nội dung, lưu, bấm "Gửi duyệt"
- Then trạng thái Chờ duyệt; form chuyển sang chỉ đọc với Editor; Story xuất hiện ở trang Chờ duyệt.

**UC-11 Admin duyệt và trả lại [E2E]**
- Given Story của UC-10 đang Chờ duyệt
- When `admin@a.test` mở trang Chờ duyệt, bấm "Trả lại" với lý do "Thiếu năm"
- Then Story về Nháp; Editor mở Story thấy hộp "Admin đã trả lại: Thiếu năm".
- When Editor sửa, gửi lại; Admin bấm "Xác minh"
- Then Story Đã xác minh, hiện "Xác minh bởi {admin}"; Editor không còn sửa được; nhật ký có `ENTITY_SUBMITTED`, `ENTITY_RETURNED`, `ENTITY_APPROVED`.

**UC-12 Admin tạo và xác minh ngay**
- When Admin tạo Event với "Lưu và xác minh"
- Then Event Đã xác minh ngay, `verified_by` = Admin.

**UC-13 Editor không leo thang quyền**
- Given Story Đã xác minh
- When `editor@a.test` gọi `PATCH`, `POST .../approve`, `PUT .../visibility` với `PUBLIC`, `DELETE` qua API
- Then tất cả 403; dữ liệu không đổi.
- And Editor tạo Story với `status: VERIFIED` → 422.

**UC-14 Viewer chỉ thấy nội dung đã xác minh [E2E]**
- Given A có Story S1 (Đã xác minh, Nội bộ), S2 (Nháp), S3 (Đã xác minh, Riêng tư); S1 có quan hệ tới Person P (Nháp)
- When `viewer@a.test` mở danh sách Câu chuyện
- Then chỉ thấy S1; mở S1 không thấy P trong Liên quan, không thấy ghi chú nội bộ; truy cập trực tiếp S2, S3 → 404; menu không có Chờ duyệt, Culture Atlas, Nhật ký.

**UC-15 Sửa đồng thời**
- Given Admin mở Story ở hai tab
- When lưu ở tab 1 rồi lưu ở tab 2
- Then tab 2 nhận dialog "Nội dung vừa được người khác cập nhật."; dữ liệu tab 1 giữ nguyên.

**UC-16 Ngày không chắc chắn**
- When tạo Event với ngày bắt đầu độ chính xác "Tháng", chọn 17/05/2024
- Then lưu `2024-05-01` + `MONTH`, hiển thị "05/2024" ở Hub, Timeline và Atlas.
- And ngày kết thúc trước ngày bắt đầu → lỗi validate.

**UC-17 Quan hệ hai chiều [E2E]**
- When Editor ở Story S (Nháp) thêm liên quan Person P và Event E
- Then mở P thấy S trong "Câu chuyện liên quan"; mở E thấy S; bỏ P ở S → P không còn S.
- And thêm quan hệ tới nội dung tổ chức khác qua API → 422 `INVALID_RELATION`.

**UC-18 Xóa nội dung**
- Given Story S có quan hệ tới P, đang là Story nổi bật
- When Admin xóa S
- Then S biến mất khỏi danh sách và tìm kiếm; P không còn quan hệ; `featured_story_id` = NULL; nhật ký `ENTITY_DELETED`.
- And Editor xóa Story Nháp của người khác → 403.

**UC-19 Giá trị văn hóa**
- When Admin thêm, đổi tên, kéo thả sắp xếp, xóa giá trị
- Then thứ tự lưu đúng; trùng tên (không phân biệt hoa thường) → 409 `VALUE_NAME_TAKEN`; xóa thì gỡ liên kết khỏi Story/Event.
- And Editor không thấy nút sửa; gọi API → 403.

## Nhóm C. Thư viện tư liệu

**UC-20 Tải lên nhiều file [E2E]**
- When Editor kéo thả 1 JPG, 1 PDF, 1 file `.exe` vào Thư viện
- Then `.exe` bị từ chối ngay ở client với "Định dạng tệp không được hỗ trợ."; 2 file còn lại có thanh tiến trình, xong thì xuất hiện trong lưới với loại đúng; ảnh có width/height.

**UC-21 Giới hạn dung lượng**
- When gọi `upload-url` với ảnh 21 MB
- Then 422 `FILE_TOO_LARGE`, `details.maxBytes = 20971520`.

**UC-22 Complete không khớp**
- When gọi `complete` khi chưa PUT file lên R2
- Then 422 `UPLOAD_MISMATCH`, media vẫn PENDING, không xuất hiện trong danh sách.

**UC-23 Media đang được dùng**
- Given ảnh M là ảnh bìa của Story S
- When xóa M
- Then 409 `MEDIA_IN_USE`, dialog liệt kê "Ảnh bìa · {S}".

**UC-24 Viewer và tư liệu**
- Then Viewer chỉ thấy tư liệu Đã xác minh, không Riêng tư; không thấy nút Tải lên.

## Nhóm D. Timeline, tìm kiếm, dashboard

**UC-30 Culture Timeline [E2E]**
- Given A có Event 2023 (Thành lập), 2024 (Ra mắt sản phẩm), 2025 (Mở rộng), một Event Nháp 2022
- When Admin mở Timeline
- Then thấy 3 nhóm năm 2023, 2024, 2025 theo thứ tự; bật "Hiện cả nội dung chưa xác minh" thì thấy thêm 2022 với badge Nháp; bấm một Event mở drawer có Câu chuyện, Con người, Sản phẩm liên quan.

**UC-31 Tìm kiếm không dấu**
- Given Person "Nguyễn Thị Hạnh", Story "Hành trình đổi mới"
- When tìm "nguyen thi hanh" và "hanh trinh"
- Then tìm thấy đúng; tìm "đổi" và "doi" đều ra Story; tìm "h" → "Nhập ít nhất 2 ký tự."

**UC-32 Dashboard và checklist**
- Given tổ chức mới chỉ có người sáng lập
- Then checklist tick "Người sáng lập…", các mục khác chưa tick; số liệu đúng với dữ liệu; Viewer không thấy checklist và Hoạt động gần đây.

## Nhóm E. Công khai lên Atlas

**UC-40 Bật hồ sơ Atlas [E2E]**
- Given tổ chức A chưa có logo
- When Admin bật công tắc "Hiển thị hồ sơ trên Atlas"
- Then hiện danh sách thiếu "Logo"; không gọi được API (gọi trực tiếp → 422 `ATLAS_PROFILE_INCOMPLETE`).
- When thêm logo, bật lại, xác nhận dialog khóa đường dẫn
- Then `/companies/{slug}` trên Atlas hiển thị hero đúng thông tin, trong ≤ 10 giây (revalidate); slug ở Cài đặt chuyển sang chỉ đọc.

**UC-41 Công khai một Story [E2E]**
- Given Story S Đã xác minh, có ảnh bìa M (Đã xác minh, Công khai), liên quan Person P (Đã xác minh, Nội bộ), nguồn N1 (link, bật "Hiển thị trên Atlas"), N2 (tư liệu PDF, tắt), ghi chú nội bộ "SECRET-123"
- When Admin chọn "Công khai", xem dialog preview, bấm "Công khai"
- Then badge "Đang trên Atlas" + link; trang `/stories/{slug}` trên Atlas hiển thị tiêu đề, ảnh bìa, nội dung, nguồn N1; **không** có P, N2, "SECRET-123".
- When Admin công khai P
- Then trang S hiện P trong "Con người", trang P hiện S trong "Câu chuyện".

**UC-42 Chỉ nội dung đã xác minh mới công khai được**
- Given Story Nháp
- Then option "Công khai" bị disable với tooltip; gọi API → 409 `NOT_VERIFIED`.

**UC-43 Sửa nội dung đang công khai**
- Given S đang LIVE
- When Admin đổi tiêu đề
- Then trang Atlas hiển thị tiêu đề mới trong ≤ 10 giây; **URL không đổi**.

**UC-44 Gỡ khỏi Atlas [E2E]**
- Given S đang LIVE ở `/stories/x`
- When Admin đổi visibility sang Nội bộ (hoặc Bỏ xác minh, hoặc Xóa)
- Then `/stories/x` trả **410**; S biến mất khỏi trang công ty, trang P, tìm kiếm Atlas, sitemap; dữ liệu trong Hub còn nguyên (trừ trường hợp Xóa).
- When công khai lại S
- Then S xuất hiện lại ở đúng `/stories/x`, trả 200.

**UC-45 Tắt hồ sơ Atlas**
- When Admin tắt công tắc hồ sơ
- Then `/companies/{slug}` và mọi trang nội dung của A trả 410; nội dung trong Hub giữ `visibility = PUBLIC` với nhãn "Chờ bật hồ sơ Atlas"; bật lại thì mọi trang trở lại với cùng URL.

**UC-46 Ảnh không công khai**
- Given S LIVE với ảnh bìa M có visibility Nội bộ
- Then Atlas hiển thị placeholder; dialog preview có cảnh báo "Ảnh bìa chưa công khai…"; bucket public không có file M.

**UC-47 Đổi Sản phẩm thành Dự án**
- Given Product X LIVE ở `/products/x`
- When Admin đổi loại thành Dự án
- Then `/projects/x` trả 200; `/products/x` trả 308 sang `/projects/x`.

**UC-48 Database cô lập Atlas**
- When kết nối bằng `DATABASE_URL_ATLAS` và chạy `SELECT * FROM core.stories`
- Then lỗi permission denied (test tự động trong `packages/core/test/public.test.ts`).

## Nhóm F. NexTure Admin

**UC-50 Ẩn nội dung vi phạm [E2E]**
- Given S của A đang LIVE
- When `nexture@nexture.test` vào `/nexture-admin`, mở A, bấm "Ẩn" S với lý do "Nội dung chưa kiểm chứng"
- Then `/stories/{slug}` trả 410; trong Hub, Admin A thấy "Bị NexTure ẩn: Nội dung chưa kiểm chứng"; Admin A sửa S hoặc bật/tắt visibility không làm S hiện lại.
- When NexTure bấm "Bỏ ẩn"
- Then S hiện lại.

**UC-51 Ẩn cả doanh nghiệp**
- Tương tự UC-50 cho cả hồ sơ: mọi trang của A trả 410.

**UC-52 NexTure không đọc dữ liệu nội bộ**
- When `nexture@nexture.test` gọi `GET /api/v1/orgs/{orgA}/stories` hoặc mở `/o/{orgA}/dashboard`
- Then 404.
- And user thường mở `/nexture-admin` → 404.

## Nhóm G. Atlas cho khách

**UC-60 Luồng khách tham quan [E2E]** (điều kiện hoàn thành Atlas MVP của docx)
- Given dữ liệu seed `demo`
- When khách mở trang chủ, tìm "cà phê", mở hồ sơ công ty, cuộn tới Dòng thời gian, mở một Sự kiện, mở Câu chuyện liên quan, mở Người liên quan
- Then mọi trang 200, có dữ liệu, có link liên quan qua lại; không có lỗi console.

**UC-61 Khám phá có bộ lọc**
- When lọc Ngành = Thực phẩm & Đồ uống, Tỉnh = Lâm Đồng
- Then chỉ còn công ty thỏa cả hai; URL chứa tham số; tải lại trang giữ bộ lọc.

**UC-62 SEO cơ bản**
- Then trang công ty và story có `<title>`, meta description, OG image, canonical, JSON-LD đúng loại; `/sitemap.xml` liệt kê mọi trang LIVE; khi `DEMO_MODE=true`, `/robots.txt` có `Disallow: /`.

**UC-63 Hiệu năng**
- Then Lighthouse mobile trang công ty và story đạt ngưỡng ở `07-atlas-man-hinh.md` §12.

## Định nghĩa MVP hoàn thành

Tất cả UC nhóm A–G pass trên staging, cộng chạy tay trọn luồng sau trên môi trường demo không có lỗi:

Đăng ký → Tạo Culture Hub → Nhập hồ sơ + logo → Thêm 1 Story người sáng lập, 5–10 Event, vài Person, 1 Product → Upload tư liệu và gắn làm ảnh/nguồn → Editor gửi duyệt, Admin xác minh → Xem Culture Timeline → Bật hồ sơ Atlas → Công khai 3–5 nội dung → Khách xem trên Atlas → Sửa một nội dung, Atlas cập nhật → Gỡ một nội dung, Atlas trả 410.
