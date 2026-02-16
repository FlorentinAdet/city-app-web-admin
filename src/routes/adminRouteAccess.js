import adminRouteMeta from './adminRouteMeta'
import { canViewPage } from '../utils/adminAccess'

const normalizeRole = (role) => String(role || '').toLowerCase().trim()

export const getFirstAccessibleAdminPath = (admin, fallbackPath = '/login') => {
  if (!admin) return fallbackPath

  const role = normalizeRole(admin.role)
  if (role === 'superadmin') {
    const superMeta = adminRouteMeta.find((route) => route.id === 'admin-panel')
    if (superMeta?.path) return superMeta.path
  }

  for (const route of adminRouteMeta) {
    if (route.id === 'admin-panel') continue
    if (canViewPage(route.id, admin)) return route.path
  }

  return fallbackPath
}
