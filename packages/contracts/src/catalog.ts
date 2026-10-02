// Single source of truth for catalogs (docs/spec/02-database-ghi-chu.md §3–4, 06 §0).

export const INDUSTRIES = [
  { code: 'TECH', name: 'Công nghệ thông tin & Phần mềm' },
  { code: 'MANUFACTURING', name: 'Sản xuất & Công nghiệp' },
  { code: 'RETAIL', name: 'Bán lẻ & Thương mại' },
  { code: 'FNB', name: 'Thực phẩm & Đồ uống' },
  { code: 'HOSPITALITY', name: 'Du lịch & Khách sạn' },
  { code: 'FINANCE', name: 'Tài chính, Ngân hàng & Bảo hiểm' },
  { code: 'REAL_ESTATE', name: 'Bất động sản & Xây dựng' },
  { code: 'EDUCATION', name: 'Giáo dục & Đào tạo' },
  { code: 'HEALTHCARE', name: 'Y tế & Chăm sóc sức khỏe' },
  { code: 'LOGISTICS', name: 'Vận tải & Logistics' },
  { code: 'AGRICULTURE', name: 'Nông nghiệp & Thủy sản' },
  { code: 'MEDIA', name: 'Truyền thông, Quảng cáo & Sáng tạo' },
  { code: 'CRAFT', name: 'Thủ công mỹ nghệ & Làng nghề' },
  { code: 'ENERGY', name: 'Năng lượng & Môi trường' },
  { code: 'PROFESSIONAL', name: 'Dịch vụ chuyên nghiệp (tư vấn, luật, kế toán)' },
  { code: 'OTHER', name: 'Khác' },
] as const;

const CITIES = [
  { code: 'ha-noi', name: 'Hà Nội' },
  { code: 'hue', name: 'Huế' },
  { code: 'hai-phong', name: 'Hải Phòng' },
  { code: 'da-nang', name: 'Đà Nẵng' },
  { code: 'ho-chi-minh', name: 'TP. Hồ Chí Minh' },
  { code: 'can-tho', name: 'Cần Thơ' },
];
const PROVINCES_ONLY = [
  { code: 'lai-chau', name: 'Lai Châu' },
  { code: 'dien-bien', name: 'Điện Biên' },
  { code: 'son-la', name: 'Sơn La' },
  { code: 'lang-son', name: 'Lạng Sơn' },
  { code: 'quang-ninh', name: 'Quảng Ninh' },
  { code: 'thanh-hoa', name: 'Thanh Hóa' },
  { code: 'nghe-an', name: 'Nghệ An' },
  { code: 'ha-tinh', name: 'Hà Tĩnh' },
  { code: 'cao-bang', name: 'Cao Bằng' },
  { code: 'tuyen-quang', name: 'Tuyên Quang' },
  { code: 'lao-cai', name: 'Lào Cai' },
  { code: 'thai-nguyen', name: 'Thái Nguyên' },
  { code: 'phu-tho', name: 'Phú Thọ' },
  { code: 'bac-ninh', name: 'Bắc Ninh' },
  { code: 'hung-yen', name: 'Hưng Yên' },
  { code: 'ninh-binh', name: 'Ninh Bình' },
  { code: 'quang-tri', name: 'Quảng Trị' },
  { code: 'quang-ngai', name: 'Quảng Ngãi' },
  { code: 'gia-lai', name: 'Gia Lai' },
  { code: 'khanh-hoa', name: 'Khánh Hòa' },
  { code: 'lam-dong', name: 'Lâm Đồng' },
  { code: 'dak-lak', name: 'Đắk Lắk' },
  { code: 'dong-nai', name: 'Đồng Nai' },
  { code: 'tay-ninh', name: 'Tây Ninh' },
  { code: 'vinh-long', name: 'Vĩnh Long' },
  { code: 'dong-thap', name: 'Đồng Tháp' },
  { code: 'ca-mau', name: 'Cà Mau' },
  { code: 'an-giang', name: 'An Giang' },
].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

/** 34 provincial units effective 2025-07-01: 6 cities first, then provinces A–Z. */
export const PROVINCES: readonly { code: string; name: string }[] = [...CITIES, ...PROVINCES_ONLY];

export const EMPLOYEE_SIZES = [
  { code: 'S1_10', name: '1–10 nhân sự' },
  { code: 'S11_50', name: '11–50 nhân sự' },
  { code: 'S51_200', name: '51–200 nhân sự' },
  { code: 'S201_500', name: '201–500 nhân sự' },
  { code: 'S500_PLUS', name: 'Trên 500 nhân sự' },
] as const;

export const ORG_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];
export const ROLE_LABELS: Record<OrgRole, string> = { ADMIN: 'Quản trị', EDITOR: 'Biên tập', VIEWER: 'Người xem' };

export const industryName = (code: string | null | undefined) =>
  INDUSTRIES.find((i) => i.code === code)?.name ?? null;
export const provinceName = (code: string | null | undefined) => PROVINCES.find((p) => p.code === code)?.name ?? null;

// English names for the bilingual Atlas.
export const INDUSTRY_NAMES_EN: Record<string, string> = {
  TECH: 'Information technology & Software',
  MANUFACTURING: 'Manufacturing & Industry',
  RETAIL: 'Retail & Trade',
  FNB: 'Food & Beverage',
  HOSPITALITY: 'Tourism & Hospitality',
  FINANCE: 'Finance, Banking & Insurance',
  REAL_ESTATE: 'Real estate & Construction',
  EDUCATION: 'Education & Training',
  HEALTHCARE: 'Healthcare',
  LOGISTICS: 'Transport & Logistics',
  AGRICULTURE: 'Agriculture & Fisheries',
  MEDIA: 'Media, Advertising & Creative',
  CRAFT: 'Handicrafts & Craft villages',
  ENERGY: 'Energy & Environment',
  PROFESSIONAL: 'Professional services',
  OTHER: 'Other',
};
const PROVINCE_EN: Record<string, string> = { 'ha-noi': 'Hanoi', 'ho-chi-minh': 'Ho Chi Minh City', hue: 'Hue', 'da-nang': 'Da Nang', 'hai-phong': 'Hai Phong', 'can-tho': 'Can Tho' };
const unaccent = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
export const industryNameEn = (code: string | null | undefined) => (code ? (INDUSTRY_NAMES_EN[code] ?? null) : null);
export const provinceNameEn = (code: string | null | undefined) => {
  if (!code) return null;
  const vi = provinceName(code);
  return PROVINCE_EN[code] ?? (vi ? unaccent(vi) : null);
};

/** Approximate administrative centre of each provincial unit (2025), for the Atlas map. */
export const PROVINCE_COORDS: Record<string, [number, number]> = {
  'ha-noi': [21.0285, 105.8542],
  hue: [16.4637, 107.5909],
  'hai-phong': [20.8449, 106.6881],
  'da-nang': [16.0544, 108.2022],
  'ho-chi-minh': [10.7769, 106.7009],
  'can-tho': [10.0452, 105.7469],
  'lai-chau': [22.3964, 103.4582],
  'dien-bien': [21.386, 103.023],
  'son-la': [21.3256, 103.9188],
  'lang-son': [21.8537, 106.7615],
  'quang-ninh': [20.9599, 107.0425],
  'thanh-hoa': [19.8067, 105.7852],
  'nghe-an': [18.6796, 105.6813],
  'ha-tinh': [18.3428, 105.9057],
  'cao-bang': [22.6657, 106.2576],
  'tuyen-quang': [21.8233, 105.214],
  'lao-cai': [21.7229, 104.9113],
  'thai-nguyen': [21.5942, 105.8482],
  'phu-tho': [21.3227, 105.4019],
  'bac-ninh': [21.2731, 106.1946],
  'hung-yen': [20.6464, 106.0511],
  'ninh-binh': [20.2506, 105.9745],
  'quang-tri': [17.4689, 106.6223],
  'quang-ngai': [15.1214, 108.8044],
  'gia-lai': [13.782, 109.2196],
  'khanh-hoa': [12.2388, 109.1967],
  'lam-dong': [11.9404, 108.4583],
  'dak-lak': [12.6667, 108.05],
  'dong-nai': [10.9574, 106.8427],
  'tay-ninh': [10.5359, 106.4137],
  'vinh-long': [10.2537, 105.9722],
  'dong-thap': [10.36, 106.36],
  'ca-mau': [9.1769, 105.1524],
  'an-giang': [10.0125, 105.0809],
};
