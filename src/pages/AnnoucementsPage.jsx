import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import ImageUploadField from '../components/common/ImageUploadField'
import Button from '../components/common/Button'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import { annoucementsAPI, uploadsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { canEditPage } from '../utils/adminAccess'
import './PageStyles.css'
import { Megaphone, Plus, Save, Trash2 } from 'lucide-react'

const statusLabel = (value) => {
  if (value === 'Publi_') return 'Publié'
  if (value === 'Ferm_') return 'Fermé'
  return 'Brouillon'
}

const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR')
}

export default function AnnoucementsPage() {
  const { admin } = useAuth()
  const canEdit = canEditPage('annoucements', admin)

  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')

  const initialFormData = useMemo(
    () => ({
      title: '',
      content: '',
      image_url: '',
      status: 'Brouillon',
      start_at: '',
      end_at: ''
    }),
    []
  )

  const validate = (data) => {
    const errs = {}
    if (!data.title?.trim()) errs.title = 'Le titre est requis'
    return errs
  }

  const {
    items: annoucements,
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
    fetchAll: annoucementsAPI.getAll,
    createItem: (data) => {
      const payload = { ...data }
      payload.start_at = payload.start_at ? new Date(payload.start_at).toISOString() : null
      payload.end_at = payload.end_at ? new Date(payload.end_at).toISOString() : null
      return annoucementsAPI.create(payload)
    },
    updateItem: (id, data) => {
      const payload = { ...data }
      payload.start_at = payload.start_at ? new Date(payload.start_at).toISOString() : null
      payload.end_at = payload.end_at ? new Date(payload.end_at).toISOString() : null
      return annoucementsAPI.update(id, payload)
    },
    deleteItem: annoucementsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => ({
      title: item?.title || '',
      content: item?.content || '',
      image_url: item?.image_url || '',
      status: item?.status || 'Brouillon',
      start_at: item?.start_at ? new Date(item.start_at).toISOString().slice(0, 16) : '',
      end_at: item?.end_at ? new Date(item.end_at).toISOString().slice(0, 16) : ''
    }),
    validate,
    messages: {
      loadError: 'Erreur lors du chargement des annonces',
      saveError: (err) => err?.response?.data?.error || 'Erreur lors de la sauvegarde',
      deleteError: (err) => err?.response?.data?.error || 'Erreur lors de la suppression',
      createSuccess: 'Annonce créée',
      updateSuccess: 'Annonce mise à jour',
      deleteSuccess: 'Annonce supprimée',
      confirmDelete: 'Supprimer cette annonce ?'
    }
  })

  const visible = useMemo(() => {
    return filterAndSort({
      items: annoucements,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.title ?? ''} ${item?.content ?? ''}`,
      getTitle: (item) => item?.title ?? '',
      getDate: (item) => item?.created_at || item?.createdAt
    })
  }, [annoucements, query, dateFrom, dateTo, sort])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <Megaphone size={22} aria-hidden="true" />
            Annonces
          </h1>
          <p>Créez et gérez les annonces de votre ville.</p>
        </div>
        {canEdit ? (
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Nouvelle annonce
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
          { value: 'date_desc', label: 'Plus récents' },
          { value: 'date_asc', label: 'Plus anciens' },
          { value: 'alpha_asc', label: 'Titre A → Z' },
          { value: 'alpha_desc', label: 'Titre Z → A' }
        ]}
      />

      <EntityCardGrid
        items={visible}
        loading={loading}
        emptyText="Aucune annonce pour le moment."
        onItemClick={openEdit}
        renderCover={(item) =>
          item?.image_url ? (
            <img src={item.image_url} alt={item?.title ? `Image - ${item.title}` : 'Image annonce'} loading="lazy" />
          ) : null
        }
        renderTitle={(item) => item?.title || 'Sans titre'}
        renderMeta={(item) => (
          <>
            <span>Statut: {statusLabel(item?.status)}</span>
            <span>Créée: {formatDate(item?.created_at || item?.createdAt)}</span>
          </>
        )}
        renderBody={(item) => {
          const content = String(item?.content || '').trim()
          const short = content ? `${content.slice(0, 120)}${content.length > 120 ? '…' : ''}` : '—'
          const windowTxt = `${item?.start_at ? `Début: ${formatDate(item.start_at)}` : 'Début: —'} • ${item?.end_at ? `Fin: ${formatDate(item.end_at)}` : 'Fin: —'}`
          return `${windowTxt}\n${short}`
        }}
        renderActions={(item) => (
          <>
            <Button type="button" variant="secondary" onClick={() => openEdit(item)}>
              Ouvrir
            </Button>
            {canEdit ? (
              <Button type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(item)}>
                Supprimer
              </Button>
            ) : null}
          </>
        )}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingItem ? 'Modifier rapidement' : 'Créer une annonce'}
        width={620}
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
            placeholder="Ex: Travaux rue principale"
            disabled={!canEdit}
          />

          <Input
            label="Contenu"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            multiline
            rows={8}
            placeholder="Détails de l'annonce..."
            disabled={!canEdit}
          />

          <ImageUploadField
            label="Image"
            value={formData.image_url}
            onChangeUrl={(url) => handleInputChange({ target: { name: 'image_url', value: url } })}
            uploadFn={async (file) => {
              const res = await uploadsAPI.uploadImage(file, { kind: 'annoucements' })
              return res.data
            }}
            disabled={!canEdit}
          />

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select className="form-input" name="status" value={formData.status} onChange={handleInputChange} disabled={!canEdit}>
                <option value="Brouillon">Brouillon</option>
                <option value="Publi_">Publié</option>
                <option value="Ferm_">Fermé</option>
              </select>
            </div>
            <Input
              label="Début (optionnel)"
              name="start_at"
              type="datetime-local"
              value={formData.start_at}
              onChange={handleInputChange}
              disabled={!canEdit}
            />
            <Input
              label="Fin (optionnel)"
              name="end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={handleInputChange}
              disabled={!canEdit}
            />
          </div>

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
