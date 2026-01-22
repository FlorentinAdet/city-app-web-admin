import { useState } from 'react'
import './App.css'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import NewsPage from './pages/NewsPage'
import EventsPage from './pages/EventsPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'
import AdminPanelPage from './pages/AdminPanelPage'
import { useAuth } from './context/AuthContext'

function App() {
  const [activeTab, setActiveTab] = useState('news')
  const { token, admin } = useAuth()

  const renderPage = () => {
    switch (activeTab) {
      case 'news':
        return <NewsPage />
      case 'events':
        return <EventsPage />
      case 'reports':
        return <ReportsPage />
      case 'users':
        return <UsersPage />
      default:
        return <NewsPage />
    }
  }

  // Show login if not authenticated
  if (!token || !admin) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <LoginPage />
        </main>
      </div>
    )
  }

  // Show admin panel if user is superadmin
  if (admin.role === 'superadmin') {
    return <AdminPanelPage />
  }

  return (
    <div className="app">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
