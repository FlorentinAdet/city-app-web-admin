import './Sidebar.css'
import { useAuth } from '../../context/AuthContext'
import { AlertTriangle, BarChart3, Calendar, ClipboardList, Home, Info, LogOut, Megaphone, Newspaper, Shield, Users, X } from 'lucide-react'
import { canViewPage } from '../../utils/adminAccess'
import { NavLink } from 'react-router-dom'
import { findAdminRouteById } from '../../routes/adminRouteMeta'

export default function Sidebar({ isOpen, onClose, cityName, logoUrl, role }) {
  const { logout, admin } = useAuth()

  const resolvedRole = role || admin?.role
  const rawNavItems = resolvedRole === 'superadmin'
    ? [{ id: 'admin-panel', icon: Shield, label: 'Panel Superadmin' }]
    : [
        { id: 'home', icon: Home, label: 'Accueil' },
        { id: 'city-info', icon: Info, label: 'Informations ville' },
        { id: 'annoucements', icon: Megaphone, label: 'Annonces' },
        { id: 'news', icon: Newspaper, label: 'Actualités' },
        { id: 'events', icon: Calendar, label: 'Événements' },
        { id: 'polls', icon: BarChart3, label: 'Sondages' },
        { id: 'registration', icon: ClipboardList, label: 'Inscription' },
        { id: 'reports', icon: AlertTriangle, label: 'Signalements' },
        { id: 'users', icon: Users, label: 'Utilisateurs' },
      ]

  const navItems = rawNavItems.filter((item) => canViewPage(item.id, admin))

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const handleNavigation = () => {
    onClose()
  }

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            {logoUrl && admin?.role !== 'superadmin' && (
              <img
                className="sidebar-logo"
                src={logoUrl}
                alt=""
                aria-hidden="true"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <h1 className="sidebar-title">{cityName || 'CityHub'}</h1>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const meta = findAdminRouteById(item.id)
            if (!meta) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={meta.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={handleNavigation}
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
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
