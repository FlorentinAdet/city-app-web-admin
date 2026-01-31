const PAGE_TO_ACCESS_KEY = {
  'city-info': 'city_info',
  annoucements: 'annoucements',
  news: 'news',
  events: 'events',
  polls: 'polls',
  registration: 'registration_forms',
  reports: 'reports'
}

const normalize = (value) => String(value || '').toLowerCase().trim()

export const getAccessLevelForPage = (pageId, admin) => {
  if (!pageId) return 'none'
  if (pageId === 'home') return 'viewer'

  if (pageId === 'admin-panel') {
    const role = normalize(admin?.role)
    return role === 'superadmin' ? 'editor' : 'none'
  }

  const role = normalize(admin?.role)
  if (role === 'superadmin' || role === 'admin') return 'editor'

  // Special case: Users management is admin-only
  if (pageId === 'users') return 'none'

  const key = PAGE_TO_ACCESS_KEY[pageId]
  if (!key) return 'viewer'

  const raw = admin?.profile?.access?.[key]
  const v = normalize(raw)
  if (v === 'editor' || v === 'editeur' || v === 'éditeur' || v === 'modifier') return 'editor'
  if (v === 'viewer' || v === 'visualisateur' || v === 'voir') return 'viewer'
  if (v === 'none' || v === 'aucun' || v === 'aucun_acces' || v === 'aucun accès') return 'none'

  // Default for unspecified permissions: none (safer)
  return 'none'
}

export const canViewPage = (pageId, admin) => {
  if (pageId === 'admin-panel') {
    const role = normalize(admin?.role)
    return role === 'superadmin'
  }
  if (pageId === 'users') {
    const role = normalize(admin?.role)
    return role === 'admin' || role === 'superadmin'
  }
  return getAccessLevelForPage(pageId, admin) !== 'none'
}

export const canEditPage = (pageId, admin) => {
  const role = normalize(admin?.role)
  if (role === 'superadmin' || role === 'admin') return true
  return getAccessLevelForPage(pageId, admin) === 'editor'
}
