import { useCallback, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './styles/DesignSystem.css'
import './App.css'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import NewsPage from './pages/NewsPage'
import EventsPage from './pages/EventsPage'
import RegistrationFormsPage from './pages/RegistrationFormsPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'
import AdminPanelPage from './pages/AdminPanelPage'
import CityInfoPage from './pages/CityInfoPage'
import PollsPage from './pages/PollsPage'
import AnnoucementsPage from './pages/AnnoucementsPage'
import PublicRegistrationFormPage from './pages/PublicRegistrationFormPage'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmDialogProvider } from './context/ConfirmDialogContext'

function AppProviders({ children }) {
  return (
    <ToastProvider>
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
    </ToastProvider>
  )
}

function AdminApp() {
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
      case 'registration':
        return <RegistrationFormsPage />
      case 'reports':
        return <ReportsPage />
      case 'users':
        return <UsersPage />
      case 'city-info':
        return <CityInfoPage />
      case 'annoucements':
        return <AnnoucementsPage />
      case 'polls':
        return <PollsPage />
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

function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/:citySlug/:formSlug" element={<PublicRegistrationFormPage />} />
        <Route path="/*" element={<AdminApp />} />
      </Routes>
    </AppProviders>
  )
}

export default App
