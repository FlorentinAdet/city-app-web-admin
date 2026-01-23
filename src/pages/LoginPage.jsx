import { useState } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './LoginPage.css'
import { Lock } from 'lucide-react'

export default function LoginPage({ onSuccess }) {
  const { login } = useAuth()
  const toast = useToast()
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
      toast.success('Connexion réussie')
      if (onSuccess) onSuccess(city)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Connexion échouée'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-cover">
          <div className="login-brand">
            <div className="login-badge" aria-hidden="true">
              <Lock size={18} />
            </div>
            <div>
              <h1 className="login-title">Connexion Administrateur</h1>
              <p className="login-subtitle">Accédez au panneau de votre ville</p>
            </div>
          </div>
        </div>

        <div className="login-body">
          <form className="login-form" onSubmit={handleSubmit}>
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

        {error && <div className="login-error">{error}</div>}

        <div className="login-actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </div>
          </form>
        </div>
      </div>
    </div>
  )
}
