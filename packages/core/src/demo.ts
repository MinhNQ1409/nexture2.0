// "Tải dữ liệu demo": creates a complete sample company for the caller (ADMIN) so every Hub and Atlas
// screen has something to show: all event statuses and visibilities, a returned item, values, people,
// stories, products, sources, members, a pending invite and a live Atlas profile.
import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import type { EventType } from '@nexture/contracts';
import { coreTables as t, type Tx } from '@nexture/db';
import { logActivity } from './activity';
import type { Ctx } from './context';
import { flushRevalidate } from './public/flush';
import { emptySync, syncPublic } from './public/sync';
import { makeSlug, uniqueSlug } from './slug';

type Status = 'DRAFT' | 'PENDING_REVIEW' | 'VERIFIED';
type Vis = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
type Precision = 'YEAR' | 'MONTH' | 'DAY';

const p = (...paras: string[]) => paras.map((x) => `<p>${x}</p>`).join('');

const COMPANY = {
  name: 'Mây Ngàn Coffee',
  foundedYear: 2016,
  industryCode: 'FNB',
  employeeSize: 'S51_200' as const,
  provinceCode: 'ha-noi',
  website: 'https://example.com/may-ngan',
  shortDescVi:
    'Chuỗi cà phê đặc sản làm việc trực tiếp với nông hộ Tây Bắc. Mây Ngàn tin rằng một tách cà phê ngon bắt đầu từ sự tôn trọng người trồng.',
};

const VALUES: { key: string; name: string; desc: string; vis: Vis }[] = [
  { key: 'nguon', name: 'Tôn trọng nguồn cội', desc: 'Mua đúng giá, trả đúng hạn, đứng tên nông hộ trên từng bao cà phê.', vis: 'PUBLIC' },
  { key: 'tu-te', name: 'Tử tế từng tách', desc: 'Phục vụ như mời khách vào nhà mình.', vis: 'PUBLIC' },
  { key: 'hoc', name: 'Học mỗi ngày', desc: 'Mỗi barista có 2 giờ học nghề mỗi tuần, có lương.', vis: 'PUBLIC' },
  { key: 'minh-bach', name: 'Minh bạch', desc: 'Chia sẻ số liệu kinh doanh hằng quý với toàn đội.', vis: 'INTERNAL' },
];

const PEOPLE: { key: string; name: string; role: string; founder?: boolean; joined: [string, Precision]; bio: string; status: Status; vis: Vis }[] = [
  { key: 'an', name: 'Nguyễn Thu An', role: 'Đồng sáng lập, Giám đốc điều hành', founder: true, joined: ['2016-01-01', 'YEAR'], bio: 'Từng làm kỹ sư nông nghiệp ở Sơn La trước khi mở quán đầu tiên.', status: 'VERIFIED', vis: 'PUBLIC' },
  { key: 'minh', name: 'Trần Quang Minh', role: 'Đồng sáng lập, Trưởng rang xay', founder: true, joined: ['2016-01-01', 'YEAR'], bio: 'Người giữ công thức rang của Mây Ngàn suốt 8 năm.', status: 'VERIFIED', vis: 'PUBLIC' },
  { key: 'lan', name: 'Lò Thị Lan', role: 'Điều phối vùng trồng Sơn La', joined: ['2018-03-01', 'MONTH'], bio: 'Người Thái ở Chiềng Ban, cầu nối giữa Mây Ngàn và 40 nông hộ.', status: 'VERIFIED', vis: 'INTERNAL' },
  { key: 'hoa', name: 'Phạm Mai Hoa', role: 'Trưởng đào tạo barista', joined: ['2019-06-01', 'MONTH'], bio: 'Đã đào tạo hơn 120 barista.', status: 'PENDING_REVIEW', vis: 'INTERNAL' },
  { key: 'duc', name: 'Vũ Anh Đức', role: 'Quản lý cửa hàng Hội An', joined: ['2022-09-01', 'MONTH'], bio: 'Bản nháp, cần bổ sung.', status: 'DRAFT', vis: 'PRIVATE' },
];

const PRODUCTS: { key: string; kind: 'PRODUCT' | 'PROJECT'; title: string; summary: string; launch: [string, Precision]; ppStatus: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED'; status: Status; vis: Vis }[] = [
  { key: 'arabica', kind: 'PRODUCT', title: 'Arabica Chiềng Ban rang mộc', summary: 'Dòng cà phê chủ lực, rang vừa, hậu vị mận chín.', launch: ['2017-04-01', 'MONTH'], ppStatus: 'ACTIVE', status: 'VERIFIED', vis: 'PUBLIC' },
  { key: 'cold', kind: 'PRODUCT', title: 'Cold brew đóng chai', summary: 'Ủ lạnh 18 giờ, bán tại cửa hàng và siêu thị.', launch: ['2021-05-01', 'MONTH'], ppStatus: 'ACTIVE', status: 'VERIFIED', vis: 'INTERNAL' },
  { key: 'truong', kind: 'PROJECT', title: 'Dự án Trường học trên đồi', summary: 'Xây 2 phòng học cho trẻ em vùng trồng cà phê.', launch: ['2020-08-01', 'MONTH'], ppStatus: 'COMPLETED', status: 'VERIFIED', vis: 'PUBLIC' },
];

const STORIES: { key: string; type: 'COMPANY' | 'FOUNDER' | 'CULTURE' | 'PEOPLE' | 'PRODUCT'; title: string; summary: string; content: string; date: [string, Precision]; status: Status; vis: Vis }[] = [
  { key: 'cong-ty', type: 'COMPANY', title: 'Từ một quán 12 chỗ ngồi', summary: 'Hành trình 8 năm của Mây Ngàn.', content: p('Năm 2016, hai người bạn thuê một gian nhỏ ở phố cổ Hà Nội.', 'Họ chỉ có một máy rang 5kg và niềm tin vào cà phê Tây Bắc.'), date: ['2016-01-01', 'YEAR'], status: 'VERIFIED', vis: 'PUBLIC' },
  { key: 'sang-lap', type: 'FOUNDER', title: 'Chị An và những chuyến xe lên Sơn La', summary: 'Vì sao người sáng lập rời nghề kỹ sư.', content: p('Mỗi tháng chị An lên vùng trồng hai lần, ở lại nhà nông hộ.'), date: ['2015-01-01', 'YEAR'], status: 'VERIFIED', vis: 'PUBLIC' },
  { key: 'van-hoa', type: 'CULTURE', title: 'Buổi cupping thứ Sáu', summary: 'Nghi thức nếm thử cà phê hằng tuần của cả công ty.', content: p('Chiều thứ Sáu, mọi người từ kế toán đến barista cùng nếm và chấm điểm mẻ rang mới.'), date: ['2018-01-01', 'YEAR'], status: 'VERIFIED', vis: 'INTERNAL' },
  { key: 'con-nguoi', type: 'PEOPLE', title: 'Một ngày của barista Mây Ngàn', summary: 'Bản nháp đang viết.', content: p('Đang phỏng vấn đội cửa hàng.'), date: ['2024-01-01', 'YEAR'], status: 'DRAFT', vis: 'PRIVATE' },
];

type DemoEvent = {
  type: EventType;
  title: string;
  start: [string, Precision];
  end?: [string, Precision];
  summary: string;
  content?: string;
  notes?: string;
  status: Status;
  vis: Vis;
  returnNote?: string;
  values?: string[];
  people?: string[];
  products?: string[];
  sources?: { title: string; url?: string; note?: string; isPublic: boolean }[];
};

const EVENTS: DemoEvent[] = [
  {
    type: 'FOUNDING', title: 'Mở quán đầu tiên ở phố cổ', start: ['2016-05-01', 'MONTH'], status: 'VERIFIED', vis: 'PUBLIC',
    summary: 'Quán 12 chỗ ngồi, hai nhà sáng lập tự rang và pha.',
    content: p('Mùa hè 2016, Mây Ngàn thuê một gian nhỏ trên phố Hàng Bạc.', 'Mỗi sáng hai nhà sáng lập rang 5kg cà phê và tự tay pha cho khách.'),
    notes: 'Tiền thuê tháng đầu: 9 triệu. Không đưa lên Atlas.', values: ['tu-te'], people: ['an', 'minh'],
    sources: [{ title: 'Ảnh khai trương (lưu trữ nội bộ)', url: 'https://example.com/drive/khai-truong', note: 'Chỉ nội bộ', isPublic: false }, { title: 'Bài báo địa phương về quán mới', url: 'https://example.com/bai-bao', isPublic: true }],
  },
  {
    type: 'PARTNERSHIP', title: 'Ký kết với 12 nông hộ Chiềng Ban', start: ['2017-02-14', 'DAY'], status: 'VERIFIED', vis: 'PUBLIC',
    summary: 'Hợp đồng mua cà phê dài hạn đầu tiên, giá cao hơn thị trường 30%.',
    content: p('Mây Ngàn cam kết bao tiêu toàn bộ cà phê chín đỏ và trả trước 40% vào đầu vụ.'), values: ['nguon'], people: ['an', 'lan'],
  },
  {
    type: 'PRODUCT_LAUNCH', title: 'Ra mắt Arabica Chiềng Ban rang mộc', start: ['2017-04-01', 'MONTH'], status: 'VERIFIED', vis: 'PUBLIC',
    summary: 'Sản phẩm đóng gói đầu tiên mang tên vùng trồng.', values: ['nguon'], products: ['arabica'], people: ['minh'],
  },
  {
    type: 'CULTURE_ACTIVITY', title: 'Buổi cupping thứ Sáu đầu tiên', start: ['2018-01-01', 'YEAR'], status: 'VERIFIED', vis: 'PUBLIC',
    summary: 'Từ đây, chiều thứ Sáu nào cả công ty cũng cùng nếm cà phê.', values: ['hoc', 'tu-te'],
  },
  {
    type: 'EXPANSION', title: 'Mở cửa hàng thứ năm tại Đà Nẵng', start: ['2019-09-01', 'MONTH'], status: 'VERIFIED', vis: 'PUBLIC',
    summary: 'Cửa hàng đầu tiên ngoài Hà Nội.',
  },
  {
    type: 'CULTURE_ACTIVITY', title: 'Dự án Trường học trên đồi', start: ['2020-08-01', 'MONTH'], end: ['2020-12-01', 'MONTH'], status: 'VERIFIED', vis: 'PUBLIC',
    summary: 'Nhân viên góp một ngày lương xây 2 phòng học cho trẻ em vùng trồng.', values: ['nguon', 'tu-te'], products: ['truong'],
    sources: [{ title: 'Báo cáo dự án', url: 'https://example.com/bao-cao', note: 'Bản tóm tắt công khai', isPublic: true }],
  },
  {
    type: 'PRODUCT_LAUNCH', title: 'Cold brew đóng chai', start: ['2021-05-01', 'MONTH'], status: 'VERIFIED', vis: 'INTERNAL',
    summary: 'Đã xác minh nhưng chỉ hiển thị nội bộ: chưa muốn công bố đối tác phân phối.', products: ['cold'],
  },
  {
    type: 'ACHIEVEMENT', title: 'Giải Cà phê đặc sản Việt Nam', start: ['2023-11-01', 'MONTH'], status: 'VERIFIED', vis: 'PRIVATE',
    summary: 'Đã xác minh, đang để riêng tư chờ ban tổ chức công bố chính thức.',
  },
  {
    type: 'MILESTONE', title: 'Đạt 100 nhân viên', start: ['2024-03-01', 'MONTH'], status: 'PENDING_REVIEW', vis: 'INTERNAL',
    summary: 'Đang chờ quản trị viên duyệt.', people: ['hoa'],
  },
  {
    type: 'EXPANSION', title: 'Mở cửa hàng Hội An', start: ['2022-09-01', 'MONTH'], status: 'DRAFT', vis: 'INTERNAL',
    summary: 'Bị trả lại để bổ sung.', returnNote: 'Cần thêm ngày khai trương chính xác và ảnh mặt tiền.', people: ['duc'],
  },
  {
    type: 'OTHER', title: 'Ý tưởng: quầy cà phê lưu động', start: ['2025-01-01', 'YEAR'], status: 'DRAFT', vis: 'PRIVATE',
    summary: 'Bản nháp riêng tư, mới là ý tưởng.',
  },
];

const DEMO_MEMBERS = [
  { email: 'binh.demo@nexture.demo', name: 'Lê Văn Bình (demo)', role: 'EDITOR' as const },
  { email: 'chi.demo@nexture.demo', name: 'Đỗ Thùy Chi (demo)', role: 'VIEWER' as const },
];

/** Generated monogram logo (never a real trademark). */
export function logoSvg(initials: string, fill = '#18794E', line = '#D3F2E2') {
  return new TextEncoder().encode(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="40" fill="${fill}"/><path d="M40 176c30-40 58-60 88-60s58 20 88 60" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round"/><text x="128" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="${initials.length > 2 ? 64 : 84}" font-weight="700" fill="#FFFFFF">${initials}</text></svg>`,
  );
}

async function demoUser(tx: Tx, m: (typeof DEMO_MEMBERS)[number]) {
  const [u] = await tx.select({ id: t.user.id }).from(t.user).where(eq(t.user.email, m.email));
  if (u) return u.id;
  const id = uuidv7();
  await tx.insert(t.user).values({ id, name: m.name, email: m.email, emailVerified: true });
  return id;
}

/** POST /demo: returns the new org id. Each call creates a separate demo company. */
export async function createDemoOrg(ctx: Ctx): Promise<{ orgId: string }> {
  const userId = ctx.actor.userId;
  const orgId = uuidv7();
  const logoId = uuidv7();
  const logoKey = `orgs/${orgId}/media/${logoId}/logo-may-ngan.svg`;
  const logo = logoSvg('MN');
  // Write the logo before the transaction so the Atlas sync inside it can copy it to public storage.
  if (ctx.storage) await ctx.storage.putPrivate(logoKey, logo, 'image/svg+xml');

  const sync = emptySync();
  await ctx.db.transaction(async (tx) => {
    const taken = async (s: string) => (await tx.select({ id: t.organizations.id }).from(t.organizations).where(eq(t.organizations.slug, s))).length > 0;
    const slug = await uniqueSlug(makeSlug(`${COMPANY.name} demo`), taken);
    const now = new Date();
    const who = { createdBy: userId, updatedBy: userId };
    const verified = (s: Status) => (s === 'VERIFIED' ? { verifiedBy: userId, verifiedAt: now } : {});
    const submitted = (s: Status) => (s === 'PENDING_REVIEW' ? { submittedBy: userId, submittedAt: now } : {});

    await tx.insert(t.organizations).values({ id: orgId, slug, ...COMPANY, name: `${COMPANY.name} (Demo)`, createdBy: userId });
    await tx.insert(t.organizationMembers).values({ organizationId: orgId, userId, role: 'ADMIN' });
    for (const m of DEMO_MEMBERS) await tx.insert(t.organizationMembers).values({ organizationId: orgId, userId: await demoUser(tx, m), role: m.role });
    await tx.insert(t.invites).values({
      id: uuidv7(),
      organizationId: orgId,
      tokenHash: createHash('sha256').update(randomBytes(32)).digest('hex'),
      role: 'EDITOR',
      email: 'ung-vien.demo@nexture.demo',
      expiresAt: new Date(Date.now() + 7 * 864e5),
      createdBy: userId,
    });

    await tx.insert(t.mediaAssets).values({
      id: logoId, organizationId: orgId, kind: 'IMAGE', title: 'Logo Mây Ngàn', originalFilename: 'logo-may-ngan.svg', mimeType: 'image/svg+xml',
      sizeBytes: logo.byteLength, storageKey: logoKey, uploadStatus: ctx.storage ? 'READY' : 'PENDING', width: 256, height: 256, altText: 'Logo Mây Ngàn Coffee', ...who,
    });
    if (ctx.storage) await tx.update(t.organizations).set({ logoMediaId: logoId }).where(eq(t.organizations.id, orgId));

    const valueIds: Record<string, string> = {};
    for (const [i, v] of VALUES.entries()) {
      valueIds[v.key] = uuidv7();
      await tx.insert(t.cultureValues).values({ id: valueIds[v.key]!, organizationId: orgId, nameVi: v.name, descriptionVi: v.desc, sortOrder: i, visibility: v.vis, ...who });
    }
    const personIds: Record<string, string> = {};
    for (const x of PEOPLE) {
      personIds[x.key] = uuidv7();
      await tx.insert(t.people).values({
        id: personIds[x.key]!, organizationId: orgId, fullName: x.name, roleTitleVi: x.role, isFounder: !!x.founder, joinedDate: x.joined[0], joinedDatePrecision: x.joined[1],
        bioVi: x.bio, status: x.status, visibility: x.vis, ...verified(x.status), ...submitted(x.status), ...who,
      });
    }
    const productIds: Record<string, string> = {};
    for (const x of PRODUCTS) {
      productIds[x.key] = uuidv7();
      await tx.insert(t.productsProjects).values({
        id: productIds[x.key]!, organizationId: orgId, kind: x.kind, titleVi: x.title, summaryVi: x.summary, launchDate: x.launch[0], launchDatePrecision: x.launch[1],
        ppStatus: x.ppStatus, status: x.status, visibility: x.vis, ...verified(x.status), ...who,
      });
    }
    const storyIds: Record<string, string> = {};
    for (const x of STORIES) {
      storyIds[x.key] = uuidv7();
      await tx.insert(t.stories).values({
        id: storyIds[x.key]!, organizationId: orgId, storyType: x.type, titleVi: x.title, summaryVi: x.summary, contentVi: x.content, storyDate: x.date[0], storyDatePrecision: x.date[1],
        status: x.status, visibility: x.vis, ...verified(x.status), ...who,
      });
    }
    await tx.update(t.organizations).set({ featuredStoryId: storyIds['cong-ty'] }).where(eq(t.organizations.id, orgId));
    await tx.insert(t.relationships).values({
      id: uuidv7(), organizationId: orgId, relationshipType: 'STORY_CULTURE_VALUE', sourceType: 'STORY', sourceId: storyIds['van-hoa']!, targetType: 'CULTURE_VALUE', targetId: valueIds['hoc']!, createdBy: userId,
    });

    for (const e of EVENTS) {
      const id = uuidv7();
      await tx.insert(t.events).values({
        id, organizationId: orgId, eventType: e.type, titleVi: e.title, summaryVi: e.summary, contentVi: e.content ?? null, internalNotes: e.notes ?? null,
        startDate: e.start[0], startDatePrecision: e.start[1], endDate: e.end?.[0] ?? null, endDatePrecision: e.end?.[1] ?? null,
        status: e.status, visibility: e.vis, returnNote: e.returnNote ?? null, ...verified(e.status), ...submitted(e.status), ...who,
      });
      const rel = (type: 'EVENT_CULTURE_VALUE' | 'PERSON_EVENT' | 'EVENT_PRODUCT_PROJECT', other: 'CULTURE_VALUE' | 'PERSON' | 'PRODUCT_PROJECT', otherId: string) =>
        tx.insert(t.relationships).values(
          type === 'PERSON_EVENT'
            ? { id: uuidv7(), organizationId: orgId, relationshipType: type, sourceType: 'PERSON', sourceId: otherId, targetType: 'EVENT', targetId: id, createdBy: userId }
            : { id: uuidv7(), organizationId: orgId, relationshipType: type, sourceType: 'EVENT', sourceId: id, targetType: other, targetId: otherId, createdBy: userId },
        );
      for (const v of e.values ?? []) await rel('EVENT_CULTURE_VALUE', 'CULTURE_VALUE', valueIds[v]!);
      for (const x of e.people ?? []) await rel('PERSON_EVENT', 'PERSON', personIds[x]!);
      for (const x of e.products ?? []) await rel('EVENT_PRODUCT_PROJECT', 'PRODUCT_PROJECT', productIds[x]!);
      for (const [i, s] of (e.sources ?? []).entries()) {
        await tx.insert(t.entitySources).values({ id: uuidv7(), organizationId: orgId, entityType: 'EVENT', entityId: id, title: s.title, url: s.url ?? null, note: s.note ?? null, isPublic: s.isPublic, sortOrder: i, createdBy: userId });
      }
    }

    await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ORG_CREATED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: `${COMPANY.name} (Demo)` });
    // Go live on Atlas only when the logo really exists (the profile requires it).
    if (ctx.storage) {
      await tx.update(t.organizations).set({ atlasEnabled: true, atlasFirstEnabledAt: now, slugLocked: true }).where(eq(t.organizations.id, orgId));
      await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ATLAS_ENABLED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: `${COMPANY.name} (Demo)` });
      await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
    }
  });
  await flushRevalidate(ctx, sync);
  return { orgId };
}
