import './MainLayout.css'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'

export default function MainLayout({ children, title, activePage, onPageChange }) {
  const { admin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        cityName={admin?.cities?.name}
        role={admin?.role}
      />
      <TopBar onMenuClick={() => setSidebarOpen((open) => !open)} city={admin?.cities?.name} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
