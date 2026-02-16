const ADMIN_ROUTE_META = [
  { id: 'home', path: '/admin/home', title: 'Tableau de bord' },
  { id: 'city-info', path: '/admin/city-info', title: 'City info' },
  { id: 'announcements', path: '/admin/announcements', title: 'Annonces' },
  { id: 'news', path: '/admin/news', title: 'News' },
  { id: 'events', path: '/admin/events', title: 'Events' },
  { id: 'polls', path: '/admin/polls', title: 'Polls' },
  { id: 'registration', path: '/admin/registration-forms', title: 'Registration forms' },
  { id: 'reports', path: '/admin/reports', title: 'Reports' },
  { id: 'users', path: '/admin/users', title: 'Users' },
  { id: 'admin-panel', path: '/admin/panel', title: 'Admin panel' }
]

const normalizePath = (pathname) => {
  if (!pathname) return ''
  return String(pathname).toLowerCase().replace(/\/+$/, '')
}

export const findAdminRouteByPath = (pathname) => {
  const normalized = normalizePath(pathname)
  return ADMIN_ROUTE_META.find((route) => normalizePath(route.path) === normalized)
}

export const findAdminRouteById = (id) => {
  if (!id) return null
  return ADMIN_ROUTE_META.find((route) => route.id === id)
}

export const resolveAdminRouteId = (pathname) => {
  const normalized = normalizePath(pathname)
  const match = ADMIN_ROUTE_META.find((route) => normalized.startsWith(normalizePath(route.path)))
  return match?.id || 'home'
}

export default ADMIN_ROUTE_META
