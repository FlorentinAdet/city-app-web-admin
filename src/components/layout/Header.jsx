import './Header.css'
import { Shield, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1>
            <Shield size={18} aria-hidden="true" />
            City App Admin
          </h1>
          <p>Panneau d'administration</p>
        </div>
        <div className="header-user">
          <span className="user-badge"><User size={16} aria-hidden="true" /> Administrateur</span>
        </div>
      </div>
    </header>
  )
}
