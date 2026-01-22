import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { reportsAPI } from '../services/api'
import './PageStyles.css'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'pending',
    categoryId: '',
    userId: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await reportsAPI.getAll()
      setReports(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error)
      alert('Erreur lors du chargement des signalements')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'
    if (!formData.location.trim()) newErrors.location = 'Le lieu est requis'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (editingItem) {
        await reportsAPI.update(editingItem.id, formData)
      } else {
        await reportsAPI.create(formData)
      }
      
      fetchReports()
      closeModal()
      alert(editingItem ? 'Signalement modifié avec succès' : 'Signalement créé avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      status: item.status || 'pending',
      categoryId: item.categoryId || '',
      userId: item.userId || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) return
    
    try {
      await reportsAPI.delete(item.id)
      fetchReports()
      alert('Signalement supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      location: '',
      status: 'pending',
      categoryId: '',
      userId: ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      location: '',
      status: 'pending',
      categoryId: '',
      userId: ''
    })
    setErrors({})
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'En attente', color: '#ffc107' },
      in_progress: { text: 'En cours', color: '#17a2b8' },
      resolved: { text: 'Résolu', color: '#28a745' },
      rejected: { text: 'Rejeté', color: '#dc3545' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span style={{ 
        padding: '0.25rem 0.75rem', 
        borderRadius: '12px', 
        background: badge.color,
        color: 'white',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    )
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Titre' },
    { key: 'location', label: 'Lieu' },
    { 
      key: 'status', 
      label: 'Statut',
      render: (status) => getStatusBadge(status)
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (desc) => desc?.substring(0, 50) + '...' 
    },
    { 
      key: 'createdAt', 
      label: 'Date de création',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
    }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🚨 Gestion des Signalements</h1>
          <p>Gérez tous les signalements de votre application</p>
        </div>
        <Button onClick={openCreateModal} icon="➕">
          Nouveau Signalement
        </Button>
      </div>

      <DataTable 
        columns={columns}
        data={reports}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Modifier le signalement' : 'Créer un nouveau signalement'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Titre"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            error={errors.title}
            placeholder="Titre du signalement"
          />
          
          <Input
            label="Lieu"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            error={errors.location}
            placeholder="Lieu du signalement"
          />
          
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            error={errors.description}
            multiline
            rows={6}
            placeholder="Description détaillée du signalement"
          />
          
          <div className="input-group">
            <label htmlFor="status" className="input-label">
              Statut <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input"
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          
          <Input
            label="ID de catégorie"
            name="categoryId"
            type="number"
            value={formData.categoryId}
            onChange={handleInputChange}
            placeholder="ID de la catégorie (optionnel)"
          />
          
          <Input
            label="ID de l'utilisateur"
            name="userId"
            type="number"
            value={formData.userId}
            onChange={handleInputChange}
            placeholder="ID de l'utilisateur (optionnel)"
          />
          
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="submit" variant="success">
              {editingItem ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
