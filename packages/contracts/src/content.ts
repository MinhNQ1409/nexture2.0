import { z } from 'zod';

export const CONTENT_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'VERIFIED'] as const;
export const VISIBILITIES = ['PRIVATE', 'INTERNAL', 'PUBLIC'] as const;
export const DATE_PRECISIONS = ['YEAR', 'MONTH', 'DAY'] as const;
export const EVENT_TYPES = ['FOUNDING', 'MILESTONE', 'PRODUCT_LAUNCH', 'ACHIEVEMENT', 'EXPANSION', 'CULTURE_ACTIVITY', 'PARTNERSHIP', 'OTHER'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type DatePrecision = (typeof DATE_PRECISIONS)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export const STORY_TYPES = ['COMPANY', 'FOUNDER', 'CULTURE', 'PEOPLE', 'PRODUCT'] as const;
export type StoryType = (typeof STORY_TYPES)[number];
export const PP_KINDS = ['PRODUCT', 'PROJECT'] as const;
export type PpKind = (typeof PP_KINDS)[number];
export const PP_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'DISCONTINUED'] as const;
export type PpStatus = (typeof PP_STATUSES)[number];

// Labels: docs/spec/06-hub-man-hinh.md §1.
export const STATUS_LABELS: Record<ContentStatus, string> = { DRAFT: 'Nháp', PENDING_REVIEW: 'Chờ duyệt', VERIFIED: 'Đã xác minh' };
export const VISIBILITY_LABELS: Record<Visibility, string> = { PRIVATE: 'Riêng tư', INTERNAL: 'Nội bộ', PUBLIC: 'Công khai' };
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  FOUNDING: 'Thành lập',
  MILESTONE: 'Cột mốc',
  PRODUCT_LAUNCH: 'Ra mắt sản phẩm',
  ACHIEVEMENT: 'Thành tựu',
  EXPANSION: 'Mở rộng',
  CULTURE_ACTIVITY: 'Hoạt động văn hóa',
  PARTNERSHIP: 'Hợp tác',
  OTHER: 'Khác',
};
export const STORY_TYPE_LABELS: Record<StoryType, string> = {
  COMPANY: 'Câu chuyện doanh nghiệp',
  FOUNDER: 'Câu chuyện người sáng lập',
  CULTURE: 'Câu chuyện văn hóa',
  PEOPLE: 'Câu chuyện con người',
  PRODUCT: 'Câu chuyện sản phẩm',
};
export const PP_KIND_LABELS: Record<PpKind, string> = { PRODUCT: 'Sản phẩm', PROJECT: 'Dự án' };
export const PP_STATUS_LABELS: Record<PpStatus, string> = { PLANNED: 'Dự kiến', ACTIVE: 'Đang hoạt động', COMPLETED: 'Đã hoàn thành', DISCONTINUED: 'Đã ngừng' };
export const PUBLIC_STATE_LABELS = {
  NOT_PUBLIC: '',
  LIVE: 'Đang hiển thị trên Atlas',
  WAITING_ORG: 'Chờ bật hồ sơ Atlas',
  HIDDEN_BY_NEXTURE: 'Bị NexTure ẩn',
  NOT_USED: 'Công khai, chưa dùng trên Atlas',
} as const;

/** Fuzzy date; the stored date is normalised to the first day of the year/month for YEAR/MONTH. */
export const fuzzyDate = z
  .object({ date: z.iso.date(), precision: z.enum(DATE_PRECISIONS) })
  .transform(({ date, precision }) => ({
    precision,
    date: precision === 'YEAR' ? `${date.slice(0, 4)}-01-01` : precision === 'MONTH' ? `${date.slice(0, 7)}-01` : date,
  }));
export type FuzzyDate = z.output<typeof fuzzyDate>;

/** Display per 06 §1: YEAR "2024", MONTH "05/2024", DAY "17/05/2024". */
export function formatFuzzyDate(d: { date: string; precision: DatePrecision } | null | undefined): string {
  if (!d) return '';
  const [y, m, day] = d.date.split('-');
  return d.precision === 'YEAR' ? `${y}` : d.precision === 'MONTH' ? `${m}/${y}` : `${day}/${m}/${y}`;
}

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

export const eventFields = {
  eventType: z.enum(EVENT_TYPES),
  titleVi: z.string().trim().min(1).max(200),
  titleEn: nullableText(200),
  summaryVi: nullableText(500),
  summaryEn: nullableText(500),
  contentVi: z.string().nullish(),
  contentEn: z.string().nullish(),
  startDate: fuzzyDate,
  endDate: fuzzyDate.nullish(),
  coverMediaId: z.uuid().nullish(),
  internalNotes: nullableText(5000),
};

export const eventInput = z.object({
  ...eventFields,
  eventType: eventFields.eventType.default('MILESTONE'),
  status: z.enum(['DRAFT', 'VERIFIED']).default('DRAFT'),
  visibility: z.enum(['PRIVATE', 'INTERNAL']).default('INTERNAL'),
});
export type EventInput = z.input<typeof eventInput>;

export const eventPatch = z.object({ version: z.number().int(), ...eventFields }).partial().required({ version: true });
export type EventPatch = z.input<typeof eventPatch>;

const createExtras = {
  status: z.enum(['DRAFT', 'VERIFIED']).default('DRAFT'),
  visibility: z.enum(['PRIVATE', 'INTERNAL']).default('INTERNAL'),
};

export const storyFields = {
  storyType: z.enum(STORY_TYPES),
  titleVi: z.string().trim().min(1).max(200),
  titleEn: nullableText(200),
  summaryVi: nullableText(500),
  summaryEn: nullableText(500),
  contentVi: z.string().max(100000).nullish(),
  contentEn: z.string().nullish(),
  storyDate: fuzzyDate.nullish(),
  coverMediaId: z.uuid().nullish(),
  internalNotes: nullableText(5000),
};
export const storyInput = z.object({ ...storyFields, storyType: storyFields.storyType.default('CULTURE'), ...createExtras });
export type StoryInput = z.input<typeof storyInput>;
export const storyPatch = z.object({ version: z.number().int(), ...storyFields }).partial().required({ version: true });

export const personFields = {
  fullName: z.string().trim().min(1).max(150),
  roleTitleVi: nullableText(150),
  roleTitleEn: nullableText(150),
  isFounder: z.boolean(),
  joinedDate: fuzzyDate.nullish(),
  leftDate: fuzzyDate.nullish(),
  bioVi: z.string().max(50000).nullish(),
  bioEn: z.string().nullish(),
  contributionsVi: z.string().max(20000).nullish(),
  contributionsEn: z.string().nullish(),
  avatarMediaId: z.uuid().nullish(),
  internalNotes: nullableText(5000),
};
export const personInput = z.object({ ...personFields, isFounder: personFields.isFounder.default(false), ...createExtras });
export type PersonInput = z.input<typeof personInput>;
export const personPatch = z.object({ version: z.number().int(), ...personFields }).partial().required({ version: true });

export const productFields = {
  kind: z.enum(PP_KINDS),
  titleVi: z.string().trim().min(1).max(200),
  titleEn: nullableText(200),
  summaryVi: nullableText(500),
  summaryEn: nullableText(500),
  descriptionVi: z.string().max(100000).nullish(),
  descriptionEn: z.string().nullish(),
  launchDate: fuzzyDate.nullish(),
  ppStatus: z.enum(PP_STATUSES),
  coverMediaId: z.uuid().nullish(),
  internalNotes: nullableText(5000),
};
export const productInput = z.object({ ...productFields, ppStatus: productFields.ppStatus.default('ACTIVE'), ...createExtras });
export type ProductInput = z.input<typeof productInput>;
export const productPatch = z.object({ version: z.number().int(), ...productFields }).partial().required({ version: true });

export const versionOnly = z.object({ version: z.number().int() });
export const returnInput = z.object({ version: z.number().int(), note: z.string().trim().min(1).max(1000) });
export const visibilityInput = z.object({ version: z.number().int(), visibility: z.enum(VISIBILITIES) });

// Media upload: docs/spec/02-database-ghi-chu.md §7.
export const MEDIA_RULES = {
  IMAGE: { mimes: ['image/jpeg', 'image/png', 'image/webp'], exts: ['jpg', 'jpeg', 'png', 'webp'], maxBytes: 20 * 1024 * 1024 },
  DOCUMENT: {
    mimes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    exts: ['pdf', 'doc', 'docx'],
    maxBytes: 50 * 1024 * 1024,
  },
  VIDEO: { mimes: ['video/mp4'], exts: ['mp4'], maxBytes: 500 * 1024 * 1024 },
  AUDIO: { mimes: ['audio/mpeg', 'audio/wav', 'audio/x-wav'], exts: ['mp3', 'wav'], maxBytes: 100 * 1024 * 1024 },
} as const;
export type MediaKind = keyof typeof MEDIA_RULES;

export const uploadUrlInput = z.object({ filename: z.string().trim().min(1).max(255), mimeType: z.string().trim().min(1), sizeBytes: z.number().int().min(1) });
export const completeUploadInput = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: nullableText(2000),
  altText: nullableText(300),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
});

// Culture values (06 §9) and relations (05-api.yaml PUT .../relations).
export const valueInput = z.object({
  nameVi: z.string().trim().min(1).max(100),
  descriptionVi: nullableText(1000),
  visibility: z.enum(['INTERNAL', 'PUBLIC']).default('INTERNAL'),
});
export type ValueInput = z.input<typeof valueInput>;
export const valuePatch = z.object({ version: z.number().int(), ...valueInput.shape, visibility: z.enum(['INTERNAL', 'PUBLIC']) }).partial().required({ version: true });
export const valueOrder = z.object({ ids: z.array(z.uuid()).max(100) });

export const RELATION_TARGETS = ['STORY', 'EVENT', 'PERSON', 'PRODUCT_PROJECT', 'CULTURE_VALUE'] as const;
export type RelationTarget = (typeof RELATION_TARGETS)[number];
export const relationsInput = z.object({ targetType: z.enum(RELATION_TARGETS), ids: z.array(z.uuid()).max(100) });

// Media library (06 §10).
export const mediaPatch = z
  .object({
    version: z.number().int(),
    title: z.string().trim().min(1).max(200),
    description: nullableText(2000),
    altText: nullableText(300),
    occurredDate: fuzzyDate.nullish(),
    sourceNote: nullableText(500),
    providedBy: nullableText(200),
    tags: z.array(z.string().trim().min(1).max(50)).max(20),
  })
  .partial()
  .required({ version: true });
export const entityMediaInput = z.object({
  items: z.array(z.object({ mediaId: z.uuid(), caption: nullableText(300) })).max(50),
});
export const MEDIA_KIND_LABELS = { IMAGE: 'Ảnh', DOCUMENT: 'Tài liệu', VIDEO: 'Video', AUDIO: 'Âm thanh' } as const;

// Activity log sentences (06 §5, §14.3): "{người} {hành động} {đối tượng}".
export const ACTIVITY_LABELS: Record<string, string> = {
  ORG_CREATED: 'đã tạo doanh nghiệp',
  ORG_UPDATED: 'đã cập nhật hồ sơ',
  ATLAS_ENABLED: 'đã bật hồ sơ trên Atlas',
  ATLAS_DISABLED: 'đã tắt hồ sơ trên Atlas',
  MEMBER_ROLE_CHANGED: 'đã đổi vai trò của',
  MEMBER_REMOVED: 'đã gỡ thành viên',
  MEMBER_JOINED: 'đã tham gia',
  INVITE_CREATED: 'đã tạo lời mời',
  INVITE_REVOKED: 'đã thu hồi lời mời',
  MEDIA_UPLOADED: 'đã tải lên',
  MEDIA_UPDATED: 'đã sửa tư liệu',
  MEDIA_DELETED: 'đã xóa tư liệu',
  ENTITY_CREATED: 'đã tạo',
  ENTITY_UPDATED: 'đã sửa',
  ENTITY_DELETED: 'đã xóa',
  ENTITY_SUBMITTED: 'đã gửi duyệt',
  ENTITY_APPROVED: 'đã xác minh',
  ENTITY_RETURNED: 'đã trả lại',
  ENTITY_UNVERIFIED: 'đã bỏ xác minh',
  VISIBILITY_CHANGED: 'đã đổi mức hiển thị của',
  RELATIONS_UPDATED: 'đã sửa liên kết của',
  ENTITY_MEDIA_UPDATED: 'đã sửa bộ ảnh của',
  SOURCE_ADDED: 'đã thêm nguồn cho',
  SOURCE_REMOVED: 'đã gỡ nguồn của',
  ATLAS_HIDDEN_BY_NEXTURE: 'NexTure đã ẩn',
  ATLAS_UNHIDDEN_BY_NEXTURE: 'NexTure đã bỏ ẩn',
};
export const TARGET_TYPE_LABELS: Record<string, string> = {
  ORGANIZATION: 'doanh nghiệp',
  STORY: 'câu chuyện',
  EVENT: 'sự kiện',
  PERSON: 'người',
  PRODUCT_PROJECT: 'sản phẩm/dự án',
  CULTURE_VALUE: 'giá trị',
  MEDIA: 'tư liệu',
  MEMBER: 'thành viên',
  INVITE: 'lời mời',
};
