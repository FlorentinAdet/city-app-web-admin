import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import ImageUploadField from '../components/common/ImageUploadField'
import Button from '../components/common/Button'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import { announcementsAPI, uploadsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useConfirmDialog } from '../context/ConfirmDialogContext'
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

export default function AnnouncementsPage() {
  const { admin, city } = useAuth()
  const { confirm } = useConfirmDialog()
  const canEdit = canEditPage('announcements', admin)

  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')

  const initialFormData = useMemo(
    () => ({
      title: '',
      content: '',
      image: '',
      status: 'Brouillon',
      start_at: '',
      end_at: '',
      original_status: ''
    }),
    []
  )

  const validate = (data) => {
    const errs = {}
    if (!data.title?.trim()) errs.title = 'Le titre est requis'
    return errs
  }

  const {
    items: announcements,
    loading,
    refresh,
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
    fetchAll: announcementsAPI.getAll,
    createItem: (data) => {
      const payload = { ...data, cityId: city?.id }
      payload.start_at = payload.start_at ? new Date(payload.start_at).toISOString() : null
      payload.end_at = payload.end_at ? new Date(payload.end_at).toISOString() : null
      return announcementsAPI.create(payload)
    },
    updateItem: (id, data) => {
      const payload = { ...data }
      payload.start_at = payload.start_at ? new Date(payload.start_at).toISOString() : null
      payload.end_at = payload.end_at ? new Date(payload.end_at).toISOString() : null
      return announcementsAPI.update(id, payload)
    },
    deleteItem: announcementsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => ({
      title: item?.title || '',
      content: item?.content || '',
      image: item?.image_url || '',
      status: item?.status || 'Brouillon',
      start_at: item?.start_at ? new Date(item.start_at).toISOString().slice(0, 16) : '',
      end_at: item?.end_at ? new Date(item.end_at).toISOString().slice(0, 16) : '',
      original_status: item?.status || 'Brouillon'
    }),
    prepareSubmit: async ({ formData }) => {
      const isPublishing = formData?.status === 'Publi_' && formData?.original_status !== 'Publi_'
      let shouldNotify = false

      if (isPublishing) {
        shouldNotify = await confirm({
          title: 'Notifier les habitants ?',
          message: 'Voulez-vous notifier les habitants ?',
          confirmText: 'Notifier',
          cancelText: 'Ne pas notifier',
          confirmVariant: 'success',
          cancelVariant: 'secondary'
        })
      }

      const { original_status, ...payload } = formData || {}
      return { data: { ...payload, notify: shouldNotify } }
    },
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
      items: announcements,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.title ?? ''} ${item?.content ?? ''}`,
      getTitle: (item) => item?.title ?? '',
      getDate: (item) => item?.created_at || item?.createdAt
    })
  }, [announcements, query, dateFrom, dateTo, sort])

  const handleQuickPublish = async (item) => {
    if (!item?.id || !canEdit) return
    if (item?.status === 'Publi_') return

    const shouldNotify = await confirm({
      title: 'Notifier les habitants ?',
      message: 'Voulez-vous notifier les habitants ?',
      confirmText: 'Notifier',
      cancelText: 'Ne pas notifier',
      confirmVariant: 'success',
      cancelVariant: 'secondary'
    })

    try {
      await announcementsAPI.update(item.id, { status: 'Publi_', notify: shouldNotify })
      await refresh()
    } catch (error) {
      console.error('Erreur lors de la publication rapide:', error)
    }
  }

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
            {canEdit && item?.status !== 'Publi_' ? (
              <Button type="button" variant="success" onClick={() => handleQuickPublish(item)}>
                Publier
              </Button>
            ) : null}
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
          />

          <Input
            label="Contenu"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            multiline
            rows={4}
          />

          <ImageUploadField
            label="Image"
            value={formData.image}
            onChange={async (value) => {
              if (typeof value === 'string') {
                handleInputChange({ target: { name: 'image', value } })
                return
              }

              const file = value
              if (!file) return
              try {
                const res = await uploadsAPI.uploadImage(file, { kind: 'announcements' })
                const url = res?.data?.data?.url || res?.data?.url
                if (url) handleInputChange({ target: { name: 'image', value: url } })
              } catch (err) {
                console.error('Erreur upload image:', err)
              }
            }}
          />

          <div className="form-row">
            <Input
              type="datetime-local"
              label="Début"
              name="start_at"
              value={formData.start_at}
              onChange={handleInputChange}
            />
            <Input
              type="datetime-local"
              label="Fin"
              name="end_at"
              value={formData.end_at}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Statut"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            select
            options={[
              { value: 'Brouillon', label: 'Brouillon' },
              { value: 'Publi_', label: 'Publié' },
              { value: 'Ferm_', label: 'Fermé' }
            ]}
          />

          <div className="drawer-actions">
            <Button type="button" variant="secondary" onClick={closeDrawer}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" icon={<Save size={16} />}>
              {editingItem ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
