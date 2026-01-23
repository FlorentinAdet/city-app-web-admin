import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import ImageUploadField from '../components/common/ImageUploadField'
import Button from '../components/common/Button'
import { eventsAPI, uploadsAPI } from '../services/api'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import './PageStyles.css'
import { Calendar, MapPin, Plus, Save, Trash2 } from 'lucide-react'

export default function EventsPage() {
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_asc')

  const initialFormData = useMemo(
    () => ({
      title: '',
      description: '',
      lieu: '',
      start_date: '',
      end_date: '',
      image: ''
    }),
    []
  )

  const validateForm = (data) => {
    const newErrors = {}
    if (!data.title?.trim()) newErrors.title = 'Le titre est requis'
    if (!data.description?.trim()) newErrors.description = 'La description est requise'
    if (!data.start_date) newErrors.start_date = 'La date de début est requise'
    return newErrors
  }

  const {
    items: events,
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
    fetchAll: eventsAPI.getAll,
    createItem: eventsAPI.create,
    updateItem: eventsAPI.update,
    deleteItem: eventsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => ({
      title: item.title || '',
      description: item.description || '',
      // schema.prisma: events.lieu / events.image / events.start_date / events.end_date
      lieu: item.lieu || item.location || '',
      start_date: (item.start_date || item.startDate || '') ? String(item.start_date || item.startDate).split('T')[0] : '',
      end_date: (item.end_date || item.endDate || '') ? String(item.end_date || item.endDate).split('T')[0] : '',
      image: item.image || item.imageUrl || ''
    }),
    validate: validateForm,
    messages: {
      loadError: 'Erreur lors du chargement des événements',
      saveError: 'Erreur lors de la sauvegarde',
      deleteError: 'Erreur lors de la suppression',
      createSuccess: 'Événement créé avec succès',
      updateSuccess: 'Événement modifié avec succès',
      deleteSuccess: 'Événement supprimé avec succès',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet événement ?'
    }
  })

  const visibleEvents = useMemo(() => {
    return filterAndSort({
      items: events,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.title ?? ''} ${item?.lieu ?? item?.location ?? ''} ${item?.description ?? ''}`,
      getTitle: (item) => item?.title ?? '',
      getDate: (item) => item?.start_date || item?.startDate || item?.createdAt || item?.created_at
    })
  }, [events, query, dateFrom, dateTo, sort])

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
            <Calendar size={22} aria-hidden="true" />
            Gestion des Événements
          </h1>
          <p>Gérez tous les événements de votre application</p>
        </div>
        <Button onClick={openCreate} icon={<Plus size={16} />}>
          Nouvel Événement
        </Button>
      </div>

      <EntityListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Rechercher (titre, lieu, description)…"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        dateLabel="Date (début)"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'date_asc', label: 'Date (début) croissante' },
          { value: 'date_desc', label: 'Date (début) décroissante' },
          { value: 'alpha_asc', label: 'Titre A → Z' },
          { value: 'alpha_desc', label: 'Titre Z → A' }
        ]}
      />

      <EntityCardGrid
        items={visibleEvents}
        loading={loading}
        emptyText="Aucun événement pour le moment."
        onItemClick={openEdit}
        renderCover={(item) =>
          item?.image ? <img src={item.image} alt={item?.title ? `Image - ${item.title}` : "Image événement"} loading="lazy" /> : null
        }
        renderTitle={(item) => item.title || 'Sans titre'}
        renderMeta={(item) => (
          <>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {item.lieu || item.location || '—'}
            </span>
            <span>
              <Calendar size={14} aria-hidden="true" />
              {formatDate(item.start_date || item.startDate)}
            </span>
          </>
        )}
        renderBody={(item) => {
          const description = item.description || ''
          return `${description.substring(0, 120)}${description.length > 120 ? '…' : ''}`
        }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingItem ? "Modifier rapidement" : 'Créer un événement'}
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
            placeholder="Titre de l'événement"
          />
          
          <Input
            label="Lieu"
            name="lieu"
            value={formData.lieu}
            onChange={handleInputChange}
            error={errors.lieu}
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
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              error={errors.start_date}
            />
            
            <Input
              label="Date de fin"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
          </div>

          <ImageUploadField
            label="Image"
            value={formData.image}
            onChangeUrl={(url) => {
              handleInputChange({ target: { name: 'image', value: url } })
            }}
            uploadFn={async (file) => {
              const res = await uploadsAPI.uploadImage(file)
              return res.data
            }}
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
