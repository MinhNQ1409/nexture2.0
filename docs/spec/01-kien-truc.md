# 01. Kiến trúc và techstack

## 1. Sơ đồ tổng thể

```
                        ┌────────────────────── PostgreSQL (Neon) ──────────────────────┐
                        │ schema core  : user, session, account, verification (auth)    │
                        │                organizations, organization_members, invites,  │
                        │                stories, events, people, products_projects,    │
                        │                culture_values, media_assets, entity_media,    │
                        │                entity_sources, relationships, activity_logs   │
                        │ schema atlas : companies, entities, relations, media,         │
                        │                entity_media, tombstones                       │
                        └──────────▲───────────────────────────────────▲────────────────┘
                                   │ role nexture_app (đọc/ghi core,   │ role atlas_reader
                                   │ ghi atlas)                        │ (CHỈ SELECT schema atlas)
       ┌───────────────────────────┴──────────────┐      ┌─────────────┴──────────────────┐
       │ apps/hub  (Next.js)  hub.<domain>        │      │ apps/atlas (Next.js) atlas.<domain>
       │  - UI Hub + /nexture-admin               │      │  - Server Components đọc atlas.* │
       │  - REST API /api/v1/* (route handlers)   │─────►│  - ISR + revalidateTag           │
       │  - Better Auth /api/auth/*               │ POST │  - /api/revalidate (có secret)   │
       │  - gọi packages/core                     │ revalidate                              │
       └──────┬───────────────────────────────────┘      └─────────────┬──────────────────┘
              │ presigned URL                                           │ <img src>
       ┌──────▼───────────────────────────────────────────────────────▼──┐
       │ Cloudflare R2: bucket nexture-private (file gốc)                  │
       │                bucket nexture-public  (bản sao ảnh đã công khai)  │
       └───────────────────────────────────────────────────────────────────┘
```

Không có worker, không có queue. Mọi xử lý là đồng bộ trong request.

## 2. Nguyên tắc kiến trúc (bắt buộc)

1. **Một database, hai schema.** `core` là nguồn dữ liệu gốc. `atlas` là projection, chỉ được ghi bởi `packages/core/src/public/sync.ts`.
2. **Atlas không đọc được dữ liệu nội bộ ở tầng database.** Atlas kết nối bằng role `atlas_reader` chỉ có `USAGE` + `SELECT` trên schema `atlas`. Script tạo role nằm cuối `02-database.sql`. Atlas KHÔNG ĐƯỢC import `packages/core` hay `packages/db` phần schema `core`; Atlas chỉ import `packages/db/src/atlas-schema.ts`.
3. **Atlas là read-only.** Không có đăng nhập, không có form, không có API ghi, trừ `/api/revalidate` được bảo vệ bằng secret.
4. **Logic nghiệp vụ nằm trong `packages/core`.** Route handler trong `apps/hub` chỉ làm: parse request bằng zod, lấy session, gọi hàm `core`, map lỗi sang HTTP. Không có SQL trong `apps/*` (trừ Atlas đọc `atlas.*`).
5. **File không đi qua server.** Upload và download dùng presigned URL của R2.

## 3. Techstack (đã chốt)

Phiên bản: dùng bản stable mới nhất tại thời điểm khởi tạo repo cho mọi package, trừ khi cột "Phiên bản" ghi khác. Ghi phiên bản thực tế vào `package.json` và giữ cố định (không dùng `^` cho framework chính).

| Lớp | Công nghệ | Phiên bản | Ghi chú |
|---|---|---|---|
| Runtime | Node.js | 22 LTS | `.nvmrc` |
| Ngôn ngữ | TypeScript | ≥ 5.6, `strict: true` | |
| Package manager | pnpm | ≥ 9 | workspaces |
| Monorepo | Turborepo | mới nhất | |
| Web framework | Next.js App Router | ≥ 15 | cho cả `hub` và `atlas` |
| UI | React, Tailwind CSS ≥ 4, shadcn/ui (Radix) | | component sinh vào `packages/ui` |
| Form | react-hook-form + zod + `@hookform/resolvers` | | dùng chung schema zod với API |
| Data fetching (Hub) | TanStack Query ≥ 5 | | gọi REST `/api/v1` |
| Bảng | TanStack Table ≥ 8 | | |
| Rich text | TipTap ≥ 2 (StarterKit + Link) | | lưu HTML đã sanitize, xem `02-database-ghi-chu.md` §5 |
| Sanitize HTML | `sanitize-html` | | allowlist ở `02-database-ghi-chu.md` §5 |
| ORM | Drizzle ORM | | Migration viết tay bằng SQL (`packages/db/sql/*.sql`, bản đầu = `02-database.sql`), chạy bằng `pnpm db:migrate`. Schema Drizzle chỉ để truy vấn, phải khớp SQL. |
| Database | PostgreSQL ≥ 16 (Neon) | | extension `pg_trgm`, `unaccent` |
| Auth | Better Auth (email + password) | | Drizzle adapter, bảng trong schema `core` |
| Email | Resend | | chỉ dùng cho quên mật khẩu |
| Storage | Cloudflare R2 qua `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | | |
| Slug | `slugify` (option `locale: 'vi'`, `lower: true`, `strict: true`) | | |
| Ngày | `date-fns` + `date-fns-tz` | | |
| Test đơn vị | Vitest | | `packages/core` |
| Test E2E | Playwright | | `e2e/` |
| Lint/format | ESLint (next/core-web-vitals) + Prettier | | |
| Lỗi runtime | Sentry (`@sentry/nextjs`) | | cả hai app |
| Hosting | Vercel (2 project) | | Hobby đủ cho demo, Pro khi dùng thương mại |

**Không dùng:** Redux, GraphQL, tRPC, Prisma, microservice, message queue, Elasticsearch, Docker cho production.

## 4. Cấu trúc repo

```
nexture/
├─ apps/
│  ├─ hub/
│  │  ├─ app/
│  │  │  ├─ (auth)/login, signup, forgot-password, reset-password
│  │  │  ├─ (app)/o/[orgId]/...           # các màn hình Hub, xem 06
│  │  │  ├─ (app)/new-org
│  │  │  ├─ (app)/invite/[token]           # nhận lời mời
│  │  │  ├─ nexture-admin/...
│  │  │  ├─ api/auth/[...all]/route.ts    # Better Auth
│  │  │  └─ api/v1/...                    # REST theo 05-api.yaml
│  │  └─ lib/api-client.ts                # client gõ kiểu từ OpenAPI (openapi-typescript + openapi-fetch)
│  └─ atlas/
│     ├─ app/
│     │  ├─ page.tsx, companies/, companies/[slug]/, stories/[slug]/, people/[slug]/,
│     │  │  products/[slug]/, projects/[slug]/, events/[slug]/, search/
│     │  ├─ sitemap.ts, robots.ts
│     │  └─ api/revalidate/route.ts
│     └─ lib/queries.ts                   # chỉ query schema atlas
├─ packages/
│  ├─ db/          # drizzle schema: core-schema.ts, atlas-schema.ts, client.ts, migrate.ts; sql/ (migration SQL)
│  ├─ core/        # src/{auth,orgs,members,invites,entities,media,relations,sources,
│  │               #      search,timeline,dashboard,public,state,activity,errors}
│  ├─ contracts/   # zod schema dùng chung API <-> form, enum, danh mục
│  ├─ ui/          # shadcn components + component hiển thị dùng chung Hub preview & Atlas
│  ├─ i18n/        # vi.json
│  └─ config/      # eslint, tsconfig, tailwind preset (design token ở đây)
├─ e2e/            # Playwright
├─ scripts/seed.ts
└─ docs/spec/      # copy bộ đặc tả này vào repo
```

## 5. Biến môi trường

| Biến | App | Ví dụ / mô tả |
|---|---|---|
| `DATABASE_URL` | hub | Postgres URL của role `nexture_app` (pooled) |
| `DATABASE_URL_UNPOOLED` | hub (migrate) | URL trực tiếp (quyền owner) cho `pnpm db:migrate` |
| `DATABASE_URL_ATLAS` | atlas | Postgres URL của role `atlas_reader` |
| `BETTER_AUTH_SECRET` | hub | chuỗi ngẫu nhiên ≥ 32 ký tự |
| `BETTER_AUTH_URL` | hub | `https://hub.<domain>` |
| `RESEND_API_KEY` | hub | |
| `EMAIL_FROM` | hub | `NexTure <no-reply@<domain>>` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | hub | |
| `S3_ENDPOINT` | hub | Bỏ trống để dùng endpoint R2 tính từ `R2_ACCOUNT_ID`; local/CI trỏ MinIO (`http://localhost:9000`) |
| `R2_PRIVATE_BUCKET` | hub | `nexture-private` |
| `R2_PUBLIC_BUCKET` | hub | `nexture-public` |
| `R2_PUBLIC_BASE_URL` | hub, atlas | `https://media.<domain>` (custom domain của bucket public) |
| `ATLAS_BASE_URL` | hub, atlas | `https://atlas.<domain>` |
| `HUB_BASE_URL` | hub | `https://hub.<domain>` |
| `ATLAS_REVALIDATE_SECRET` | hub, atlas | chuỗi ngẫu nhiên ≥ 32 ký tự |
| `NEXTURE_ADMIN_EMAILS` | hub (seed) | danh sách email được gán `NEXTURE_ADMIN` khi seed |
| `SENTRY_DSN` | hub, atlas | |
| `DEMO_MODE` | atlas | `true` thì hiện dải "Dữ liệu minh họa" trên mọi trang |
| `DEMO_PASSWORD` | seed | Mật khẩu cho tài khoản demo, chỉ dùng khi chạy `pnpm seed --set=demo` |

`.env.example` ở root PHẢI liệt kê đủ các biến trên. App PHẢI validate biến môi trường lúc khởi động bằng zod (`packages/config/env.ts`) và dừng với thông báo rõ nếu thiếu.

## 6. Luồng request mẫu (Hub)

`PATCH /api/v1/orgs/{orgId}/stories/{id}`:
1. Route handler parse body bằng `UpdateStoryInput` (zod, `packages/contracts`).
2. `getSession()` từ Better Auth; không có thì `401 UNAUTHENTICATED`.
3. `core.authz.requireMember(userId, orgId)` trả `role`; không phải thành viên thì `404 NOT_FOUND` (không lộ sự tồn tại của tổ chức).
4. `core.entities.update(ctx, 'STORY', id, input)` trong một transaction:
   kiểm tra quyền theo `03-phan-quyen.md` → kiểm tra version → sanitize HTML → update → ghi activity log → `syncPublic(tx, {type:'STORY', id})`.
5. Sau commit: `core.public.flushRevalidate(tags)` gọi Atlas `/api/revalidate` (xem `08-cong-khai.md` §6).
6. Trả `200` với bản ghi mới.

## 7. Hiệu năng và giới hạn (mục tiêu MVP)

- Hub: p95 API < 500 ms với tổ chức có 1.000 nội dung.
- Atlas: trang được cache tĩnh; TTFB khi cache hit < 200 ms.
- Danh sách API tối đa `pageSize = 100`.
- Upload: ảnh ≤ 20 MB, tài liệu ≤ 50 MB, audio ≤ 100 MB, video ≤ 500 MB (kiểm tra ở bước xin URL và bước xác nhận).
