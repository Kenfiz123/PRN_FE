export const vi = Object.freeze({
  common: {
    all: 'Tất cả',
    cancel: 'Hủy',
    close: 'Đóng',
    confirm: 'Xác nhận',
    create: 'Tạo',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    loading: 'Đang tải...',
    processing: 'Đang xử lý...',
    refresh: 'Làm mới',
    save: 'Lưu',
    search: 'Tìm kiếm',
    submit: 'Gửi',
    update: 'Cập nhật',
    view: 'Xem',
    previous: 'Trước',
    next: 'Tiếp',
    page: 'Trang',
    noData: 'Chưa có dữ liệu.',
    notUpdated: 'Chưa cập nhật',
    notAvailable: 'Không khả dụng',
    unknown: 'Không xác định',
  },
  roles: {
    ADMIN: 'Quản trị viên',
    SYSTEM_ADMIN: 'Quản trị hệ thống',
    STUDENT_AFFAIRS_ADMIN: 'Quản trị công tác sinh viên',
    CLUB_MANAGER: 'Chủ nhiệm câu lạc bộ',
    TREASURER: 'Thủ quỹ',
    CLUB_MEMBER: 'Thành viên câu lạc bộ',
  },
  categories: {
    SPORTS: 'Thể thao',
    ARTS: 'Nghệ thuật',
    ACADEMIC: 'Học thuật',
    VOLUNTEER: 'Tình nguyện',
    TECHNOLOGY: 'Công nghệ',
    OTHER: 'Khác',
  },
  genders: {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
  },
  clubStatuses: {
    PENDING: 'Chờ xét duyệt',
    SUBMITTED: 'Đã gửi',
    NEEDSREVISION: 'Cần chỉnh sửa',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  },
  reportStatuses: {
    DRAFT: 'Bản nháp',
    AWAITINGFINANCE: 'Chờ thủ quỹ',
    SUBMITTED: 'Đã nộp',
    UNDERREVIEW: 'Đang xét duyệt',
    TREASURERAPPROVED: 'Thủ quỹ đã duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Cần chỉnh sửa',
  },
  activityStatuses: {
    PLANNED: 'Đã lên kế hoạch',
    SCHEDULED: 'Đã lên lịch',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
  },
  attendanceStatuses: {
    NOTMARKED: 'Chưa đánh dấu',
    PRESENT: 'Có mặt',
    ABSENT: 'Vắng mặt',
    EXCUSED: 'Có phép',
    LATE: 'Đến muộn',
  },
  financeStatuses: {
    SUBMITTED: 'Chờ chủ nhiệm duyệt',
    MANAGERAPPROVED: 'Chờ duyệt cuối',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    SETTLED: 'Đã quyết toán',
  },
  reportTypes: {
    QUARTERLY: 'Báo cáo quý',
    MONTHLY: 'Báo cáo tháng',
    SEMESTER: 'Báo cáo học kỳ',
    ANNUAL: 'Báo cáo năm',
    AD_HOC: 'Báo cáo đột xuất',
    FUTURE_EVENT: 'Báo cáo sự kiện sắp tới',
  },
  errors: {
    network: 'Không thể kết nối đến hệ thống. Vui lòng thử lại.',
    unauthorized: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    credentials: 'Email/tên đăng nhập hoặc mật khẩu không đúng.',
    forbidden: 'Bạn không có quyền thực hiện thao tác này.',
    notFound: 'Không tìm thấy dữ liệu được yêu cầu.',
    conflict: 'Tên đăng nhập hoặc email đã tồn tại.',
    validation: 'Thông tin gửi lên chưa hợp lệ.',
    rateLimited: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
    server: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  },
})

function normalize(value) {
  return String(value || '').trim().toUpperCase().replace(/[\s_-]+/g, '')
}

export function formatRole(role) {
  return vi.roles[role] || role || 'Khách'
}

export function formatCategory(category) {
  return vi.categories[category] || category || vi.categories.OTHER
}

export function formatClubStatus(status) {
  const key = normalize(status)
  return vi.clubStatuses[key] || status || vi.common.unknown
}

export function formatReportStatus(status) {
  const key = normalize(status)
  return vi.reportStatuses[key] || status || vi.common.unknown
}

export function formatActivityStatus(status) {
  const key = normalize(status)
  return vi.activityStatuses[key] || status || vi.common.unknown
}

export function formatAttendanceStatus(status) {
  const key = normalize(status)
  return vi.attendanceStatuses[key] || status || vi.common.unknown
}

export function formatFinanceStatus(status) {
  const key = normalize(status)
  return vi.financeStatuses[key] || status || vi.common.unknown
}

export function formatReportType(type) {
  return vi.reportTypes[type] || type || vi.common.unknown
}

export function formatDate(value, { time = false, fallback = '-' } = {}) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return fallback
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    ...(time ? { timeStyle: 'short' } : {}),
  }).format(date)
}

export function formatDateTime(value, fallback = '-') {
  return formatDate(value, { time: true, fallback })
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function formatErrorMessage(error, fallback = vi.errors.server) {
  const raw = typeof error === 'string' ? error : error?.message
  if (!raw) return fallback
  const message = String(raw).trim()
  const lower = message.toLowerCase()

  if (lower.includes('failed to fetch') || lower.includes('network error')) return vi.errors.network
  if (lower.includes('invalid credential') || lower.includes('email/username') || lower.includes('password is incorrect')) return vi.errors.credentials
  if (lower.includes('unauthorized') || lower.includes('token expired') || lower.includes('phiên đăng nhập')) return vi.errors.unauthorized
  if (lower.includes('forbidden') || lower.includes('permission')) return vi.errors.forbidden
  if (lower.includes('not found') || lower.includes('resource was not found')) return vi.errors.notFound
  if (lower.includes('already exists') || lower.includes('duplicate')) return vi.errors.conflict
  if (lower.includes('too many') || lower.includes('rate limit')) return vi.errors.rateLimited
  if (/^request failed \(\d+\)/i.test(message)) return fallback
  if (/^preview response/i.test(message)) return 'Không thể tải bản xem trước tài liệu.'
  if (/^\d{3}$/.test(message)) return fallback

  return message
}

export function translateStatus(value, fallback = vi.common.unknown) {
  const normalized = normalize(value)
  return vi.reportStatuses[normalized]
    || vi.clubStatuses[normalized]
    || vi.activityStatuses[normalized]
    || vi.attendanceStatuses[normalized]
    || vi.financeStatuses[normalized]
    || value
    || fallback
}
