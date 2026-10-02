# 12. Quyết định cần PO xác nhận

Bộ đặc tả đang chạy theo các mặc định dưới đây. Dev cứ làm theo mặc định; nếu PO đổi ý ở mục nào, cập nhật file liên quan rồi mới code phần đó.

Cách duyệt: điền cột "PO" bằng **OK** hoặc ghi quyết định khác.

**Trạng thái 2026-10-02:** c đã đồng ý toàn bộ 33 mặc định ("OK full 12 câu hỏi cho PO"). Các mục dưới đây được coi là **đã chốt**. Riêng mục 31 vẫn cần điền kết quả tra cứu tên trước khi demo.

## 1. Khác với docx hoặc lời PO (quan trọng nhất)

| # | Mặc định đang dùng | Docx / PO nói | Vì sao | Ảnh hưởng nếu đổi | PO |
|---|---|---|---|---|---|
| 1 | **Doanh nghiệp tự bật công khai, nội dung lên Atlas ngay**, không qua NexTure duyệt. | PO: "đội ngũ NexTure sẽ tiến hành đăng tải". Docx: có NexTure Review, Approve/Reject/Request Edit. | Người dùng (c) chọn ngày 2026-10-02 để ra MVP nhanh. | Thêm hàng chờ duyệt + snapshot: khoảng +15–20M token khi code. Schema hiện tại thêm được mà không phá. || OK |
| 2 | NexTure kiểm duyệt **sau**: chỉ có quyền ẩn nội dung/hồ sơ vi phạm, kèm lý do. | Kiểm duyệt trước khi đăng. | Đi kèm mục 1. | || OK |
| 3 | Không có Public Snapshot và phiên bản. Admin sửa nội dung đang công khai thì Atlas cập nhật ngay. | Snapshot, CHANGED_AFTER_PUBLISH, republish. | Đi kèm mục 1. | || OK |
| 4 | Không công khai theo từng trường; dùng danh sách trường công khai cố định (`08-cong-khai.md` §3). Ghi chú nội bộ, người tạo, trạng thái không bao giờ công khai. | Cho chọn trường (có thể dùng preset). | Đơn giản, an toàn. | || OK |
| 5 | Không có AI, không trích văn bản, không chuyển giọng nói. | AI Story Structuring là P0. | Người dùng (c) chốt ngày 2026-10-02. | || OK |
| 6 | Atlas đọc trực tiếp một vùng dữ liệu riêng trong database bằng tài khoản chỉ-đọc, không gọi Public API qua HTTP. | Atlas gọi Public API. | Cùng mức an toàn (database chặn đọc dữ liệu nội bộ), ít code hơn. Có thể thêm Public API sau cho đối tác. | || OK |
| 7 | Trang duyệt của NexTure nằm trong app Hub (`/nexture-admin`), không ở Atlas. | `/admin/publishing` trên Atlas. | Giữ Atlas thuần public, không có đăng nhập. | || OK |
| 8 | Gỡ nội dung khỏi Atlas: đường dẫn cũ trả mã 410 ("không còn hiển thị"). | Không nói rõ. | Báo đúng cho Google để gỡ khỏi kết quả tìm kiếm. | || OK |

## 2. Nghiệp vụ trong Hub

| # | Mặc định | PO |
|---|---|---|
| 9 | Pilot: nhân sự NexTure muốn nhập liệu hộ doanh nghiệp thì được doanh nghiệp mời làm Biên tập như người dùng thường. Không có chức năng "đăng nhập thay". || OK |
| 10 | Không có trạng thái "Bị từ chối". Admin "Trả lại" kèm lý do, nội dung về Nháp. || OK |
| 11 | Biên tập (Editor) chỉ sửa được nội dung đang Nháp. Nội dung đã gửi duyệt hoặc đã xác minh chỉ Admin sửa. || OK |
| 12 | Admin được "Lưu và xác minh" ngay, không cần qua bước gửi duyệt. || OK |
| 13 | Người xem (Viewer) chỉ thấy nội dung đã xác minh và không Riêng tư; không thấy ghi chú nội bộ; không thấy trang Chờ duyệt, Atlas, Nhật ký. || OK |
| 14 | Giá trị văn hóa do Admin quản lý, không có bước xác minh. || OK |
| 15 | Người sáng lập là một "Con người" có đánh dấu "Là người sáng lập", không phải trường riêng của hồ sơ doanh nghiệp. || OK |
| 16 | Không lưu thông tin liên hệ cá nhân (SĐT, email, địa chỉ) của "Con người". || OK |
| 17 | Sự kiện có danh sách riêng để quản lý; Culture Timeline là màn hình xem. || OK |
| 18 | Một tài khoản có thể thuộc nhiều doanh nghiệp. || OK |
| 19 | Không xác minh email khi đăng ký; mời thành viên bằng link sao chép (không gửi email mời). Chỉ "Quên mật khẩu" gửi email. || OK |
| 20 | Không có chức năng xóa doanh nghiệp trong MVP (làm tay qua NexTure nếu cần). || OK |
| 21 | Tư liệu không cần xác minh để gắn vào nội dung; chỉ lên Atlas khi đã xác minh và Công khai. || OK |
| 22 | Các use case khai thác (onboarding, đào tạo, employer branding, xuất tài liệu giới thiệu) phục vụ bằng việc nhân viên đăng nhập Hub với vai trò Người xem. Chưa có xuất PDF/slide. || OK |

## 3. Atlas

| # | Mặc định | PO |
|---|---|---|
| 23 | Logo luôn được công khai khi doanh nghiệp bật hồ sơ Atlas (không cần bật công khai riêng cho ảnh logo). || OK |
| 24 | Tư liệu gốc (PDF, DOCX…) làm nguồn không được công khai; Atlas chỉ hiện tên nguồn. Nguồn dạng đường link thì hiện link. || OK |
| 25 | Đường dẫn doanh nghiệp (slug) khóa vĩnh viễn sau lần đầu bật Atlas. Đường dẫn từng nội dung cũng không đổi khi sửa tiêu đề. || OK |
| 26 | "Câu chuyện doanh nghiệp" trên hồ sơ là một Story loại "Câu chuyện doanh nghiệp" do Admin chọn. || OK |
| 27 | Các khối "nổi bật" ở trang chủ Atlas tính tự động (nhiều nội dung nhất, mới nhất). Chưa có màn hình chọn nội dung nổi bật. || OK |
| 28 | Chỉ tiếng Việt. Database đã có cột tiếng Anh. || OK |
| 29 | Danh mục 16 ngành và 34 tỉnh/thành (theo đơn vị hành chính từ 01/07/2025) ở `02-database-ghi-chu.md` §3–4. || OK |
| 30 | Bản demo hiện dải "Dữ liệu minh họa" và chặn Google lập chỉ mục. || OK |

## 4. Demo và vận hành

| # | Mặc định | PO |
|---|---|---|
| 31 | 3 doanh nghiệp demo hư cấu: Mây Ngàn Coffee, Gốm Lam Giang, Bách Tâm Software. Cần tra cứu để chắc không trùng tên doanh nghiệp thật trước khi đưa cho khách. Kết quả tra cứu: _(điền)_ || OK |
| 32 | Hosting gói miễn phí (Vercel Hobby…) cho giai đoạn demo; chuyển gói trả phí khi có khách hàng thật. || OK |
| 33 | Dữ liệu doanh nghiệp lưu tại Neon region Singapore và Cloudflare R2. Cần xác nhận không có yêu cầu lưu trữ dữ liệu trong nước với khách Pilot. || OK |

## 5. Mâu thuẫn phát hiện khi code

Dev ghi vào đây khi thấy hai file đặc tả nói khác nhau hoặc có chỗ chưa đủ để code. Không tự đoán.

| Ngày | Người ghi | File / mục | Mô tả | Quyết định |
|---|---|---|---|---|
| | | | | |
