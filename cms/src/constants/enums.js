/**
 * Enums đồng bộ với schema Prisma (UPPERCASE).
 * Dùng cho form, filter, hiển thị.
 */

export const FarmStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
}
export const FarmStatusLabels = {
  PENDING: 'Chờ duyệt',
  ACTIVE: 'Hoạt động',
  SUSPENDED: 'Tạm dừng',
  CLOSED: 'Đã đóng',
}

export const PlotStatus = {
  ACTIVE: 'ACTIVE',
  FALLOW: 'FALLOW',
  HARVESTED: 'HARVESTED',
  CLOSED: 'CLOSED',
}
export const PlotStatusLabels = {
  ACTIVE: 'Đang canh tác',
  FALLOW: 'Bỏ hoang',
  HARVESTED: 'Đã thu hoạch',
  CLOSED: 'Đã đóng',
}

export const SeasonStatus = {
  PLANNED: 'PLANNED',
  PLANTED: 'PLANTED',
  GROWING: 'GROWING',
  HARVESTING: 'HARVESTING',
  HARVESTED: 'HARVESTED',
  COMPLETED: 'COMPLETED',
}
export const SeasonStatusLabels = {
  PLANNED: 'Dự kiến',
  PLANTED: 'Đã gieo trồng',
  GROWING: 'Đang phát triển',
  HARVESTING: 'Đang thu hoạch',
  HARVESTED: 'Đã thu hoạch',
  COMPLETED: 'Hoàn thành',
}

export const TaskType = {
  WATERING: 'WATERING',
  FERTILIZING: 'FERTILIZING',
  SPRAYING: 'SPRAYING',
  PRUNING: 'PRUNING',
  HARVESTING: 'HARVESTING',
  WEEDING: 'WEEDING',
  PLANTING: 'PLANTING',
  MONITORING: 'MONITORING',
  OTHER: 'OTHER',
}
export const TaskTypeLabels = {
  WATERING: 'Tưới nước',
  FERTILIZING: 'Bón phân',
  SPRAYING: 'Phun thuốc',
  PRUNING: 'Tỉa cành',
  HARVESTING: 'Thu hoạch',
  WEEDING: 'Nhổ cỏ',
  PLANTING: 'Gieo trồng',
  MONITORING: 'Giám sát',
  OTHER: 'Khác',
}

export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}
export const TaskStatusLabels = {
  PENDING: 'Chờ thực hiện',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

export const RegionType = {
  PROVINCE: 'PROVINCE',
  DISTRICT: 'DISTRICT',
  COMMUNE: 'COMMUNE',
}
export const RegionTypeLabels = {
  PROVINCE: 'Tỉnh/TP',
  DISTRICT: 'Huyện/Quận',
  COMMUNE: 'Xã/Phường',
}

export const UserRole = {
  FARMER: 'FARMER',
  INVESTOR: 'INVESTOR',
  ADMIN: 'ADMIN',
  DISTRIBUTOR: 'DISTRIBUTOR',
  PROCESSOR: 'PROCESSOR',
}
export const UserRoleLabels = {
  FARMER: 'Nông dân',
  INVESTOR: 'Nhà đầu tư',
  ADMIN: 'Quản trị viên',
  DISTRIBUTOR: 'Phân phối',
  PROCESSOR: 'Chế biến',
}

/** Helper: lấy label hoặc trả về value. Normalise key lowercase cho tương thích cũ. */
export function labelFor(obj, value) {
  if (value == null) return '-'
  const v = typeof value === 'string' ? value : String(value)
  return obj[v] ?? obj[v.toLowerCase()] ?? v
}
