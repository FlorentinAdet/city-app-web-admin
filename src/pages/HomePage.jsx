import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import './HomePage.css'
import { Calendar, FileText, Home, Info, Newspaper, Shield, Users } from 'lucide-react'

export default function HomePage({ onNavigate }) {
  const { admin, city } = useAuth()
  const [userCount, setUserCount] = useState(null)
  const [loading, setLoading] = useState(true)

  const cityName = useMemo(() => {
    return city?.name || admin?.cities?.name || ''
  }, [admin, city])

  useEffect(() => {
    let isMounted = true

    const fetchCount = async () => {
      setLoading(true)
      try {
        const res = await usersAPI.getAll()
        const count = Array.isArray(res.data) ? res.data.length : 0
        if (isMounted) setUserCount(count)
      } catch {
        if (isMounted) setUserCount(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCount()
    return () => {
      isMounted = false
    }
  }, [])

  const quickLinks = [
    { id: 'city-info', label: 'Infos ville', icon: Info },
    { id: 'news', label: 'Actualités', icon: Newspaper },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'reports', label: 'Signalements', icon: FileText },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ]

  return (
    <div className="home">
      <div className="page-header">
        <div>
          <h1>
            <Home size={22} aria-hidden="true" />
            Accueil
          </h1>
          <p>Vue d’ensemble et accès rapide aux modules.</p>
        </div>
      </div>

      <div className="home-grid">
        <section className="card home-card">
          <div className="home-card-header">
            <h2 className="home-card-title">Ville</h2>
          </div>
          <div className="home-metric">
            <div className="home-metric-label">Nom</div>
            <div className="home-metric-value">{cityName || '—'}</div>
          </div>
          <div className="home-metric">
            <div className="home-metric-label">Utilisateurs liés</div>
            <div className="home-metric-value">
              {loading ? 'Chargement…' : (userCount ?? '—')}
            </div>
          </div>
        </section>

        <section className="card home-card">
          <div className="home-card-header">
            <h2 className="home-card-title">Accès rapide</h2>
          </div>

          <div className="quick-grid">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.id}
                  type="button"
                  className="quick-card"
                  onClick={() => onNavigate?.(link.id)}
                >
                  <span className="quick-icon" aria-hidden="true"><Icon size={18} /></span>
                  <span className="quick-label">{link.label}</span>
                </button>
              )
            })}

            {admin?.role === 'superadmin' && (
              <button
                type="button"
                className="quick-card"
                onClick={() => onNavigate?.('admin-panel')}
              >
                <span className="quick-icon" aria-hidden="true"><Shield size={18} /></span>
                <span className="quick-label">Superadmin</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
