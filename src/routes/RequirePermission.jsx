import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canViewPage } from '../utils/adminAccess'
import { getFirstAccessibleAdminPath } from './adminRouteAccess'

export default function RequirePermission({ children, pageId, fallbackPath }) {
  const { admin } = useAuth()

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  if (!pageId) {
    return children
  }

  if (!canViewPage(pageId, admin)) {
    const target = fallbackPath || getFirstAccessibleAdminPath(admin, '/login')
    return <Navigate to={target} replace />
  }

  return children
}
