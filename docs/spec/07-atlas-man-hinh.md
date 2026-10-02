# 07. Trang Atlas

Atlas chỉ đọc schema `atlas` qua `DATABASE_URL_ATLAS`. Mọi trang là Server Component, render tĩnh/ISR, không có JavaScript phía client trừ: ô tìm kiếm, bộ lọc Explore, lightbox gallery, menu mobile.

Tên hiển thị: "Vietnam Enterprise Culture Atlas" (rút gọn "Culture Atlas"). Ngôn ngữ: tiếng Việt, `<html lang="vi">`.

## 0. Khung chung

- **Header:** logo NexTure + "Culture Atlas", menu: "Khám phá doanh nghiệp" (`/companies`), "Tìm kiếm" (`/search`); ô tìm kiếm thu gọn (icon) trên mobile.
- **Footer:** "Một sản phẩm của NexTure", link "Dành cho doanh nghiệp" → `HUB_BASE_URL/signup`, năm bản quyền.
- **Dải demo:** khi `DEMO_MODE=true`, dải mỏng trên cùng mọi trang: "Dữ liệu trên trang là dữ liệu minh họa."
- **Ảnh:** `next/image` với `remotePatterns` cho `R2_PUBLIC_BASE_URL`. Không có ảnh thì dùng placeholder theo loại (SVG trong `packages/ui`, màu từ token).
- **Ngày mờ:** hiển thị như Hub (`06` §0).
- **Thẻ nội dung** (`EntityCard`, dùng ở nhiều trang): ảnh 16:9 (Person: ảnh tròn), nhãn loại, tiêu đề (2 dòng), tên doanh nghiệp (trừ khi đang ở trang doanh nghiệp đó), ngày.

## 1. Trang chủ `/`

Thứ tự khối (khối không có dữ liệu thì ẩn cả khối):
1. **Hero:** tiêu đề "Vietnam Enterprise Culture Atlas", câu "Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.", ô tìm kiếm lớn (submit → `/search?q=`), số liệu nhỏ "{n} doanh nghiệp · {m} câu chuyện".
2. **Doanh nghiệp nổi bật:** 6 công ty có `public_entity_count` lớn nhất (bằng nhau thì `updated_at` mới nhất) → `CompanyCard`.
3. **Câu chuyện nổi bật:** 6 STORY mới nhất theo `published_at`.
4. **Người sáng lập & nhân vật:** 6 PERSON, ưu tiên `extra.isFounder = true`, sau đó theo `published_at` mới nhất.
5. **Sản phẩm & dự án:** 6 PRODUCT/PROJECT mới nhất.
6. **Mới tham gia Atlas:** 6 công ty theo `first_published_at` mới nhất.

Mỗi khối có link "Xem tất cả" (khối 2, 6 → `/companies`; khối 3–5 → `/search?type=...`).

Cache tag: `home`. `revalidate = 300`.

## 2. Khám phá doanh nghiệp `/companies`

- Bộ lọc (query string): Ngành (`industry`, nhiều lựa chọn), Tỉnh/Thành (`province`, nhiều lựa chọn), Năm thành lập (`from`, `to`), ô tìm theo tên (`q`).
- Sắp xếp (`sort`): "Mới tham gia" (mặc định, `first_published_at DESC`), "Tên A–Z", "Năm thành lập".
- Lưới `CompanyCard`: logo, tên, ngành, năm thành lập, tỉnh/thành, mô tả ngắn (3 dòng). 24/trang, phân trang bằng `?page=`.
- Trống: "Chưa có doanh nghiệp phù hợp." + "Xóa bộ lọc".
- Trang không có query: cache tag `companies`; có query: render động (`dynamic = 'force-dynamic'` cho nhánh có query, hoặc tách component) — không cache.

## 3. Hồ sơ doanh nghiệp `/companies/[slug]`

Không có dòng `atlas.companies` với slug:
- Có tombstone `/companies/{slug}` → **410** trang "Hồ sơ này không còn hiển thị trên Atlas."
- Không → 404.

Bố cục:
1. **Hero:** logo (lớn), tên, ngành · năm thành lập · tỉnh/thành · quy mô; nút "Website ↗" (nếu có, `rel="noopener nofollow"`); mô tả ngắn.
2. **Điều hướng nhanh** (dính khi cuộn): Câu chuyện · Dòng thời gian · Con người · Sản phẩm & Dự án · Giá trị · Thư viện ảnh (chỉ hiện mục có dữ liệu).
3. **Câu chuyện doanh nghiệp:** nếu `featured_story_slug` → tiêu đề, tóm tắt, ảnh bìa, nút "Đọc câu chuyện".
4. **Giá trị văn hóa:** lưới thẻ (tên + mô tả) từ `culture_values`.
5. **Dòng thời gian văn hóa:** EVENT của công ty theo `sort_date` tăng dần, dạng trục dọc nhóm theo năm (giống Hub nhưng chỉ đọc), mỗi mục: ngày, tiêu đề, tóm tắt, ảnh nhỏ, link tới `/events/[slug]`. Hơn 12 mục: hiện 12 + "Xem toàn bộ dòng thời gian" mở rộng tại chỗ (client).
6. **Người sáng lập & con người:** PERSON, founder trước, sau đó theo tên.
7. **Sản phẩm & dự án:** PRODUCT/PROJECT theo `sort_date` giảm dần.
8. **Câu chuyện văn hóa:** STORY trừ story nổi bật, theo `sort_date` giảm dần (NULL cuối), tối đa 9 + "Xem thêm" mở rộng.
9. **Thư viện ảnh:** mọi `atlas.media` IMAGE/VIDEO của công ty (tối đa 24), lưới, bấm mở lightbox (video phát trong lightbox). Mỗi ảnh có link về nội dung chứa nó (qua `atlas.entity_media`).

Cache tag: `company:{slug}`.

## 4. Trang Câu chuyện `/stories/[slug]`

1. Breadcrumb: Trang chủ › {Công ty} › Câu chuyện.
2. Nhãn loại câu chuyện, tiêu đề (H1), dòng meta: tên công ty (link), ngày câu chuyện (nếu có), "Đăng trên Atlas {published_at dd/MM/yyyy}".
3. Ảnh bìa (nếu có), tóm tắt (chữ lớn hơn), nội dung HTML (đã sanitize khi lưu; render bằng `dangerouslySetInnerHTML` trong khối `.prose`).
4. Giá trị thể hiện (`extra.values`) dạng chip.
5. Ảnh & video kèm: lưới + lightbox, có chú thích.
6. **Liên quan** (từ `atlas.relations`): Con người, Sự kiện, Sản phẩm & Dự án — mỗi nhóm là hàng `EntityCard`.
7. **Nguồn:** danh sách `sources` (tiêu đề; nếu có `url` thì là link ngoài `rel="noopener nofollow"`; ghi chú).
8. Khối "Về {công ty}": logo, tên, mô tả ngắn, link hồ sơ.

## 5. Trang Sự kiện `/events/[slug]`

Như §4 với: nhãn loại sự kiện; ngày bắt đầu (– ngày kết thúc); liên quan: Con người, Câu chuyện, Sản phẩm & Dự án; thêm khối "Trên dòng thời gian của {công ty}": sự kiện trước và sau (theo `sort_date`) của cùng công ty với link.

## 6. Trang Con người `/people/[slug]`

1. Ảnh đại diện tròn, tên (H1), vai trò, nhãn "Người sáng lập" nếu `isFounder`, công ty (link), thời gian gắn bó ("Từ {joined}" / "{joined} – {left}").
2. Tiểu sử (`body_html`), "Đóng góp nổi bật" (`extra.contributionsHtml`).
3. Ảnh kèm.
4. Liên quan: Sự kiện (dạng mini timeline), Câu chuyện, Sản phẩm & Dự án.
5. Nguồn.

## 7. Trang Sản phẩm `/products/[slug]` và Dự án `/projects/[slug]`

Ảnh bìa, nhãn Sản phẩm/Dự án + tình trạng, tên, công ty, ngày ra mắt/khởi động, tóm tắt, mô tả, ảnh kèm; liên quan: Con người, Sự kiện (mini timeline), Câu chuyện; nguồn.

## 8. Tìm kiếm `/search`

- Tham số: `q`, `type` (`company|story|event|person|product|project`, mặc định tất cả), `page`.
- Truy vấn: `atlas.companies` và `atlas.entities` với `search_text LIKE '%' || atlas.f_search_norm(q) || '%'`; sắp xếp: khớp ở đầu `title`/`name` trước, sau đó `updated_at DESC`.
- Không có `type`: hiển thị theo nhóm (Doanh nghiệp, Câu chuyện, Sự kiện, Con người, Sản phẩm & Dự án), mỗi nhóm tối đa 6 + "Xem tất cả" (đặt `type`). Có `type`: danh sách 24/trang.
- `q` rỗng: hiện ô tìm + gợi ý "Thử tìm theo tên doanh nghiệp, người sáng lập, sản phẩm…". `q` < 2 ký tự: "Nhập ít nhất 2 ký tự." Không có kết quả: "Không tìm thấy kết quả cho “{q}”."
- Render động, không cache. `<meta name="robots" content="noindex">`.

## 9. 404, 410, redirect

Thứ tự xử lý cho route chi tiết `/{prefix}/[slug]`:
1. Có dòng `atlas.entities` khớp (`entity_type`, `slug`) → render.
2. Prefix là `products` hoặc `projects` và có dòng với type còn lại cùng slug → **308** sang đường dẫn đúng.
3. Có tombstone đúng path → **410**, trang: "Nội dung này không còn hiển thị trên Atlas." + link "Về trang chủ".
4. Còn lại → 404 "Không tìm thấy trang." + ô tìm kiếm.

Cách trả 410 (App Router không có API trả 410 từ page): `apps/atlas/src/proxy.ts` (Next 16 đổi tên middleware thành proxy) chạy runtime Node, matcher chỉ gồm `/companies/:slug`, `/stories/:slug`, `/events/:slug`, `/people/:slug`, `/products/:slug`, `/projects/:slug`. Middleware chạy `SELECT 1 FROM atlas.tombstones WHERE path = $1`, kết quả cache trong bộ nhớ (LRU 5.000 key, TTL 60 giây). Có tombstone → trả `new NextResponse(<HTML tĩnh của trang 410>, { status: 410 })`; không có → `NextResponse.next()`. Vì `syncEntity` xóa tombstone khi công khai lại, độ trễ tối đa là 60 giây. Nghiệm thu: `curl -I` trả **410**.

## 10. SEO

Mọi trang chi tiết dùng `generateMetadata`:

| Trang | `<title>` | description | OG image |
|---|---|---|---|
| Trang chủ | "Vietnam Enterprise Culture Atlas" | câu hero | ảnh OG mặc định (`/og-default.png`) |
| `/companies` | "Khám phá doanh nghiệp · Culture Atlas" | "Danh sách doanh nghiệp Việt Nam và văn hóa của họ." | mặc định |
| Company | "{name} · Văn hóa doanh nghiệp · Culture Atlas" | `short_desc` (cắt 160) | logo trên nền thương hiệu, sinh bằng `opengraph-image.tsx` |
| Story/Event/Product/Project | "{title} · {company_name}" | `summary` hoặc 160 ký tự đầu của body (bỏ tag) | `cover_url` nếu có, ngược lại OG của company |
| Person | "{title} · {subtitle} tại {company_name}" | 160 ký tự đầu tiểu sử | ảnh đại diện hoặc OG company |

- `alternates.canonical` = URL tuyệt đối theo `ATLAS_BASE_URL`.
- `sitemap.ts`: trang chủ, `/companies`, mọi company và entity, `lastModified = updated_at`. Không đưa `/search`.
- `robots.ts`: cho phép tất cả, trỏ sitemap. Khi `DEMO_MODE=true`: `Disallow: /` và thêm `noindex` toàn site (để dữ liệu minh họa không bị lập chỉ mục).
- Structured data JSON-LD:
  - Company: `Organization` (`name`, `url`, `logo`, `foundingDate` = năm, `address.addressRegion` = tỉnh).
  - Story: `Article` (`headline`, `datePublished` = published_at, `dateModified` = updated_at, `publisher` = Organization của công ty, `image`).
  - Person: `Person` (`name`, `jobTitle`, `worksFor`).
  - Event: `Event` không phù hợp (sự kiện lịch sử, không có địa điểm) → dùng `Article`.
- Trang dùng thẻ heading đúng cấp: một H1 mỗi trang.

## 11. Cache và revalidate

- Trang Atlas render theo request (`dynamic = 'force-dynamic'`) để build không cần database; dữ liệu được cache, không phải HTML.
- Mọi truy vấn trong `apps/atlas/src/lib/queries.ts` bọc `unstable_cache` (hoặc API cache tương đương của phiên bản Next.js đang dùng) với tag tương ứng (`08-cong-khai.md` §8) và `revalidate: 300`.
- `POST /api/revalidate`: kiểm tra header `x-revalidate-secret` (so sánh constant-time), body `{ tags: string[] }` (tối đa 200), gọi `revalidateTag` cho từng tag, trả `{ revalidated: n }`. Sai secret → 401.

## 12. Hiệu năng và truy cập

- Lighthouse (mobile) trên trang company và story của dữ liệu demo: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95.
- Mọi ảnh có `alt` (`cover_alt`/`alt` hoặc tiêu đề nội dung).
- Tương phản màu đạt WCAG AA (kiểm tra khi thay token, xem `09-giao-dien.md`).
