import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { reportsAPI } from '../services/api'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import './PageStyles.css'
import { AlertTriangle, MapPin, Plus, Save, Trash2 } from 'lucide-react'

export default function ReportsPage() {
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [statusFilter, setStatusFilter] = useState('')

  const initialFormData = useMemo(
    () => ({
      title: '',
      description: '',
      location: '',
      status: 'pending',
      categoryId: '',
      userId: ''
    }),
    []
  )

  const validateForm = (data) => {
    const newErrors = {}
    if (!data.title?.trim()) newErrors.title = 'Le titre est requis'
    if (!data.description?.trim()) newErrors.description = 'La description est requise'
    if (!data.location?.trim()) newErrors.location = 'Le lieu est requis'
    return newErrors
  }

  const {
    items: reports,
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
    fetchAll: reportsAPI.getAll,
    createItem: reportsAPI.create,
    updateItem: reportsAPI.update,
    deleteItem: reportsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => ({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      status: item.status || 'pending',
      categoryId: item.categoryId || '',
      userId: item.userId || ''
    }),
    validate: validateForm,
    messages: {
      loadError: 'Erreur lors du chargement des signalements',
      saveError: 'Erreur lors de la sauvegarde',
      deleteError: 'Erreur lors de la suppression',
      createSuccess: 'Signalement créé avec succès',
      updateSuccess: 'Signalement modifié avec succès',
      deleteSuccess: 'Signalement supprimé avec succès',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce signalement ?'
    }
  })

  const visibleReports = useMemo(() => {
    const base = filterAndSort({
      items: reports,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.title ?? ''} ${item?.location ?? ''} ${item?.description ?? ''}`,
      getTitle: (item) => item?.title ?? '',
      getDate: (item) => item?.createdAt || item?.created_at
    })

    if (!statusFilter) return base
    return base.filter((r) => (r?.status || '') === statusFilter)
  }, [reports, query, dateFrom, dateTo, sort, statusFilter])

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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <AlertTriangle size={22} aria-hidden="true" />
            Gestion des Signalements
          </h1>
          <p>Gérez tous les signalements de votre application</p>
        </div>
        <Button onClick={openCreate} icon={<Plus size={16} />}>
          Nouveau Signalement
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
        dateLabel="Date de création"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'date_desc', label: 'Plus récents' },
          { value: 'date_asc', label: 'Plus anciens' },
          { value: 'alpha_asc', label: 'Titre A → Z' },
          { value: 'alpha_desc', label: 'Titre Z → A' }
        ]}
      >
        <label className="entity-toolbar-label">
          Statut
          <select
            className="entity-toolbar-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut"
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="rejected">Rejeté</option>
          </select>
        </label>
      </EntityListToolbar>

      <EntityCardGrid
        items={visibleReports}
        loading={loading}
        emptyText="Aucun signalement pour le moment."
        onItemClick={openEdit}
        renderTitle={(item) => item.title || 'Sans titre'}
        renderMeta={(item) => (
          <>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {item.location || '—'}
            </span>
            {getStatusBadge(item.status)}
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
        title={editingItem ? 'Modifier rapidement' : 'Créer un signalement'}
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
