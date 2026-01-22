import { useState, useEffect } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import DataTable from '../components/common/DataTable'
import { adminAPI } from '../services/api'
import './PageStyles.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('cities')
  const [cities, setCities] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('city') // 'city' or 'admin'
  const [error, setError] = useState('')
  const [token] = useState(() => localStorage.getItem('admin_token'))

  const [cityForm, setCityForm] = useState({ name: '', slug: '' })
  const [adminForm, setAdminForm] = useState({ email: '', password: '', city_id: '', role: 'admin' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (activeTab === 'cities') fetchCities()
    else fetchAdmins()
  }, [activeTab])

  const fetchCities = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getCities()
      setCities(res.data)
    } catch (err) {
      setError('Erreur lors du chargement des villes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAdmins()
      setAdmins(res.data)
    } catch (err) {
      setError('Erreur lors du chargement des admins')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const validateCityForm = () => {
    const newErrors = {}
    if (!cityForm.name.trim()) newErrors.name = 'Le nom est requis'
    if (!cityForm.slug.trim()) newErrors.slug = 'Le slug est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAdminForm = () => {
    const newErrors = {}
    if (!adminForm.email.trim()) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(adminForm.email)) newErrors.email = "L'email n'est pas valide"
    if (!adminForm.password.trim()) newErrors.password = 'Le mot de passe est requis'
    if (adminForm.password.length < 8) newErrors.password = 'Le mot de passe doit faire au moins 8 caractères'
    if (!adminForm.city_id) newErrors.city_id = 'La ville est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateCity = async (e) => {
    e.preventDefault()
    if (!validateCityForm()) return

    try {
      const res = await adminAPI.createCity(cityForm)
      setCities([...cities, res.data])
      setCityForm({ name: '', slug: '' })
      setIsModalOpen(false)
      setError('')
      alert('Ville créée avec succès')
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la création')
      console.error(err)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    if (!validateAdminForm()) return

    try {
      const res = await adminAPI.createAdmin(adminForm)
      fetchAdmins()
      setAdminForm({ email: '', password: '', city_id: '', role: 'admin' })
      setIsModalOpen(false)
      setError('')
      alert('Admin créé avec succès')
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la création')
      console.error(err)
    }
  }

  const handleDeleteAdmin = async (admin) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver ${admin.email} ?`)) return
    try {
      await adminAPI.deleteAdmin(admin.id)
      fetchAdmins()
      alert('Admin désactivé avec succès')
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression')
      console.error(err)
    }
  }

  const openCityModal = () => {
    setModalType('city')
    setCityForm({ name: '', slug: '' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openAdminModal = () => {
    setModalType('admin')
    setAdminForm({ email: '', password: '', city_id: '', role: 'admin' })
    setErrors({})
    setIsModalOpen(true)
  }

  const cityColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'slug', label: 'Slug' },
    { key: 'created_at', label: 'Créée le', render: (date) => new Date(date).toLocaleDateString('fr-FR') }
  ]

  const adminColumns = [
    { key: 'id', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { 
      key: 'cities', 
      label: 'Ville',
      render: (cities) => cities?.name || 'N/A'
    },
    { key: 'status', label: 'Statut' },
    { 
      key: 'last_login_at', 
      label: 'Dernière connexion',
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Jamais'
    }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🔑 Panneau Superadmin</h1>
          <p>Gérez les villes et les comptes administrateurs</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('cities')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'cities' ? '#667eea' : '#f0f0f0',
            color: activeTab === 'cities' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          🏙️ Villes
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'admins' ? '#667eea' : '#f0f0f0',
            color: activeTab === 'admins' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          👤 Administrateurs
        </button>
      </div>

      {error && <div style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</div>}

      {activeTab === 'cities' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Button onClick={openCityModal} variant="primary" icon="➕">
              Nouvelle Ville
            </Button>
          </div>
          <DataTable
            columns={cityColumns}
            data={cities}
            onEdit={() => {}}
            onDelete={() => {}}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'admins' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Button onClick={openAdminModal} variant="primary" icon="➕">
              Nouvel Admin
            </Button>
          </div>
          <DataTable
            columns={adminColumns}
            data={admins}
            onEdit={() => {}}
            onDelete={handleDeleteAdmin}
            loading={loading}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'city' ? 'Créer une nouvelle ville' : 'Créer un nouvel administrateur'}
      >
        {modalType === 'city' ? (
          <form onSubmit={handleCreateCity}>
            <Input
              label="Nom de la ville"
              name="name"
              value={cityForm.name}
              onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
              required
              error={errors.name}
              placeholder="ex: Paris, Lyon"
            />
            <Input
              label="Slug"
              name="slug"
              value={cityForm.slug}
              onChange={(e) => setCityForm({ ...cityForm, slug: e.target.value })}
              required
              error={errors.slug}
              placeholder="ex: paris, lyon"
            />
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="success">
                Créer
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateAdmin}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              required
              error={errors.email}
              placeholder="admin@ville.com"
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              required
              error={errors.password}
              placeholder="••••••••"
            />
            <div className="input-group">
              <label htmlFor="city" className="input-label">
                Ville <span className="required">*</span>
              </label>
              <select
                id="city"
                value={adminForm.city_id}
                onChange={(e) => setAdminForm({ ...adminForm, city_id: e.target.value })}
                className="input"
              >
                <option value="">Sélectionner une ville</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city_id && <span className="error-message">{errors.city_id}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="role" className="input-label">
                Rôle
              </label>
              <select
                id="role"
                value={adminForm.role}
                onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                className="input"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="success">
                Créer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
