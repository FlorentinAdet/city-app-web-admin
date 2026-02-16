import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireRole({ children, allowedRoles, fallbackPath = '/admin/home' }) {
  const { admin } = useAuth()

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return children
  }

  const role = String(admin.role || '').toLowerCase()
  const ok = allowedRoles.map((item) => String(item).toLowerCase()).includes(role)
  if (!ok) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
