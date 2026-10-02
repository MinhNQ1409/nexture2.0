// Bilingual Atlas: the reader's language lives in the `atlas_lang` cookie (set by /lang). Vietnamese is the default.
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { PP_STATUS_LABELS, PP_STATUS_LABELS_EN, industryNameEn, provinceNameEn, type PpStatus } from '@nexture/contracts';
import type { CompanyEn, EntityEn } from '@nexture/db/atlas';

export type Lang = 'vi' | 'en';
export const LANG_COOKIE = 'atlas_lang';

export const getLang = cache(async (): Promise<Lang> => ((await cookies()).get(LANG_COOKIE)?.value === 'en' ? 'en' : 'vi'));

const vi = {
  locale: 'vi-VN',
  siteDesc: 'Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.',
  navCompanies: 'Doanh nghiệp',
  navMap: 'Bản đồ',
  navSearch: 'Tìm kiếm',
  footer: 'Vietnam Enterprise Culture Atlas · Vận hành bởi NexTure · Nội dung do doanh nghiệp tự công bố',
  switchTo: 'English',
  switchLabel: 'Switch to English',
  seeAll: 'Xem tất cả',
  companiesN: (n: string) => `${n} doanh nghiệp`,
  storiesN: (n: string) => `${n} câu chuyện`,
  featuredCompanies: 'Doanh nghiệp nổi bật',
  featuredStories: 'Câu chuyện nổi bật',
  foundersPeople: 'Người sáng lập & nhân vật',
  productsProjects: 'Sản phẩm & Dự án',
  newestCompanies: 'Mới tham gia Atlas',
  since: (y: number) => `Từ ${y}`,
  searchPlaceholder: 'Tìm doanh nghiệp, câu chuyện, con người, sản phẩm',
  searchAria: 'Từ khóa tìm kiếm',
  searchBtn: 'Tìm',
  // explore
  exploreTitle: 'Khám phá doanh nghiệp',
  exploreDesc: 'Lọc theo ngành, tỉnh thành và năm thành lập.',
  exploreMetaDesc: 'Danh sách doanh nghiệp Việt Nam và văn hóa của họ.',
  sortNew: 'Mới tham gia',
  sortName: 'Tên A–Z',
  sortFounded: 'Năm thành lập',
  noData: 'Chưa có dữ liệu',
  companyName: 'Tên doanh nghiệp',
  searchByName: 'Tìm theo tên',
  industry: 'Ngành',
  province: 'Tỉnh/Thành',
  fromYear: 'Từ năm',
  toYear: 'Đến năm',
  foundedFrom: 'Thành lập từ năm',
  foundedTo: 'Thành lập đến năm',
  sort: 'Sắp xếp',
  filter: 'Lọc',
  clearFilters: 'Xóa bộ lọc',
  noCompanies: 'Chưa có doanh nghiệp phù hợp.',
  pagination: 'Phân trang',
  prev: 'Trang trước',
  next: 'Trang sau',
  pageOf: (p: number, n: number) => `Trang ${p}/${n}`,
  // company
  companyMetaSuffix: 'Văn hóa doanh nghiệp',
  founded: (y: number) => `Thành lập ${y}`,
  sectionNav: 'Mục trong hồ sơ',
  stories: 'Câu chuyện',
  timeline: 'Dòng thời gian',
  people: 'Con người',
  values: 'Giá trị',
  companyStory: 'Câu chuyện doanh nghiệp',
  readStory: 'Đọc câu chuyện',
  coreValues: 'Giá trị cốt lõi',
  foundersAndPeople: 'Người sáng lập và con người',
  founder: 'Người sáng lập',
  productsAndProjects: 'Sản phẩm và dự án',
  cultureStories: 'Câu chuyện văn hóa',
  // entity
  events: 'Sự kiện',
  images: 'Hình ảnh',
  valuesShown: 'Giá trị thể hiện',
  sources: 'Nguồn',
  aboutCompany: 'Về doanh nghiệp',
  member: 'Thành viên',
  fromDate: (d: string) => `Từ ${d}`,
  contributions: 'Đóng góp nổi bật',
  // search
  searchTitle: 'Tìm kiếm',
  searchAllTypes: 'Tìm trong mọi loại',
  searchHint: 'Thử tìm theo tên doanh nghiệp, người sáng lập, sản phẩm…',
  searchMin: 'Nhập ít nhất 2 ký tự.',
  noResults: (q: string) => `Không tìm thấy kết quả cho “${q}”.`,
  noContent: 'Chưa có nội dung nào.',
  nResults: (n: number) => `${n} kết quả`,
  nItems: (n: number) => `${n} mục, mới nhất trước`,
  // map
  mapTitle: 'Bản đồ doanh nghiệp',
  mapDesc: 'Mỗi chấm là một tỉnh, thành phố. Số trên chấm là số doanh nghiệp có hồ sơ trên Atlas. Bấm vào chấm để xem danh sách.',
  mapPick: 'Chọn một tỉnh, thành phố trên bản đồ để xem các doanh nghiệp ở đó.',
  mapEmpty: 'Chưa có doanh nghiệp nào trên bản đồ.',
  mapProvinces: (n: number) => `${n} tỉnh, thành phố có doanh nghiệp`,
  mapAll: 'Tất cả tỉnh, thành phố',
  mapViewList: 'Xem trong danh sách lọc',
  hoangSa: 'Quần đảo Hoàng Sa (Việt Nam)',
  truongSa: 'Quần đảo Trường Sa (Việt Nam)',
  bienDong: 'Biển Đông',
  loading: 'Đang tải…',
  gone: 'Nội dung này không còn hiển thị trên Atlas.',
  home: 'Về trang chủ',
  notFound: 'Không tìm thấy trang này.',
};
export type Dict = typeof vi;

const en: Dict = {
  locale: 'en-GB',
  siteDesc: 'Discover the stories, people, products and milestones behind Vietnamese enterprises.',
  navCompanies: 'Companies',
  navMap: 'Map',
  navSearch: 'Search',
  footer: 'Vietnam Enterprise Culture Atlas · Operated by NexTure · Content is published by the companies themselves',
  switchTo: 'Tiếng Việt',
  switchLabel: 'Chuyển sang tiếng Việt',
  seeAll: 'See all',
  companiesN: (n) => `${n} companies`,
  storiesN: (n) => `${n} stories`,
  featuredCompanies: 'Featured companies',
  featuredStories: 'Featured stories',
  foundersPeople: 'Founders & people',
  productsProjects: 'Products & Projects',
  newestCompanies: 'New on the Atlas',
  since: (y) => `Since ${y}`,
  searchPlaceholder: 'Search companies, stories, people, products',
  searchAria: 'Search keywords',
  searchBtn: 'Search',
  exploreTitle: 'Explore companies',
  exploreDesc: 'Filter by industry, province and founding year.',
  exploreMetaDesc: 'Vietnamese companies and their culture.',
  sortNew: 'Newest',
  sortName: 'Name A–Z',
  sortFounded: 'Founding year',
  noData: 'No data yet',
  companyName: 'Company name',
  searchByName: 'Search by name',
  industry: 'Industry',
  province: 'Province/City',
  fromYear: 'From year',
  toYear: 'To year',
  foundedFrom: 'Founded from year',
  foundedTo: 'Founded up to year',
  sort: 'Sort',
  filter: 'Filter',
  clearFilters: 'Clear filters',
  noCompanies: 'No matching companies yet.',
  pagination: 'Pagination',
  prev: 'Previous',
  next: 'Next',
  pageOf: (p, n) => `Page ${p} of ${n}`,
  companyMetaSuffix: 'Company culture',
  founded: (y) => `Founded ${y}`,
  sectionNav: 'Profile sections',
  stories: 'Stories',
  timeline: 'Timeline',
  people: 'People',
  values: 'Values',
  companyStory: 'Company story',
  readStory: 'Read the story',
  coreValues: 'Core values',
  foundersAndPeople: 'Founders and people',
  founder: 'Founder',
  productsAndProjects: 'Products and projects',
  cultureStories: 'Culture stories',
  events: 'Events',
  images: 'Images',
  valuesShown: 'Values shown',
  sources: 'Sources',
  aboutCompany: 'About the company',
  member: 'Member',
  fromDate: (d) => `Since ${d}`,
  contributions: 'Notable contributions',
  searchTitle: 'Search',
  searchAllTypes: 'Search all types',
  searchHint: 'Try a company name, a founder, a product…',
  searchMin: 'Type at least 2 characters.',
  noResults: (q) => `No results for “${q}”.`,
  noContent: 'Nothing here yet.',
  nResults: (n) => `${n} results`,
  nItems: (n) => `${n} items, newest first`,
  mapTitle: 'Company map',
  mapDesc: 'Each dot is a province or city. The number is how many companies have a profile on the Atlas. Click a dot to see them.',
  mapPick: 'Pick a province or city on the map to see its companies.',
  mapEmpty: 'No companies on the map yet.',
  mapProvinces: (n) => `${n} provinces and cities with companies`,
  mapAll: 'All provinces and cities',
  mapViewList: 'Open in the filtered list',
  hoangSa: 'Hoang Sa (Paracel) Islands (Vietnam)',
  truongSa: 'Truong Sa (Spratly) Islands (Vietnam)',
  bienDong: 'East Sea',
  loading: 'Loading…',
  gone: 'This content is no longer shown on the Atlas.',
  home: 'Back to home',
  notFound: 'This page could not be found.',
};

export const DICTS: Record<Lang, Dict> = { vi, en };

export const getT = cache(async () => {
  const lang = await getLang();
  return { lang, t: DICTS[lang] };
});

const pick = <T>(enValue: T | undefined, viValue: T) => (enValue === undefined || enValue === null || enValue === '' ? viValue : enValue);

/** English fields win when present; anything missing falls back to Vietnamese, field by field. */
export function locEntity<T extends { title: string; subtitle: string | null; summary: string | null; extra: Record<string, unknown>; en?: EntityEn | null; bodyHtml?: string | null }>(e: T, lang: Lang): T {
  if (lang === 'vi' || !e.en) return e;
  const x = e.en;
  const out = { ...e, title: pick(x.title, e.title), subtitle: pick(x.subtitle, e.subtitle), summary: pick(x.summary, e.summary), extra: { ...e.extra, ...(x.extra ?? {}) } };
  if ('bodyHtml' in e) out.bodyHtml = pick(x.bodyHtml, e.bodyHtml ?? null);
  return out;
}

export function locCompany<
  T extends { shortDesc: string | null; industryName: string | null; provinceName: string | null; industryCode?: string | null; provinceCode?: string | null; en?: CompanyEn | null; cultureValues?: { name: string; description: string | null }[] },
>(c: T, lang: Lang): T {
  if (lang === 'vi') return c;
  const x = c.en ?? {};
  const out = {
    ...c,
    shortDesc: pick(x.shortDesc, c.shortDesc),
    industryName: pick(x.industryName ?? industryNameEn(c.industryCode) ?? undefined, c.industryName),
    provinceName: pick(x.provinceName ?? provinceNameEn(c.provinceCode) ?? undefined, c.provinceName),
  };
  if (c.cultureValues && x.cultureValues?.length) out.cultureValues = x.cultureValues;
  return out;
}

export const statusLabel = (s: unknown, lang: Lang) => (lang === 'en' ? PP_STATUS_LABELS_EN : PP_STATUS_LABELS)[s as PpStatus];
