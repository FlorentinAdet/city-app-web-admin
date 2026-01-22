import './Navigation.css'

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'events', label: 'Événements', icon: '🎉' },
    { id: 'reports', label: 'Signalements', icon: '🚨' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' }
  ]

  return (
    <nav className="navigation">
      <div className="nav-content">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
