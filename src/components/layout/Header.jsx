import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1>🏙️ City App Admin</h1>
          <p>Panneau d'administration</p>
        </div>
        <div className="header-user">
          <span className="user-badge">👤 Administrateur</span>
        </div>
      </div>
    </header>
  )
}
