import './TopBar.css'
import { useAuth } from '../../context/AuthContext'
import { Crown, MapPin, Menu, User } from 'lucide-react'

export default function TopBar({ onMenuClick, city }) {
  const { admin } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <Menu size={20} aria-hidden="true" />
        </button>
        {city && (
          <h2 className="topbar-title">
            <MapPin size={18} aria-hidden="true" />
            {city}
          </h2>
        )}
      </div>

      <div className="topbar-right">
        <div className="user-info">
          <span className="user-email">{admin?.email}</span>
          <div className="user-badge">
            {admin?.role === 'superadmin' ? (
              <Crown size={18} aria-hidden="true" />
            ) : (
              <User size={18} aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
