/**
 * Cấu hình đồng bộ với API/CMS.
 * Có thể override bằng env: VITE_API_URL, VITE_CMS_URL.
 */
export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4201'
export const cmsUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:4202'
