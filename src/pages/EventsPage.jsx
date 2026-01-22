import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { eventsAPI } from '../services/api'
import './PageStyles.css'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    organizerId: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await eventsAPI.getAll()
      setEvents(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      alert('Erreur lors du chargement des événements')
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
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (editingItem) {
        await eventsAPI.update(editingItem.id, formData)
      } else {
        await eventsAPI.create(formData)
      }
      
      fetchEvents()
      closeModal()
      alert(editingItem ? 'Événement modifié avec succès' : 'Événement créé avec succès')
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
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      imageUrl: item.imageUrl || '',
      organizerId: item.organizerId || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return
    
    try {
      await eventsAPI.delete(item.id)
      fetchEvents()
      alert('Événement supprimé avec succès')
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
      startDate: '',
      endDate: '',
      imageUrl: '',
      organizerId: ''
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
      startDate: '',
      endDate: '',
      imageUrl: '',
      organizerId: ''
    })
    setErrors({})
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Titre' },
    { key: 'location', label: 'Lieu' },
    { 
      key: 'startDate', 
      label: 'Date de début',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (desc) => desc?.substring(0, 50) + '...' 
    }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🎉 Gestion des Événements</h1>
          <p>Gérez tous les événements de votre application</p>
        </div>
        <Button onClick={openCreateModal} icon="➕">
          Nouvel Événement
        </Button>
      </div>

      <DataTable 
        columns={columns}
        data={events}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Modifier l'événement" : 'Créer un nouvel événement'}
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
            placeholder="Titre de l'événement"
          />
          
          <Input
            label="Lieu"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            error={errors.location}
            placeholder="Lieu de l'événement"
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
            placeholder="Description de l'événement"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Date de début"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              error={errors.startDate}
            />
            
            <Input
              label="Date de fin"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </div>
          
          <Input
            label="URL de l'image"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          
          <Input
            label="ID de l'organisateur"
            name="organizerId"
            type="number"
            value={formData.organizerId}
            onChange={handleInputChange}
            placeholder="ID de l'organisateur (optionnel)"
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
