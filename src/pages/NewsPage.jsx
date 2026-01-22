import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { newsAPI } from '../services/api'
import './PageStyles.css'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    author: '',
    categoryId: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await newsAPI.getAll()
      setNews(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des news:', error)
      alert('Erreur lors du chargement des news')
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
    if (!formData.content.trim()) newErrors.content = 'Le contenu est requis'
    if (!formData.author.trim()) newErrors.author = "L'auteur est requis"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (editingItem) {
        await newsAPI.update(editingItem.id, formData)
      } else {
        await newsAPI.create(formData)
      }
      
      fetchNews()
      closeModal()
      alert(editingItem ? 'News modifiée avec succès' : 'News créée avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      content: item.content || '',
      imageUrl: item.imageUrl || '',
      author: item.author || '',
      categoryId: item.categoryId || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette news ?')) return
    
    try {
      await newsAPI.delete(item.id)
      fetchNews()
      alert('News supprimée avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      author: '',
      categoryId: ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      author: '',
      categoryId: ''
    })
    setErrors({})
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Titre' },
    { key: 'author', label: 'Auteur' },
    { 
      key: 'content', 
      label: 'Contenu',
      render: (content) => content?.substring(0, 50) + '...' 
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
          <h1>📰 Gestion des News</h1>
          <p>Gérez toutes les actualités de votre application</p>
        </div>
        <Button onClick={openCreateModal} icon="➕">
          Nouvelle News
        </Button>
      </div>

      <DataTable 
        columns={columns}
        data={news}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Modifier la news' : 'Créer une nouvelle news'}
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
            placeholder="Titre de la news"
          />
          
          <Input
            label="Auteur"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
            error={errors.author}
            placeholder="Nom de l'auteur"
          />
          
          <Input
            label="Contenu"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            error={errors.content}
            multiline
            rows={6}
            placeholder="Contenu de la news"
          />
          
          <Input
            label="URL de l'image"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          
          <Input
            label="ID de catégorie"
            name="categoryId"
            type="number"
            value={formData.categoryId}
            onChange={handleInputChange}
            placeholder="ID de la catégorie (optionnel)"
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
