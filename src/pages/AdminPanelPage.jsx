import { useState, useEffect } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import DataTable from '../components/common/DataTable'
import { adminAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './PageStyles.css'
import { MapPin, Plus, Shield, User } from 'lucide-react'

export default function AdminPanelPage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('cities')
  const [cities, setCities] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('city')
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
      setError('')
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
      setError('')
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
      toast.success('Ville créée avec succès')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création')
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
      toast.success('Admin créé avec succès')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création')
      console.error(err)
    }
  }

  const handleDeleteAdmin = async (admin) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver ${admin.email} ?`)) return
    try {
      await adminAPI.deleteAdmin(admin.id)
      fetchAdmins()
      toast.success('Admin désactivé avec succès')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression')
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
          <h1>
            <Shield size={22} aria-hidden="true" />
            Panneau Superadmin
          </h1>
          <p>Gérez les villes et les comptes administrateurs</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'cities' ? 'active' : ''}`}
          onClick={() => setActiveTab('cities')}
        >
          <MapPin size={16} aria-hidden="true" />
          Villes
        </button>
        <button
          className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <User size={16} aria-hidden="true" />
          Administrateurs
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {activeTab === 'cities' && (
        <div>
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <Button onClick={openCityModal} variant="primary" size="md" icon={<Plus size={16} />}>
              Créer une ville
            </Button>
          </div>
          <div className="card">
            <DataTable
              columns={cityColumns}
              data={cities}
              onEdit={() => {}}
              onDelete={() => {}}
              loading={loading}
            />
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div>
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <Button onClick={openAdminModal} variant="primary" size="md" icon={<Plus size={16} />}>
              Créer un administrateur
            </Button>
          </div>
          <div className="card">
            <DataTable
              columns={adminColumns}
              data={admins}
              onEdit={() => {}}
              onDelete={handleDeleteAdmin}
              loading={loading}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'city' ? (
            <>
              <MapPin size={18} aria-hidden="true" />
              Créer une nouvelle ville
            </>
          ) : (
            <>
              <User size={18} aria-hidden="true" />
              Créer un nouvel administrateur
            </>
          )
        }
        size="medium"
      >
        {modalType === 'city' ? (
          <form onSubmit={handleCreateCity} className="form-section">
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
                Créer la ville
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateAdmin} className="form-section">
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
              placeholder="Minimum 8 caractères"
            />
            <div className="input-group">
              <label htmlFor="city" className="input-label">
                Ville <span className="required">*</span>
              </label>
              <select
                id="city"
                value={adminForm.city_id}
                onChange={(e) => setAdminForm({ ...adminForm, city_id: e.target.value })}
                className={`input ${errors.city_id ? 'input-error' : ''}`}
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
              <label htmlFor="role" className="input-label">Rôle</label>
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
                Créer l'admin
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

