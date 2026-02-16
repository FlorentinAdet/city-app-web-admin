import { Routes, Route, Navigate } from 'react-router-dom'
import './styles/DesignSystem.css'
import './App.css'
import LoginPage from './pages/LoginPage'
import PublicRegistrationFormPage from './pages/PublicRegistrationFormPage'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmDialogProvider } from './context/ConfirmDialogContext'
import { AdminLayout, RequireAuth, RequirePermission, RequireRole, adminRoutes } from './routes'
import { findAdminRouteById } from './routes/adminRouteMeta'

function AppProviders({ children }) {
  return (
    <ToastProvider>
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
    </ToastProvider>
  )
}

function AdminIndexRedirect() {
  const { admin } = useAuth()
  const targetId = admin?.role === 'superadmin' ? 'admin-panel' : 'home'
  const meta = findAdminRouteById(targetId)
  return <Navigate to={meta?.path || '/admin/home'} replace />
}

function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/:citySlug/:formSlug" element={<PublicRegistrationFormPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminIndexRedirect />} />
          {adminRoutes.map((route) => {
            const wrapped = route.id === 'admin-panel'
              ? (
                <RequireRole allowedRoles={['superadmin']}>
                  {route.element}
                </RequireRole>
              )
              : (
                <RequirePermission pageId={route.id}>
                  {route.element}
                </RequirePermission>
              )

            return (
              <Route key={route.id} path={route.path} element={wrapped} />
            )
          })}
          <Route path="*" element={<Navigate to="/admin/home" replace />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AppProviders>
  )
}

export default App
