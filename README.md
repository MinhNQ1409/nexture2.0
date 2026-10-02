# NexTure 2.0

Hai ứng dụng trên cùng một cơ sở dữ liệu:

- **Culture Hub** (`apps/hub`): không gian riêng của doanh nghiệp để lưu câu chuyện, cột mốc, con người, sản phẩm, tư liệu.
- **Culture Atlas** (`apps/atlas`): website công khai, chỉ đọc những gì doanh nghiệp tự bật công khai.

Đặc tả đầy đủ ở [`docs/spec/`](docs/spec/00-README.md). Khi code và đặc tả khác nhau, đặc tả thắng; nếu cần đổi, sửa đặc tả trước.

## Cấu trúc

```
apps/hub        Next.js 16: Hub + REST API /api/v1 + đăng nhập (Better Auth)
apps/atlas      Next.js 16: trang công khai, đọc schema atlas bằng role chỉ-đọc
packages/db     Schema Drizzle, migration SQL (sql/*.sql), migrate.ts
packages/core   Nghiệp vụ: phân quyền, tổ chức, thành viên, lời mời (có test với Postgres thật)
packages/contracts  Zod schema + danh mục (ngành, tỉnh/thành, vai trò)
packages/config tokens.css: màu, font, bo góc theo docs/design/DESIGN.md
```

## Chạy ở máy

Cần Node 22, pnpm 10, Docker.

```bash
pnpm install
docker compose up -d                       # Postgres 16 + MinIO
cp .env.example apps/hub/.env.local        # và apps/atlas/.env.local
DATABASE_URL_UNPOOLED=postgres://postgres:postgres@localhost:5432/nexture \
APP_DB_PASSWORD=nexture_app ATLAS_DB_PASSWORD=atlas_reader \
pnpm db:migrate                            # tạo role nexture_app, atlas_reader và bảng
pnpm dev                                   # Hub :3000, Atlas :3001
```

Email có trong `NEXTURE_ADMIN_EMAILS` sẽ thành NexTure Admin khi đăng ký. Không có `RESEND_API_KEY` thì email đặt lại mật khẩu được in ra log của Hub.

## Kiểm tra

```bash
pnpm typecheck
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres pnpm test   # tạo DB nexture_test mới mỗi lần chạy
pnpm build
```

## Tiến độ

- [x] Bước 1–2: monorepo, database (core + atlas, role chỉ-đọc), phân quyền, đăng nhập, tạo doanh nghiệp, thành viên, lời mời, khung Atlas (410, revalidate)
- [x] Bước 3: lát cắt Event đầu-cuối (tạo → xác minh → công khai → Atlas → gỡ → 410), tải logo, hồ sơ doanh nghiệp, bật/tắt Atlas. Không có S3_ENDPOINT thì file lưu trên đĩa
- [x] Bộ nhận diện (DESIGN.md) áp vào Hub và Atlas
- [ ] Bước 4: đủ Story, Person, Product/Project, tư liệu, Timeline, tìm kiếm
- [ ] Bước 5: seed demo và deploy (Neon, R2, Vercel, Resend)
