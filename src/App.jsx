import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [apiStatus, setApiStatus] = useState('En attente...')
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testApiConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await axios.get(`${apiUrl}/cities`)
      console.log(apiUrl)
      setCities(response.data)
      setApiStatus('✅ Connexion réussie')
    } catch (err) {
      setApiStatus('❌ Échec de la connexion')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApiConnection()
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>🏙️ City App - Test de connexion API</h1>
      </header>

      <main className="main">
        <div className="status-card">
          <h2>Statut de l'API</h2>
          <p className="status">{apiStatus}</p>
          {error && <p className="error">Erreur: {error}</p>}
          <button 
            onClick={testApiConnection} 
            disabled={loading}
            className="test-button"
          >
            {loading ? 'Test en cours...' : 'Retester la connexion'}
          </button>
        </div>

        {cities.length > 0 && (
          <div className="cities-card">
            <h2>Villes récupérées ({cities.length})</h2>
            <div className="cities-list">
              {cities.map((city) => (
                <div key={city.id} className="city-item">
                  <h3>{city.name}</h3>
                  {city.population && <p>Population: {city.population.toLocaleString()}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
        <p>Web App URL: http://localhost:5173</p>
      </footer>
    </div>
  )
}

export default App
