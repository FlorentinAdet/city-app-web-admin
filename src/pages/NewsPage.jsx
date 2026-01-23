import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { newsAPI } from '../services/api'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import './PageStyles.css'
import { Calendar, Newspaper, Plus, Save, Trash2 } from 'lucide-react'

export default function NewsPage() {
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')

  const initialFormData = useMemo(
    () => ({
      title: '',
      content: '',
      imageUrl: '',
      author: '',
      categoryId: ''
    }),
    []
  )

  const validateForm = (data) => {
    const newErrors = {}
    if (!data.title?.trim()) newErrors.title = 'Le titre est requis'
    if (!data.content?.trim()) newErrors.content = 'Le contenu est requis'
    if (!data.author?.trim()) newErrors.author = "L'auteur est requis"
    return newErrors
  }

  const {
    items: news,
    loading,
    isDrawerOpen,
    editingItem,
    formData,
    errors,
    openCreate,
    openEdit,
    closeDrawer,
    handleInputChange,
    handleSubmit,
    handleDelete
  } = useQuickEditEntity({
    fetchAll: newsAPI.getAll,
    createItem: newsAPI.create,
    updateItem: newsAPI.update,
    deleteItem: newsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => ({
      title: item.title || '',
      content: item.content || '',
      imageUrl: item.imageUrl || '',
      author: item.author || '',
      categoryId: item.categoryId || ''
    }),
    validate: validateForm,
    messages: {
      loadError: 'Erreur lors du chargement des news',
      saveError: 'Erreur lors de la sauvegarde',
      deleteError: 'Erreur lors de la suppression',
      createSuccess: 'News créée avec succès',
      updateSuccess: 'News modifiée avec succès',
      deleteSuccess: 'News supprimée avec succès',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette news ?'
    }
  })

  const visibleNews = useMemo(() => {
    return filterAndSort({
      items: news,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.title ?? ''} ${item?.author ?? ''} ${item?.content ?? ''}`,
      getTitle: (item) => item?.title ?? '',
      getDate: (item) => item?.createdAt || item?.created_at
    })
  }, [news, query, dateFrom, dateTo, sort])

  const formatDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <Newspaper size={22} aria-hidden="true" />
            Gestion des News
          </h1>
          <p>Gérez toutes les actualités de votre application</p>
        </div>
        <Button onClick={openCreate} icon={<Plus size={16} />}>
          Nouvelle News
        </Button>
      </div>

      <EntityListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Rechercher (titre, auteur, contenu)…"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        dateLabel="Date de création"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'date_desc', label: 'Plus récentes' },
          { value: 'date_asc', label: 'Plus anciennes' },
          { value: 'alpha_asc', label: 'Titre A → Z' },
          { value: 'alpha_desc', label: 'Titre Z → A' }
        ]}
      />

      <EntityCardGrid
        items={visibleNews}
        loading={loading}
        emptyText="Aucune news pour le moment."
        onItemClick={openEdit}
        renderTitle={(item) => item.title || 'Sans titre'}
        renderMeta={(item) => (
          <>
            <span>{item.author || '—'}</span>
            <span>
              <Calendar size={14} aria-hidden="true" />
              {formatDate(item.createdAt || item.created_at)}
            </span>
          </>
        )}
        renderBody={(item) => {
          const content = item.content || ''
          return `${content.substring(0, 120)}${content.length > 120 ? '…' : ''}`
        }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingItem ? 'Modifier rapidement' : 'Créer une news'}
        width={560}
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
            rows={10}
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
            placeholder="Optionnel"
          />

          <div className="form-actions">
            {editingItem && (
              <Button type="button" variant="danger" onClick={() => handleDelete(editingItem)} icon={<Trash2 size={16} />}>
                Supprimer
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={closeDrawer}>
              Fermer
            </Button>
            <Button type="submit" variant="success" icon={<Save size={16} />}>
              {editingItem ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
