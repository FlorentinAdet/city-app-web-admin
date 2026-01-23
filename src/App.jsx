import { useCallback, useEffect, useState } from 'react'
import './styles/DesignSystem.css'
import './App.css'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import NewsPage from './pages/NewsPage'
import EventsPage from './pages/EventsPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'
import AdminPanelPage from './pages/AdminPanelPage'
import { useAuth } from './context/AuthContext'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const { token, admin } = useAuth()

  const handlePageChange = useCallback((pageId) => {
    setCurrentPage(pageId)
  }, [])

  useEffect(() => {
    // Backwards-compat for any legacy callers; Sidebar now uses props.
    if (typeof window === 'undefined') return

    window.onPageChange = handlePageChange
    return () => {
      if (window.onPageChange === handlePageChange) {
        delete window.onPageChange
      }
    }
  }, [handlePageChange])

  // Show login if not authenticated
  if (!token || !admin) {
    return <LoginPage />
  }

  // Show admin panel if user is superadmin
  if (admin.role === 'superadmin') {
    return (
      <MainLayout title="Panel Superadmin" activePage="admin-panel" onPageChange={handlePageChange}>
        <AdminPanelPage />
      </MainLayout>
    )
  }

  // Regular admin dashboard
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handlePageChange} />
      case 'news':
        return <NewsPage />
      case 'events':
        return <EventsPage />
      case 'reports':
        return <ReportsPage />
      case 'users':
        return <UsersPage />
      default:
        return <HomePage onNavigate={handlePageChange} />
    }
  }

  return (
    <MainLayout title="Tableau de bord" activePage={currentPage} onPageChange={handlePageChange}>
      {renderPage()}
    </MainLayout>
  )
}

export default App
