import './MainLayout.css'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { cityProfileAPI } from '../../services/api'

export default function MainLayout({ children, title, activePage, onPageChange }) {
  const { admin, city, token, updateCity } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayCityName = city?.name || admin?.cities?.name
  const displayLogoUrl = city?.logo_url || ''

  useEffect(() => {
    // Hydrate logo_url (and name if needed) from API
    if (!token || !admin || admin.role === 'superadmin') return
    let mounted = true

    cityProfileAPI.getMe()
      .then((res) => {
        if (!mounted) return
        const data = res?.data
        if (data && typeof data === 'object') updateCity?.(data)
      })
      .catch(() => {
        // non-blocking
      })

    return () => {
      mounted = false
    }
  }, [token, admin?.role, updateCity])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!title) return
    document.title = title
  }, [title])

  return (
    <div className="main-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onPageChange={onPageChange}
        cityName={displayCityName}
        logoUrl={displayLogoUrl}
        role={admin?.role}
      />
      <TopBar onMenuClick={() => setSidebarOpen((open) => !open)} city={displayCityName} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
