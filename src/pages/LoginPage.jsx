import { useState } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './PageStyles.css'
import { Lock } from 'lucide-react'

export default function LoginPage({ onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login(email, password)
      const { access_token, admin, city } = res.data
      login(access_token, admin, city)
      if (onSuccess) onSuccess(city)
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion échouée')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <div className="page-header">
        <div>
          <h1>
            <Lock size={22} aria-hidden="true" />
            Connexion Administrateur
          </h1>
          <p>Accédez au panneau de votre ville</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="email@example.com"
        />

        <Input
          label="Mot de passe"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </div>
      </form>
    </div>
  )
}
