import './Sidebar.css'
import { useAuth } from '../../context/AuthContext'
import { AlertTriangle, Calendar, ClipboardList, Home, LogOut, Newspaper, Shield, Users, X } from 'lucide-react'

export default function Sidebar({ isOpen, onClose, activePage, onPageChange, cityName, role }) {
  const { logout, admin } = useAuth()

  const resolvedRole = role || admin?.role
  const navItems = resolvedRole === 'superadmin'
    ? [{ id: 'admin-panel', icon: Shield, label: 'Panel Superadmin' }]
    : [
        { id: 'home', icon: Home, label: 'Accueil' },
        { id: 'news', icon: Newspaper, label: 'Actualités' },
        { id: 'events', icon: Calendar, label: 'Événements' },
        { id: 'registration', icon: ClipboardList, label: 'Inscription' },
        { id: 'reports', icon: AlertTriangle, label: 'Signalements' },
        { id: 'users', icon: Users, label: 'Utilisateurs' },
      ]

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const handleNavigation = (item) => {
    onClose()
    // Emit navigation to parent
    if (onPageChange) onPageChange(item.id)
  }

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">{(cityName || 'City Hub').toUpperCase()}</h1>
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item)}
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <span className="btn-logout-icon" aria-hidden="true"><LogOut size={18} /></span>
            Déconnexion
          </button>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  )
}
