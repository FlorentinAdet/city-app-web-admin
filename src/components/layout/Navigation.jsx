import './Navigation.css'
import { AlertTriangle, Calendar, Newspaper, Users } from 'lucide-react'

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'reports', label: 'Signalements', icon: AlertTriangle },
    { id: 'users', label: 'Utilisateurs', icon: Users }
  ]

  return (
    <nav className="navigation">
      <div className="nav-content">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon" aria-hidden="true"><Icon size={16} /></span>
              <span className="nav-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
