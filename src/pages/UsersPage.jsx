import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { usersAPI } from '../services/api'
import './PageStyles.css'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      alert('Erreur lors du chargement des utilisateurs')
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
    if (!formData.username.trim()) newErrors.username = "Le nom d'utilisateur est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (editingItem) {
        await usersAPI.update(editingItem.id, formData)
      } else {
        await usersAPI.create(formData)
      }
      
      fetchUsers()
      closeModal()
      alert(editingItem ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      username: item.username || '',
      email: item.email || '',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      phoneNumber: item.phoneNumber || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      await usersAPI.delete(item.id)
      fetchUsers()
      alert('Utilisateur supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: ''
    })
    setErrors({})
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: "Nom d'utilisateur" },
    { key: 'email', label: 'Email' },
    { 
      key: 'firstName', 
      label: 'Nom complet',
      render: (firstName, row) => `${firstName || ''} ${row.lastName || ''}`.trim() || 'N/A'
    },
    { key: 'phoneNumber', label: 'Téléphone' },
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
          <h1>👥 Gestion des Utilisateurs</h1>
          <p>Gérez tous les utilisateurs de votre application</p>
        </div>
        <Button onClick={openCreateModal} icon="➕">
          Nouvel Utilisateur
        </Button>
      </div>

      <DataTable 
        columns={columns}
        data={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Modifier l'utilisateur" : 'Créer un nouvel utilisateur'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            error={errors.username}
            placeholder="Nom d'utilisateur"
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            error={errors.email}
            placeholder="email@example.com"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Prénom"
            />
            
            <Input
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Nom"
            />
          </div>
          
          <Input
            label="Téléphone"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+33 6 12 34 56 78"
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
