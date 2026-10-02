# 02. Ghi chú database

DDL chuẩn ở `02-database.sql`. File này giải thích quy tắc mà DDL không tự diễn đạt được. Mọi danh mục (enum, danh sách) PHẢI được khai báo một lần trong `packages/contracts/src/catalog.ts` và dùng chung cho Hub, Atlas, seed.

## 1. Tổng quan bảng

| Bảng | Vai trò |
|---|---|
| `core.user`, `session`, `account`, `verification` | Better Auth quản lý. Thêm cột `platform_role`. |
| `core.organizations` | Hồ sơ doanh nghiệp + cờ Atlas. |
| `core.organization_members` | Thành viên và vai trò trong tổ chức. Một user có thể thuộc nhiều tổ chức. |
| `core.invites` | Lời mời bằng link. |
| `core.media_assets` | Culture Library. |
| `core.stories`, `events`, `people`, `products_projects` | 4 loại nội dung có luồng xác minh. |
| `core.culture_values` | Giá trị văn hóa, không có luồng xác minh. |
| `core.relationships` | Quan hệ giữa nội dung. |
| `core.entity_media` | Ảnh/video gắn vào nội dung. |
| `core.entity_sources` | Nguồn/bằng chứng của nội dung. |
| `core.activity_logs` | Nhật ký. |
| `atlas.*` | Projection công khai, xem `08-cong-khai.md`. |

## 2. Organizations

- `slug`: sinh từ `name` khi tạo (quy tắc §9), người dùng sửa được ở form tạo và ở Cài đặt cho tới khi `slug_locked = true`. `slug_locked` chuyển `true` lần đầu `atlas_enabled` được bật và không bao giờ về `false`.
- `featured_story_id`: Story hiển thị ở mục "Câu chuyện doanh nghiệp" trên Atlas. Chỉ chọn được Story có `story_type = 'COMPANY'`. Nếu Story đó không công khai thì mục này ẩn trên Atlas.
- "Người sáng lập" (docx Phần 1 §5) **không** là cột của organizations. Người sáng lập là `people.is_founder = true`. Form khởi tạo cho phép nhập nhanh tên người sáng lập, hệ thống tạo bản ghi `people` tương ứng (status `DRAFT` nếu người tạo là Editor, `VERIFIED` nếu là Admin; người tạo tổ chức luôn là Admin).
- "Giá trị cốt lõi" là các bản ghi `culture_values`.
- Trường bắt buộc để bật Atlas: `name`, `logo_media_id` (ảnh đã `READY`), `founded_year`, `industry_code`, `province_code`, `short_desc_vi`. Thiếu trường nào thì API bật Atlas trả `422 ATLAS_PROFILE_INCOMPLETE` với danh sách trường thiếu.

## 3. Danh mục ngành (`INDUSTRIES`)

| code | Tên hiển thị |
|---|---|
| `TECH` | Công nghệ thông tin & Phần mềm |
| `MANUFACTURING` | Sản xuất & Công nghiệp |
| `RETAIL` | Bán lẻ & Thương mại |
| `FNB` | Thực phẩm & Đồ uống |
| `HOSPITALITY` | Du lịch & Khách sạn |
| `FINANCE` | Tài chính, Ngân hàng & Bảo hiểm |
| `REAL_ESTATE` | Bất động sản & Xây dựng |
| `EDUCATION` | Giáo dục & Đào tạo |
| `HEALTHCARE` | Y tế & Chăm sóc sức khỏe |
| `LOGISTICS` | Vận tải & Logistics |
| `AGRICULTURE` | Nông nghiệp & Thủy sản |
| `MEDIA` | Truyền thông, Quảng cáo & Sáng tạo |
| `CRAFT` | Thủ công mỹ nghệ & Làng nghề |
| `ENERGY` | Năng lượng & Môi trường |
| `PROFESSIONAL` | Dịch vụ chuyên nghiệp (tư vấn, luật, kế toán) |
| `OTHER` | Khác |

## 4. Danh mục tỉnh/thành (`PROVINCES`)

34 đơn vị hành chính cấp tỉnh hiệu lực từ 01/07/2025. Đội dev PHẢI đối chiếu lại tên với danh mục chính thức trước khi seed. `code` là slug không dấu.

Thành phố trực thuộc trung ương: `ha-noi` Hà Nội, `hue` Huế, `hai-phong` Hải Phòng, `da-nang` Đà Nẵng, `ho-chi-minh` TP. Hồ Chí Minh, `can-tho` Cần Thơ.

Tỉnh: `lai-chau` Lai Châu, `dien-bien` Điện Biên, `son-la` Sơn La, `lang-son` Lạng Sơn, `quang-ninh` Quảng Ninh, `thanh-hoa` Thanh Hóa, `nghe-an` Nghệ An, `ha-tinh` Hà Tĩnh, `cao-bang` Cao Bằng, `tuyen-quang` Tuyên Quang, `lao-cai` Lào Cai, `thai-nguyen` Thái Nguyên, `phu-tho` Phú Thọ, `bac-ninh` Bắc Ninh, `hung-yen` Hưng Yên, `ninh-binh` Ninh Bình, `quang-tri` Quảng Trị, `quang-ngai` Quảng Ngãi, `gia-lai` Gia Lai, `khanh-hoa` Khánh Hòa, `lam-dong` Lâm Đồng, `dak-lak` Đắk Lắk, `dong-nai` Đồng Nai, `tay-ninh` Tây Ninh, `vinh-long` Vĩnh Long, `dong-thap` Đồng Tháp, `ca-mau` Cà Mau, `an-giang` An Giang.

Thứ tự hiển thị trong dropdown: 6 thành phố trước theo thứ tự trên, sau đó các tỉnh theo bảng chữ cái tiếng Việt.

## 5. Nội dung HTML

Các cột HTML: `stories.content_*`, `events.content_*`, `people.bio_*`, `people.contributions_*`, `products_projects.description_*`.

- Editor dùng TipTap với: Paragraph, Heading (chỉ cấp 2 và 3), Bold, Italic, Underline, Link, BulletList, OrderedList, Blockquote, HardBreak. Không có ảnh chèn trong thân bài (ảnh dùng `entity_media`).
- Server PHẢI sanitize bằng `sanitize-html` trước khi lưu, với cấu hình:
  - `allowedTags`: `p, h2, h3, strong, em, u, a, ul, ol, li, blockquote, br`
  - `allowedAttributes`: `{ a: ['href', 'target', 'rel'] }`
  - `allowedSchemes`: `['http', 'https', 'mailto']`
  - `transformTags`: `a` luôn có `rel="noopener noreferrer nofollow"` và `target="_blank"`.
- HTML rỗng (chỉ `<p></p>`) lưu thành `NULL`.
- Giới hạn độ dài kiểm tra **sau** khi sanitize.

## 6. Quan hệ (`relationships`)

`relationship_type` quyết định cố định chiều `source_type → target_type`:

| relationship_type | source_type | target_type | Hiển thị ở source | Hiển thị ở target |
|---|---|---|---|---|
| `PERSON_EVENT` | PERSON | EVENT | Sự kiện liên quan | Người liên quan |
| `PERSON_PRODUCT_PROJECT` | PERSON | PRODUCT_PROJECT | Sản phẩm/Dự án liên quan | Người liên quan |
| `PERSON_STORY` | PERSON | STORY | Câu chuyện liên quan | Người liên quan |
| `EVENT_PRODUCT_PROJECT` | EVENT | PRODUCT_PROJECT | Sản phẩm/Dự án liên quan | Sự kiện liên quan |
| `STORY_EVENT` | STORY | EVENT | Sự kiện liên quan | Câu chuyện liên quan |
| `STORY_PRODUCT_PROJECT` | STORY | PRODUCT_PROJECT | Sản phẩm/Dự án liên quan | Câu chuyện liên quan |
| `STORY_CULTURE_VALUE` | STORY | CULTURE_VALUE | Giá trị thể hiện | Câu chuyện thể hiện giá trị |
| `EVENT_CULTURE_VALUE` | EVENT | CULTURE_VALUE | Giá trị thể hiện | Sự kiện thể hiện giá trị |

Quy tắc:
- Hai đầu PHẢI cùng `organization_id`, chưa xóa mềm. Vi phạm trả `422 INVALID_RELATION`.
- Cặp loại không có trong bảng (VD EVENT–EVENT, PERSON–PERSON) bị từ chối.
- API nhận quan hệ dưới dạng "danh sách id liên quan theo loại đích" từ góc nhìn của nội dung đang sửa (xem `05-api.yaml` `PUT .../relations`). Server tự tra bảng trên để xác định `relationship_type` và chiều, bất kể nội dung đang sửa là source hay target.
- Quan hệ không có trạng thái riêng. Ai có quyền sửa **một trong hai đầu** thì được tạo/xóa quan hệ (xem `03-phan-quyen.md` §4).
- Xóa quan hệ là xóa cứng (bảng không có `deleted_at`); activity log giữ dấu vết.
- Khi một nội dung bị xóa mềm, các quan hệ của nó bị xóa cứng trong cùng transaction.

## 7. Tư liệu (`media_assets`)

Định dạng chấp nhận (kiểm tra cả `mime_type` khai báo và phần mở rộng tên file):

| kind | MIME | Phần mở rộng | Dung lượng tối đa |
|---|---|---|---|
| IMAGE | `image/jpeg`, `image/png`, `image/webp` | jpg, jpeg, png, webp | 20 MB |
| DOCUMENT | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | pdf, doc, docx | 50 MB |
| VIDEO | `video/mp4` | mp4 | 500 MB |
| AUDIO | `audio/mpeg`, `audio/wav`, `audio/x-wav` | mp3, wav | 100 MB |

- `storage_key` = `orgs/{organization_id}/media/{media_id}/{slug(tên file không đuôi)}.{đuôi}`.
- `kind` do server suy ra từ MIME, client không gửi.
- `upload_status = PENDING` khi mới xin URL; chuyển `READY` khi client gọi `complete` và server `HeadObject` thấy file tồn tại với `ContentLength` khớp `size_bytes` (sai lệch thì trả `422 UPLOAD_MISMATCH`, giữ `PENDING`).
- Bản ghi `PENDING` quá 24 giờ: không hiển thị ở danh sách. Không cần job dọn trong MVP.
- Chỉ media `READY` mới gắn được vào nội dung, làm logo, ảnh bìa, avatar.
- Ảnh bìa / avatar / logo / `entity_media` chỉ nhận `kind` IMAGE, riêng `entity_media` nhận thêm VIDEO.
- `status` của media: dùng cùng luồng xác minh với nội dung (`04-trang-thai.md`), nhưng media **không cần** `VERIFIED` để được gắn vào nội dung. Media chỉ lên Atlas khi `visibility = PUBLIC` và `status = VERIFIED` (xem `08-cong-khai.md` §4).
- Xóa mềm media đang được tham chiếu (logo, cover, avatar, entity_media, entity_sources) trả `409 MEDIA_IN_USE` kèm danh sách nơi đang dùng.

## 8. Activity log: danh mục `action`

`ORG_CREATED`, `ORG_UPDATED`, `ATLAS_ENABLED`, `ATLAS_DISABLED`,
`MEMBER_ROLE_CHANGED`, `MEMBER_REMOVED`, `MEMBER_JOINED`,
`INVITE_CREATED`, `INVITE_REVOKED`,
`MEDIA_UPLOADED`, `MEDIA_UPDATED`, `MEDIA_DELETED`,
`ENTITY_CREATED`, `ENTITY_UPDATED`, `ENTITY_DELETED`,
`ENTITY_SUBMITTED`, `ENTITY_APPROVED`, `ENTITY_RETURNED`, `ENTITY_UNVERIFIED`,
`VISIBILITY_CHANGED`, `RELATIONS_UPDATED`, `ENTITY_MEDIA_UPDATED`, `SOURCE_ADDED`, `SOURCE_REMOVED`,
`ATLAS_HIDDEN_BY_NEXTURE`, `ATLAS_UNHIDDEN_BY_NEXTURE`.

- `target_type` cho nội dung dùng giá trị `entity_type` (`STORY`…), cho media là `MEDIA`.
- `changes` chỉ chứa trường thay đổi. Với trường HTML, ghi `["<đã sửa>", "<đã sửa>"]` thay vì toàn bộ nội dung.
- Activity log không bao giờ bị sửa hay xóa qua ứng dụng.

## 9. Slug

Hàm duy nhất `core.slug.make(text)`:
1. `slugify(text, { locale: 'vi', lower: true, strict: true, trim: true })` (thay `đ` → `d`).
2. Cắt tối đa 80 ký tự, không cắt giữa từ nếu được (cắt tại dấu `-` cuối cùng trước vị trí 80).
3. Nếu rỗng: dùng `noi-dung`.

Đảm bảo duy nhất:
- `organizations.slug`: duy nhất toàn hệ thống; trùng thì thêm `-2`, `-3`… (khi tự sinh) hoặc trả `409 SLUG_TAKEN` (khi người dùng tự nhập).
- `public_slug` của nội dung: duy nhất theo **đường dẫn Atlas** (`/stories`, `/events`, `/people`, `/products`, `/projects`). Sinh từ `{tiêu đề}-{org slug}` nếu `{tiêu đề}` đã bị dùng ở cùng đường dẫn, sau đó mới thêm `-2`, `-3`. Ràng buộc `UNIQUE` theo bảng trong DDL là đủ vì mỗi đường dẫn tương ứng một bảng, riêng `products_projects` dùng chung bảng cho hai đường dẫn nên vẫn duy nhất.
- `public_slug` gán **lần đầu nội dung trở thành công khai** (`08-cong-khai.md` §5) và không bao giờ đổi, kể cả khi đổi tiêu đề hoặc bị gỡ rồi công khai lại.

## 10. Xóa và ảnh hưởng dây chuyền

| Hành động | Ảnh hưởng |
|---|---|
| Xóa mềm nội dung | Xóa cứng quan hệ của nó; giữ `entity_media`, `entity_sources` (ẩn theo nội dung); nếu là `featured_story_id` thì set NULL; gỡ khỏi Atlas (`08` §5). |
| Xóa mềm media | Chỉ được khi không còn tham chiếu (§7). |
| Xóa culture value | Xóa cứng quan hệ `*_CULTURE_VALUE`; đồng bộ lại `atlas.companies.culture_values`. |
| Xóa tổ chức | Không có trong MVP. |
| Xóa thành viên | Xóa dòng `organization_members`; dữ liệu họ tạo giữ nguyên. Không được xóa Admin cuối cùng (`409 LAST_ADMIN`). |

## 11. Tìm kiếm trong Hub

- Chuẩn hóa cả từ khóa và dữ liệu bằng `core.f_search_norm`.
- Điều kiện khớp: `f_search_norm(<cột>) LIKE '%' || f_search_norm(:q) || '%'` (dùng index trigram). Từ khóa < 2 ký tự sau khi trim: trả danh sách rỗng, không lỗi.
- Cột tìm: Story/Event/Product: `title_vi`, `summary_vi`. Person: `full_name`, `role_title_vi`. Media: `title`, `tags` (khớp chính xác tag đã chuẩn hóa).
- Sắp xếp: khớp ở đầu tiêu đề trước, sau đó `updated_at DESC`.
