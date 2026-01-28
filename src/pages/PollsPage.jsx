import { useMemo, useState } from 'react'
import { pollsAPI } from '../services/api'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import './PageStyles.css'
import { BarChart3, Plus, Save, Trash2 } from 'lucide-react'

export default function PollsPage() {
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')

  const makeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return `opt_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }

  const normalizeOptions = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.choices)) return raw.choices
    return []
  }

  const initialFormData = useMemo(
    () => ({
      title: '',
      description: '',
      type: 'single_choice',
      status: 'Brouillon',
      starts_at: '',
      end_at: '',
      options: [
        { id: makeId(), label: '' },
        { id: makeId(), label: '' }
      ]
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const validateForm = (data) => {
    const newErrors = {}
    if (!data.title?.trim()) newErrors.title = 'Le titre est requis'

    const choices = normalizeOptions(data.options)
      .map((c) => ({ ...c, label: String(c?.label ?? c?.text ?? '').trim() }))
      .filter((c) => c.label)

    if (choices.length < 2) {
      newErrors.options = 'Ajoutez au moins 2 choix.'
    } else {
      const labels = choices.map((c) => c.label.toLowerCase())
      const unique = new Set(labels)
      if (unique.size !== labels.length) {
        newErrors.options = 'Les choix doivent être uniques.'
      }
    }

    return newErrors
  }

  const statusLabel = (value) => {
    if (value === 'Publi_') return 'Publié'
    if (value === 'Ferm_') return 'Fermé'
    return 'Brouillon'
  }

  const {
    items: polls,
    loading,
    isDrawerOpen,
    editingItem,
    formData,
    errors,
    setFormData,
    openCreate,
    openEdit,
    closeDrawer,
    handleInputChange,
    handleSubmit,
    handleDelete
  } = useQuickEditEntity({
    fetchAll: pollsAPI.getAll,
    createItem: pollsAPI.create,
    updateItem: pollsAPI.update,
    deleteItem: pollsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => {
      const raw = normalizeOptions(item?.options)
      const options = (raw.length ? raw : [{}, {}]).map((opt, idx) => ({
        id: String(opt?.id || opt?.key || makeId()),
        label: String(opt?.label ?? opt?.text ?? '').trim() || ''
      }))
      return {
        title: item.title || '',
        description: item.description || '',
        type: item.type || 'single_choice',
        status: item.status || 'Brouillon',
        starts_at: item.starts_at ? new Date(item.starts_at).toISOString().slice(0, 16) : '',
        end_at: item.end_at ? new Date(item.end_at).toISOString().slice(0, 16) : '',
        options: options.length >= 2 ? options : [
          { id: makeId(), label: options[0]?.label || '' },
          { id: makeId(), label: '' }
        ]
      }
    },
    validate: validateForm,
    messages: {
      loadError: 'Erreur lors du chargement des sondages',
      saveError: (err) => err?.response?.data?.error || 'Erreur lors de la sauvegarde',
      deleteError: (err) => err?.response?.data?.error || 'Erreur lors de la suppression',
      createSuccess: 'Sondage créé avec succès',
      updateSuccess: 'Sondage mis à jour',
      deleteSuccess: 'Sondage supprimé',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce sondage ?'
    }
  })

  const visiblePolls = useMemo(() => {
    return filterAndSort({
      items: polls,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.title ?? ''} ${item?.description ?? ''}`,
      getTitle: (item) => item?.title ?? '',
      getDate: (item) => item?.created_at || item?.createdAt
    })
  }, [polls, query, dateFrom, dateTo, sort])

  const formatDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR')
  }

  const updateOptionLabel = (id, label) => {
    setFormData((prev) => ({
      ...prev,
      options: normalizeOptions(prev.options).map((opt) => (opt.id === id ? { ...opt, label } : opt))
    }))
  }

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...normalizeOptions(prev.options), { id: makeId(), label: '' }]
    }))
  }

  const removeOption = (id) => {
    setFormData((prev) => {
      const next = normalizeOptions(prev.options).filter((opt) => opt.id !== id)
      return { ...prev, options: next.length >= 2 ? next : next.concat([{ id: makeId(), label: '' }]) }
    })
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'description', label: 'Description' },
    {
      key: 'options',
      label: 'Choix',
      render: (options) => {
        const count = normalizeOptions(options).filter((o) => String(o?.label ?? o?.text ?? '').trim()).length
        return count ? `${count}` : '—'
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => type === 'single_choice' ? 'Choix unique' : 'Choix multiple'
    },
    {
      key: 'status',
      label: 'Statut',
      render: (status) => (
        <span className={`badge badge-${status === 'Publi_' ? 'success' : status === 'Ferm_' ? 'danger' : 'secondary'}`}>
          {statusLabel(status)}
        </span>
      )
    },
    {
      key: 'starts_at',
      label: 'Début',
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '—'
    },
    {
      key: 'end_at',
      label: 'Fin',
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '—'
    }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <BarChart3 size={22} aria-hidden="true" />
            Sondages
          </h1>
          <p>Créez et gérez les sondages de votre ville.</p>
        </div>
        <Button onClick={openCreate} variant="primary" icon={<Plus size={16} />}>
          Nouveau sondage
        </Button>
      </div>

      <EntityListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Rechercher (titre, description)…"
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
        items={visiblePolls}
        loading={loading}
        emptyText="Aucun sondage pour le moment."
        onItemClick={openEdit}
        renderTitle={(item) => item?.title || 'Sans titre'}
        renderMeta={(item) => {
          const choicesCount = normalizeOptions(item?.options)
            .filter((o) => String(o?.label ?? o?.text ?? '').trim()).length
          return (
            <>
              <span>Statut: {statusLabel(item?.status)}</span>
              <span>Choix: {choicesCount || '—'}</span>
            </>
          )
        }}
        renderBody={(item) => {
          const desc = String(item?.description || '').trim()
          const descShort = desc ? `${desc.slice(0, 90)}${desc.length > 90 ? '…' : ''}` : '—'
          const type = item?.type === 'multiple_choice' ? 'Choix multiple' : 'Choix unique'
          const created = formatDate(item?.created_at || item?.createdAt)
          return `${type} • Créé: ${created} • ${descShort}`
        }}
        renderActions={(item) => (
          <>
            <Button type="button" variant="secondary" onClick={() => openEdit(item)}>
              Ouvrir
            </Button>
            <Button type="button" variant="danger" onClick={() => handleDelete(item)} icon={<Trash2 size={16} />}>
              Supprimer
            </Button>
          </>
        )}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingItem ? 'Modifier rapidement' : 'Créer un sondage'}
        width={620}
      >
        <form onSubmit={(e) => {
          // Ensure we send the exact JSON structure we want: array of {id,label}.
          // Strip empty lines.
          const choices = normalizeOptions(formData.options)
            .map((c) => ({ id: c.id, label: String(c?.label ?? '').trim() }))
            .filter((c) => c.label)
          setFormData((prev) => ({ ...prev, options: choices }))
          return handleSubmit(e)
        }}>
          <Input
            label="Titre"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
            placeholder="Quel est votre projet préféré pour 2026 ?"
          />

          <Input
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Donnez plus de détails sur ce sondage..."
          />

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-input"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="single_choice">Choix unique</option>
                <option value="multiple_choice">Choix multiple</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <select
                className="form-input"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Brouillon">Brouillon</option>
                <option value="Publi_">Publié</option>
                <option value="Ferm_">Fermé</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <Input
              label="Date de début"
              name="starts_at"
              type="datetime-local"
              value={formData.starts_at}
              onChange={handleInputChange}
            />

            <Input
              label="Date de fin"
              name="end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-section" style={{ padding: 20 }}>
            <div className="form-section-title" style={{ marginBottom: 12 }}>Choix du sondage</div>
            {normalizeOptions(formData.options).map((opt, idx) => (
              <div key={opt.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label={`Choix ${idx + 1}`}
                    value={opt.label}
                    onChange={(e) => updateOptionLabel(opt.id, e.target.value)}
                    placeholder="Ex: Rénover la place centrale"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeOption(opt.id)}
                  disabled={normalizeOptions(formData.options).length <= 2}
                >
                  Retirer
                </Button>
              </div>
            ))}

            {errors.options && <div className="page-error">{errors.options}</div>}

            <Button type="button" variant="secondary" icon={<Plus size={16} />} onClick={addOption}>
              Ajouter un choix
            </Button>
          </div>

          <div className="form-actions">
            {editingItem && (
              <Button type="button" variant="danger" onClick={() => handleDelete(editingItem)} icon={<Trash2 size={16} />}>
                Supprimer
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={closeDrawer}>
              Annuler
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
