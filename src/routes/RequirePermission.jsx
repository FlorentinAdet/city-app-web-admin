import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canViewPage } from '../utils/adminAccess'

export default function RequirePermission({ children, pageId, fallbackPath = '/admin/home' }) {
  const { admin } = useAuth()

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  if (!pageId) {
    return children
  }

  if (!canViewPage(pageId, admin)) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
