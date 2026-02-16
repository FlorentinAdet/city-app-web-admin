import { Outlet, useLocation } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import { findAdminRouteById, resolveAdminRouteId } from './adminRouteMeta'

export default function AdminLayout() {
  const location = useLocation()

  const activePage = resolveAdminRouteId(location.pathname)
  const activeMeta = findAdminRouteById(activePage)
  const title = activeMeta?.title || 'Admin'

  return (
    <MainLayout title={title}>
      <Outlet />
    </MainLayout>
  )
}
