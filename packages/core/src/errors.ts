// Error codes and Vietnamese messages: docs/spec/05-api-ghi-chu.md §3.

export const ERRORS = {
  UNAUTHENTICATED: [401, 'Vui lòng đăng nhập lại.'],
  FORBIDDEN: [403, 'Bạn không có quyền thực hiện thao tác này.'],
  ORG_LOCKED: [403, 'Doanh nghiệp này đang bị NexTure tạm khóa.'],
  INVITE_EMAIL_MISMATCH: [403, 'Lời mời này dành cho một email khác.'],
  NOT_FOUND: [404, 'Không tìm thấy nội dung.'],
  VERSION_CONFLICT: [409, 'Nội dung vừa được người khác cập nhật. Hãy tải lại trước khi lưu.'],
  INVALID_TRANSITION: [409, 'Không thể thực hiện thao tác ở trạng thái hiện tại.'],
  NOT_VERIFIED: [409, 'Chỉ nội dung đã xác minh mới được công khai.'],
  SLUG_TAKEN: [409, 'Đường dẫn này đã có doanh nghiệp khác sử dụng.'],
  SLUG_LOCKED: [409, 'Không thể đổi đường dẫn sau khi hồ sơ đã lên Atlas.'],
  LAST_ADMIN: [409, 'Tổ chức cần ít nhất một Admin.'],
  ALREADY_MEMBER: [409, 'Bạn đã là thành viên của doanh nghiệp này.'],
  MEDIA_IN_USE: [409, 'Tư liệu đang được sử dụng. Hãy gỡ khỏi các nội dung trước.'],
  VALUE_NAME_TAKEN: [409, 'Giá trị này đã tồn tại.'],
  INVITE_INVALID: [410, 'Lời mời không còn hiệu lực.'],
  VALIDATION_FAILED: [422, 'Thông tin chưa hợp lệ.'],
  REQUIRED_FOR_REVIEW: [422, 'Cần bổ sung thông tin trước khi gửi duyệt.'],
  ATLAS_PROFILE_INCOMPLETE: [422, 'Hồ sơ doanh nghiệp chưa đủ thông tin để hiển thị trên Atlas.'],
  INVALID_RELATION: [422, 'Liên kết không hợp lệ.'],
  MEDIA_NOT_READY: [422, 'Tư liệu chưa tải lên xong.'],
  MEDIA_KIND_INVALID: [422, 'Loại tư liệu không phù hợp.'],
  FILE_TYPE_NOT_ALLOWED: [422, 'Định dạng tệp không được hỗ trợ.'],
  FILE_TOO_LARGE: [422, 'Tệp vượt quá dung lượng cho phép.'],
  UPLOAD_MISMATCH: [422, 'Tải tệp chưa hoàn tất. Hãy thử lại.'],
  FEATURED_STORY_INVALID: [422, 'Chỉ chọn được câu chuyện loại "Câu chuyện doanh nghiệp".'],
  RATE_LIMITED: [429, 'Bạn thao tác quá nhanh, hãy thử lại sau.'],
  INTERNAL: [500, 'Đã có lỗi xảy ra. Vui lòng thử lại.'],
} as const satisfies Record<string, readonly [number, string]>;

export type ErrorCode = keyof typeof ERRORS;

export class AppError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    readonly details?: Record<string, unknown>,
  ) {
    const [status, message] = ERRORS[code];
    super(message);
    this.status = status;
  }

  toJSON() {
    return { error: { code: this.code, message: this.message, ...(this.details ? { details: this.details } : {}) } };
  }
}

export const fail = (code: ErrorCode, details?: Record<string, unknown>): never => {
  throw new AppError(code, details);
};
