import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import ImageUploadField from '../components/common/ImageUploadField'
import Button from '../components/common/Button'
import { newsAPI, uploadsAPI } from '../services/api'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import { useAuth } from '../context/AuthContext'
import { canEditPage } from '../utils/adminAccess'
import './PageStyles.css'
import { Calendar, Newspaper, Plus, Save, Trash2 } from 'lucide-react'

export default function NewsPage() {
  const { admin } = useAuth()
  const canEdit = canEditPage('news', admin)

  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')

  const initialFormData = useMemo(
    () => ({
      title: '',
      content: '',
      image: ''
    }),
    []
  )

  const validateForm = (data) => {
    const newErrors = {}
    if (!data.title?.trim()) newErrors.title = 'Le titre est requis'
    if (!data.content?.trim()) newErrors.content = 'Le contenu est requis'
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
      // schema.prisma: news.image
      image: item.image || ''
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
          getText: (item) => `${item?.title ?? ''} ${item?.content ?? ''}`,
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
        {canEdit ? (
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Nouvelle News
          </Button>
        ) : null}
      </div>

      <EntityListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Rechercher (titre, contenu)…"
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
        renderCover={(item) =>
          item?.image ? <img src={item.image} alt={item?.title ? `Image - ${item.title}` : 'Image actualité'} loading="lazy" /> : null
        }
        renderTitle={(item) => item.title || 'Sans titre'}
        renderMeta={(item) => (
          <>
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
        <form
          onSubmit={(e) => {
            if (!canEdit) {
              e.preventDefault()
              return
            }
            return handleSubmit(e)
          }}
        >
          <Input
            label="Titre"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            error={errors.title}
            placeholder="Titre de la news"
            disabled={!canEdit}
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
            disabled={!canEdit}
          />

          <ImageUploadField
            label="Image"
            value={formData.image}
            onChangeUrl={(url) => {
              // mimic Input onChange signature
              handleInputChange({ target: { name: 'image', value: url } })
            }}
            uploadFn={async (file) => {
              const res = await uploadsAPI.uploadImage(file, { kind: 'news' })
              return res.data
            }}
            disabled={!canEdit}
          />

          <div className="form-actions">
            {canEdit && editingItem && (
              <Button type="button" variant="danger" onClick={() => handleDelete(editingItem)} icon={<Trash2 size={16} />}>
                Supprimer
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={closeDrawer}>
              Fermer
            </Button>
            {canEdit ? (
              <Button type="submit" variant="success" icon={<Save size={16} />}>
                {editingItem ? 'Enregistrer' : 'Créer'}
              </Button>
            ) : null}
          </div>
        </form>
      </Drawer>
    </div>
  )
}
