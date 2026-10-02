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
