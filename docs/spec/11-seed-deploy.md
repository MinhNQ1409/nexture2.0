# 11. Dữ liệu seed, môi trường và deploy

## 1. Môi trường

| Môi trường | Mục đích | Database | Storage | Seed | URL |
|---|---|---|---|---|---|
| local | Dev | Postgres 16 trong `docker-compose.yml` | MinIO (S3-compatible) trong compose | `test` | `localhost:3000` (hub), `localhost:3001` (atlas) |
| CI | Test tự động | Postgres service container | MinIO service container | `test` | |
| staging | Kiểm thử trước demo | Neon branch `staging` | R2 bucket `nexture-staging-*` | `test` | `hub-staging.<domain>`, `atlas-staging.<domain>` |
| demo | Cho khách test | Neon branch `main` | R2 bucket `nexture-private`, `nexture-public` | `demo` | `hub.<domain>`, `atlas.<domain>`, `media.<domain>` |

Code dùng `@aws-sdk/client-s3` với `endpoint` cấu hình được (`S3_ENDPOINT`, mặc định R2 endpoint từ `R2_ACCOUNT_ID`; local trỏ MinIO, `forcePathStyle: true`).

## 2. Seed

Lệnh: `pnpm seed --set=test|demo [--reset]`. `--reset` xóa toàn bộ dữ liệu (TRUNCATE mọi bảng `core` và `atlas`, xóa mọi object trong 2 bucket) — script PHẢI từ chối chạy `--reset` khi `DEMO_MODE` không phải `true` và `NODE_ENV=production` mà không có thêm cờ `--i-know`.

Seed PHẢI đi qua các hàm `packages/core` (không INSERT trực tiếp), để activity log và projection Atlas được tạo đúng như người dùng thật.

### 2.1 Bộ `test`
Tối thiểu cho `10-use-case-nghiem-thu.md`:
- User: `admin@a.test`, `editor@a.test`, `viewer@a.test`, `admin@b.test`, `nexture@nexture.test` (NEXTURE_ADMIN). Mật khẩu `Test@12345`.
- Tổ chức A "Công ty Alpha" (slug `cong-ty-alpha`, đủ hồ sơ trừ logo, Atlas tắt) với 2 giá trị, 1 founder, 3 Event VERIFIED (2023, 2024, 2025), 1 Event DRAFT (2022), 1 Story VERIFIED INTERNAL, 1 Person DRAFT, 1 ảnh VERIFIED PUBLIC.
- Tổ chức B "Công ty Beta" với 1 Story.
- Ảnh test: 3 file JPG nhỏ trong `scripts/seed-assets/test/`.

### 2.2 Bộ `demo`
3 doanh nghiệp **hư cấu**. Trước khi deploy, người phụ trách PHẢI tra cứu để chắc tên không trùng doanh nghiệp có thật (ghi kết quả vào `12-cau-hoi-cho-po.md`); nếu trùng thì đổi tên.

| | Mây Ngàn Coffee | Gốm Lam Giang | Bách Tâm Software |
|---|---|---|---|
| slug | `may-ngan-coffee` | `gom-lam-giang` | `bach-tam-software` |
| Ngành | FNB | CRAFT | TECH |
| Tỉnh/Thành | lam-dong | ha-noi | da-nang |
| Năm thành lập | 2016 | 1998 | 2019 |
| Quy mô | S11_50 | S51_200 | S51_200 |
| Giá trị | Tôn trọng người trồng cà phê; Chất lượng từ gốc; Chậm mà chắc | Giữ nghề; Dám đổi mới men; Tử tế với khách | Minh bạch; Học mỗi ngày; Khách hàng là đồng đội |
| Người sáng lập | 2 | 1 | 3 |
| Person khác | 3 | 3 | 4 |
| Event | 8 (2016–2025) | 10 (1998–2025) | 7 (2019–2025) |
| Story | 4 (COMPANY, FOUNDER, CULTURE, PEOPLE) | 4 (COMPANY, FOUNDER, CULTURE, PRODUCT) | 4 (COMPANY, FOUNDER, CULTURE, PEOPLE) |
| Product/Project | 3 sản phẩm | 2 sản phẩm + 1 dự án | 2 sản phẩm + 2 dự án |
| Ảnh | ≥ 15 | ≥ 15 | ≥ 12 |

Yêu cầu về nội dung demo:
- Tiếng Việt tự nhiên, Story 400–900 từ, Event có tóm tắt 1–2 câu và nội dung 80–200 từ, Person có tiểu sử 80–150 từ. Không chứa thông tin cá nhân thật.
- Mọi nội dung có quan hệ hợp lý (mỗi Event liên quan ≥ 1 Person; mỗi Story liên quan ≥ 1 Event và ≥ 1 Person; mỗi Product liên quan ≥ 1 Event).
- Mỗi tổ chức: ~80% nội dung VERIFIED; trong đó ~70% PUBLIC; còn lại để thể hiện các trạng thái Nháp, Chờ duyệt, Nội bộ, Riêng tư khi khách test đăng nhập Hub.
- Cả 3 tổ chức bật Atlas; `featured_story_id` = Story COMPANY.
- Nguồn: mỗi Story có 1–2 nguồn (link tới trang web hư cấu dạng `https://example.com/...` hoặc tư liệu PDF mẫu).
- Nội dung lưu dạng JSON trong `scripts/seed-data/demo/<slug>.json` theo đúng schema input của API (`StoryInput`, `EventInput`…) + khối `relations` theo key nội bộ. Script đọc JSON và gọi `core`.
- Ảnh: dùng ảnh có giấy phép cho phép dùng tự do (VD Unsplash License), lưu trong `scripts/seed-assets/demo/<slug>/`, ghi nguồn từng ảnh vào `scripts/seed-assets/CREDITS.md`. Ảnh tối ưu trước khi commit: JPG/WebP, cạnh dài ≤ 2000 px, ≤ 500 KB.

Tài khoản demo cho khách (mật khẩu đặt qua biến `DEMO_PASSWORD` khi seed, không commit):

| Email | Vai trò | Dùng để |
|---|---|---|
| `admin@mayngan.demo` | ADMIN Mây Ngàn | Khách thử quyền quản trị: xác minh, công khai |
| `editor@mayngan.demo` | EDITOR Mây Ngàn | Khách thử nhập liệu, gửi duyệt |
| `viewer@mayngan.demo` | VIEWER Mây Ngàn | Khách thử góc nhìn nhân viên |
| `admin@lamgiang.demo`, `admin@bachtam.demo` | ADMIN | |
| `nexture@<domain>` | NEXTURE_ADMIN | Đội NexTure |

Khách tự đăng ký tài khoản mới vẫn được (tạo doanh nghiệp riêng).

## 3. Chuẩn bị hạ tầng (một lần, làm theo thứ tự)

1. **Domain:** chọn `<domain>`; tạo bản ghi DNS khi các bước sau yêu cầu.
2. **Neon:** tạo project (region Singapore), database `nexture`. Tạo branch `staging`. Với mỗi branch: chạy phần tạo role ở cuối `02-database.sql` (đặt mật khẩu mạnh), lưu connection string cho `nexture_app` (pooled + unpooled) và `atlas_reader` (pooled).
3. **Cloudflare R2:** tạo 4 bucket (`nexture-private`, `nexture-public`, `nexture-staging-private`, `nexture-staging-public`).
   - Bucket public: gắn custom domain `media.<domain>` (staging: `media-staging.<domain>`). Bucket private: không public.
   - CORS bucket private: AllowedOrigins = Hub URL của môi trường, AllowedMethods = `GET, PUT, HEAD`, AllowedHeaders = `Content-Type`, MaxAge = 3600.
   - Tạo API token quyền Object Read & Write giới hạn đúng 2 bucket của môi trường.
4. **Resend:** xác minh domain gửi mail (SPF, DKIM), tạo API key.
5. **Sentry:** 2 project (`nexture-hub`, `nexture-atlas`).
6. **Vercel:** 2 project từ cùng repo:
   - `nexture-hub`: Root Directory `apps/hub`, build `cd ../.. && pnpm turbo build --filter=hub`.
   - `nexture-atlas`: Root Directory `apps/atlas`, tương tự `--filter=atlas`.
   - Bật "Ignored Build Step" theo `turbo-ignore` để app không đổi thì không build lại.
   - Region function: `sin1` (gần Neon Singapore).
   - Production branch `main` → môi trường demo; branch `staging` → staging (gán domain staging cho branch này).
   - Nhập biến môi trường theo `01-kien-truc.md` §5 cho từng môi trường.
7. **GitHub Actions** (`.github/workflows/ci.yml`), chạy trên mọi PR:
   - `pnpm install --frozen-lockfile`
   - `pnpm lint && pnpm typecheck`
   - `redocly lint docs/spec/05-api.yaml`
   - Test đơn vị với Postgres + MinIO service container
   - `pnpm build`
   - Playwright E2E: khởi động 2 app ở chế độ production trên CI, seed `test`
8. **Migration:** job riêng `migrate.yml` chạy `pnpm db:migrate` với `DATABASE_URL_UNPOOLED` khi merge vào `staging`/`main`, **trước** khi Vercel build (dùng Vercel Deploy Hook gọi sau khi migrate xong, tắt auto-deploy từ Git).

## 4. Quy trình phát hành bản demo

1. Merge vào `staging` → CI xanh → migrate staging → deploy staging.
2. Chạy seed `test` trên staging, chạy Playwright E2E trỏ tới staging (`E2E_BASE_URL`).
3. Kiểm tra tay luồng "Định nghĩa MVP hoàn thành" (`10` cuối file).
4. Merge `staging` → `main` → migrate demo → deploy demo.
5. Lần đầu: `pnpm seed --set=demo` trên demo. Những lần sau: không seed lại trừ khi có yêu cầu (dữ liệu khách tạo sẽ bị mất khi `--reset`).
6. Smoke test sau deploy (script `pnpm smoke --env=demo`): Hub `/login` 200; Atlas `/` 200; `/companies/may-ngan-coffee` 200; `/sitemap.xml` 200; `/api/revalidate` với secret sai trả 401.

## 5. Sao lưu và khôi phục

- Neon: bật point-in-time restore (mặc định của gói đang dùng; ghi rõ số ngày giữ trong README repo).
- R2: không có sao lưu tự động trong MVP. File gốc nằm ở bucket private; bucket public có thể dựng lại bằng lệnh `pnpm atlas:resync --org=all` (chạy `syncOrg` cho mọi tổ chức, copy lại file public).
- Lệnh `pnpm atlas:resync` cũng dùng khi nghi ngờ projection sai lệch.

## 6. Chi phí ước tính cho giai đoạn demo

Ở quy mô demo (vài chục người dùng, < 5 GB file), các dịch vụ trên đều nằm trong gói miễn phí hoặc gói rẻ nhất: Neon Free/Launch, R2 (miễn phí 10 GB và không tính phí băng thông ra), Resend Free, Sentry Developer, Vercel Hobby. Lưu ý Vercel Hobby chỉ cho mục đích phi thương mại; khi dùng chính thức cho khách hàng trả phí phải lên Pro. Giá cụ thể cần kiểm tra lại trên trang của từng nhà cung cấp tại thời điểm đăng ký.
