import { useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import { registrationFormsAPI, registrationFormTemplatesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './PageStyles.css'
import './RegistrationFormsPage.css'
import {
  ClipboardList,
  LayoutTemplate,
  Plus,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

const DEFAULT_DEFINITION = { version: 1, fields: [] }

const slugify = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const ensureDefinition = (definition) => {
  if (definition && typeof definition === 'object' && !Array.isArray(definition)) {
    const fields = Array.isArray(definition.fields) ? definition.fields : []
    return { version: 1, ...definition, fields }
  }
  return { ...DEFAULT_DEFINITION }
}

const typeLabel = (type) => {
  switch (type) {
    case 'text':
      return 'Texte'
    case 'textarea':
      return 'Paragraphe'
    case 'number':
      return 'Nombre'
    case 'select':
      return 'Liste'
    case 'checkbox':
      return 'Case à cocher'
    case 'date':
      return 'Date'
    default:
      return type || 'Champ'
  }
}

export default function RegistrationFormsPage() {
  const { city, admin } = useAuth()

  const [activeTab, setActiveTab] = useState('forms') // forms | templates
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const [previewEnabled, setPreviewEnabled] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  const initialFormData = useMemo(
    () => ({
      titre: '',
      description: '',
      status: 'draft',
      starts_at: '',
      is_public: false,
      public_slug: '',
      capacity_mode: 'SUBMISSIONS',
      capacity_max: '',
      definition: { ...DEFAULT_DEFINITION }
    }),
    []
  )

  const initialTemplateData = useMemo(
    () => ({
      titre: '',
      description: '',
      scope: 'city', // city | global
      definition: { ...DEFAULT_DEFINITION }
    }),
    []
  )

  const validateForm = (data) => {
    const newErrors = {}
    if (!data.titre?.trim()) newErrors.titre = 'Le titre est requis'

    if (String(data?.status || '').toLowerCase() === 'template') {
      newErrors.status = 'Les templates se créent dans l’onglet Templates (table dédiée)'
    }

    if (data?.is_public && !String(data?.public_slug || '').trim()) {
      newErrors.public_slug = 'Le slug est requis pour rendre le formulaire public'
    }

    const def = ensureDefinition(data.definition)
    const ids = new Set()
    for (const f of def.fields) {
      const id = String(f?.id || '').trim()
      if (!id) {
        newErrors.definition = 'Chaque champ doit avoir un identifiant (id)'
        break
      }
      if (ids.has(id)) {
        newErrors.definition = `Identifiant dupliqué: ${id}`
        break
      }
      ids.add(id)
    }

    return newErrors
  }

  const mapItemToFormData = (item) => {
    const startsAt = item?.starts_at ? String(item.starts_at).split('T')[0] : ''
    const capMax = item?.capacity_max === null || item?.capacity_max === undefined ? '' : String(item.capacity_max)
    return {
      titre: item?.titre || '',
      description: item?.description || '',
      status: item?.status || 'draft',
      starts_at: startsAt,
      is_public: !!item?.is_public,
      public_slug: item?.public_slug || '',
      capacity_mode: (item?.capacity_mode || 'SUBMISSIONS').toUpperCase(),
      capacity_max: capMax,
      definition: ensureDefinition(item?.definition)
    }
  }

  const mapTemplateToFormData = (item) => {
    return {
      titre: item?.titre || '',
      description: item?.description || '',
      scope: item?.city_id ? 'city' : 'global',
      definition: ensureDefinition(item?.definition)
    }
  }

  const {
    items: forms,
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
    fetchAll: registrationFormsAPI.getAll,
    createItem: (data) => {
      const payload = { ...data }
      payload.definition = ensureDefinition(payload.definition)
      payload.capacity_mode = String(payload.capacity_mode || 'SUBMISSIONS').toUpperCase()
      payload.capacity_max = payload.capacity_max === '' || payload.capacity_max === null ? null : Number(payload.capacity_max)
      payload.starts_at = payload.starts_at ? new Date(payload.starts_at).toISOString() : null

      // Guard: templates belong to registration_form_templates, not registration_forms
      if (String(payload.status || '').toLowerCase() === 'template') {
        payload.status = 'draft'
      }

      payload.public_slug = String(payload.public_slug || '').trim() || slugify(payload.titre)
      return registrationFormsAPI.create(payload)
    },
    updateItem: (id, data) => {
      const payload = { ...data }
      payload.definition = ensureDefinition(payload.definition)
      payload.capacity_mode = String(payload.capacity_mode || 'SUBMISSIONS').toUpperCase()
      payload.capacity_max = payload.capacity_max === '' || payload.capacity_max === null ? null : Number(payload.capacity_max)
      payload.starts_at = payload.starts_at ? new Date(payload.starts_at).toISOString() : null

      // Guard: templates belong to registration_form_templates, not registration_forms
      if (String(payload.status || '').toLowerCase() === 'template') {
        payload.status = 'draft'
      }

      payload.public_slug = String(payload.public_slug || '').trim() || slugify(payload.titre)
      return registrationFormsAPI.update(id, payload)
    },
    deleteItem: registrationFormsAPI.delete,
    initialFormData,
    mapItemToFormData,
    validate: validateForm,
    messages: {
      loadError: 'Erreur lors du chargement des formulaires',
      saveError: 'Erreur lors de la sauvegarde',
      deleteError: 'Erreur lors de la suppression',
      createSuccess: 'Formulaire créé',
      updateSuccess: 'Formulaire modifié',
      deleteSuccess: 'Formulaire archivé',
      confirmDelete: 'Archiver ce formulaire ? (il ne sera plus public)'
    }
  })

  const [drawerKind, setDrawerKind] = useState('form') // form | template

  const {
    items: templates,
    loading: templatesLoading,
    isDrawerOpen: isTemplateDrawerOpen,
    editingItem: editingTemplate,
    formData: templateData,
    errors: templateErrors,
    setFormData: setTemplateData,
    openCreate: openTemplateCreate,
    openEdit: openTemplateEdit,
    closeDrawer: closeTemplateDrawer,
    handleInputChange: handleTemplateInputChange,
    handleSubmit: handleTemplateSubmit,
    handleDelete: handleTemplateDelete
  } = useQuickEditEntity({
    fetchAll: registrationFormTemplatesAPI.getAll,
    createItem: (data) => {
      const payload = {
        titre: data?.titre,
        description: data?.description,
        definition: ensureDefinition(data?.definition)
      }

      if (admin?.role === 'superadmin') {
        payload.scope = data?.scope === 'global' ? 'global' : 'city'
        if (payload.scope === 'city' && city?.id) payload.city_id = city.id
      }

      return registrationFormTemplatesAPI.create(payload)
    },
    updateItem: (id, data) => {
      const payload = {
        titre: data?.titre,
        description: data?.description,
        definition: ensureDefinition(data?.definition)
      }

      if (admin?.role === 'superadmin') {
        payload.scope = data?.scope === 'global' ? 'global' : 'city'
        if (payload.scope === 'city' && city?.id) payload.city_id = city.id
      }

      return registrationFormTemplatesAPI.update(id, payload)
    },
    deleteItem: registrationFormTemplatesAPI.delete,
    initialFormData: initialTemplateData,
    mapItemToFormData: mapTemplateToFormData,
    validate: (data) => {
      const errs = {}
      if (!data.titre?.trim()) errs.titre = 'Le titre est requis'
      const def = ensureDefinition(data.definition)
      const ids = new Set()
      for (const f of def.fields) {
        const id = String(f?.id || '').trim()
        if (!id) {
          errs.definition = 'Chaque champ doit avoir un identifiant (id)'
          break
        }
        if (ids.has(id)) {
          errs.definition = `Identifiant dupliqué: ${id}`
          break
        }
        ids.add(id)
      }
      return errs
    },
    messages: {
      loadError: 'Erreur lors du chargement des templates',
      saveError: 'Erreur lors de la sauvegarde du template',
      deleteError: 'Erreur lors de la suppression du template',
      createSuccess: 'Template créé',
      updateSuccess: 'Template modifié',
      deleteSuccess: 'Template supprimé',
      confirmDelete: 'Supprimer ce template ?'
    }
  })

  const registrations = forms

  const baseItems = activeTab === 'templates' ? templates : registrations

  const ensureUniqueSlug = (base, ignoreId) => {
    const normalizedBase = slugify(base)
    if (!normalizedBase) return ''
    const used = new Set(
      registrations
        .filter((it) => (ignoreId ? it?.id !== ignoreId : true))
        .map((it) => String(it?.public_slug || '').trim())
        .filter(Boolean)
    )
    if (!used.has(normalizedBase)) return normalizedBase
    let n = 2
    while (used.has(`${normalizedBase}-${n}`)) n++
    return `${normalizedBase}-${n}`
  }

  const visibleForms = useMemo(() => {
    return filterAndSort({
      items: baseItems,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => `${item?.titre ?? ''} ${item?.description ?? ''} ${item?.public_slug ?? ''} ${item?.status ?? ''}`,
      getTitle: (item) => item?.titre ?? '',
      getDate: (item) => item?.createdAt || item?.created_at
    })
  }, [baseItems, query, dateFrom, dateTo, sort])

  const formatCapacity = (item) => {
    const used = item?.capacity_used ?? 0
    const max = item?.capacity_max
    if (max === null || max === undefined) return `${used} / ∞`
    return `${used} / ${max}`
  }

  const openCreateForm = () => {
    setDrawerKind('form')
    openCreate()
    setFormData((prev) => ({
      ...prev,
      status: 'draft',
      is_public: false,
      public_slug: ensureUniqueSlug(slugify(prev.titre), null)
    }))
    setSelectedFieldId(null)
    setPreviewEnabled(true)
  }

  const openCreateTemplate = () => {
    setDrawerKind('template')
    openTemplateCreate()
    setTemplateData((prev) => ({
      ...prev,
      scope: admin?.role === 'superadmin' ? (prev.scope || 'city') : 'city'
    }))
    setSelectedFieldId(null)
    setPreviewEnabled(true)
  }

  const openCreateFromTemplate = (template) => {
    setDrawerKind('form')
    openCreate()
    setFormData((prev) => ({
      ...prev,
      status: 'draft',
      is_public: false,
      public_slug: '',
      definition: ensureDefinition(template?.definition)
    }))
    setSelectedFieldId(null)
    setPreviewEnabled(true)
  }

  const openEditWithBuilder = (item) => {
    setDrawerKind('form')
    openEdit(item)
    setSelectedFieldId(null)
    setPreviewEnabled(true)
  }

  const openEditTemplateWithBuilder = (item) => {
    setDrawerKind('template')
    openTemplateEdit(item)
    setSelectedFieldId(null)
    setPreviewEnabled(true)
  }

  const activeIsTemplate = drawerKind === 'template'
  const activeDrawerOpen = activeIsTemplate ? isTemplateDrawerOpen : isDrawerOpen
  const activeEditingItem = activeIsTemplate ? editingTemplate : editingItem
  const activeFormData = activeIsTemplate ? templateData : formData
  const activeErrors = activeIsTemplate ? templateErrors : errors
  const activeSetFormData = activeIsTemplate ? setTemplateData : setFormData
  const activeHandleInputChange = activeIsTemplate ? handleTemplateInputChange : handleInputChange
  const activeHandleSubmit = activeIsTemplate ? handleTemplateSubmit : handleSubmit
  const activeHandleDelete = activeIsTemplate ? handleTemplateDelete : handleDelete
  const activeCloseDrawer = activeIsTemplate ? closeTemplateDrawer : closeDrawer

  const definition = ensureDefinition(activeFormData.definition)
  const fields = definition.fields
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null

  const setDefinition = (updater) => {
    activeSetFormData((prev) => {
      const nextDef = updater(ensureDefinition(prev.definition))
      return { ...prev, definition: nextDef }
    })
  }

  const addField = (type) => {
    setDefinition((def) => {
      const next = { ...def, fields: [...def.fields] }
      const baseId = slugify(`champ-${def.fields.length + 1}`) || `field-${def.fields.length + 1}`
      let id = baseId
      let n = 2
      const ids = new Set(next.fields.map((f) => f.id))
      while (ids.has(id)) {
        id = `${baseId}-${n++}`
      }
      next.fields.push({
        id,
        type,
        label: 'Nouveau champ',
        required: false,
        placeholder: '',
        options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
        visibleWhen: null
      })
      setSelectedFieldId(id)
      return next
    })
  }

  const updateField = (fieldId, patch) => {
    setDefinition((def) => {
      const nextFields = def.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f))
      return { ...def, fields: nextFields }
    })
  }

  const moveField = (fieldId, direction) => {
    setDefinition((def) => {
      const idx = def.fields.findIndex((f) => f.id === fieldId)
      if (idx < 0) return def
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= def.fields.length) return def
      const next = [...def.fields]
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return { ...def, fields: next }
    })
  }

  const duplicateField = (field) => {
    setDefinition((def) => {
      const ids = new Set(def.fields.map((f) => f.id))
      const baseId = `${field.id}-copy`
      let id = baseId
      let n = 2
      while (ids.has(id)) {
        id = `${baseId}-${n++}`
      }
      const copy = { ...field, id, label: `${field.label || 'Champ'} (copie)` }
      const idx = def.fields.findIndex((f) => f.id === field.id)
      const next = [...def.fields]
      next.splice(idx + 1, 0, copy)
      setSelectedFieldId(id)
      return { ...def, fields: next }
    })
  }

  const deleteField = (fieldId) => {
    setDefinition((def) => {
      const next = def.fields.filter((f) => f.id !== fieldId)
      const selectedStillExists = next.some((f) => f.id === selectedFieldId)
      if (!selectedStillExists) setSelectedFieldId(next[0]?.id || null)
      // also remove conditions pointing to deleted field
      const cleaned = next.map((f) => {
        if (!f.visibleWhen) return f
        return f.visibleWhen?.fieldId === fieldId ? { ...f, visibleWhen: null } : f
      })
      return { ...def, fields: cleaned }
    })
  }

  const evaluateVisible = (field, answers) => {
    const rule = field?.visibleWhen
    if (!rule || !rule.fieldId) return true
    const left = answers?.[rule.fieldId]
    const right = rule.value
    return String(left ?? '') === String(right ?? '')
  }

  const previewAnswers = useMemo(() => {
    // Basic default answers for preview: empty string / false
    const out = {}
    for (const f of fields) {
      if (f.type === 'checkbox') out[f.id] = false
      else out[f.id] = ''
    }
    return out
  }, [fields])

  const citySlug = String(city?.slug || '').trim()
  const isTemplate = activeIsTemplate
  const publicLink = useMemo(() => {
    if (!citySlug || !activeFormData.public_slug) return ''
    const base = window?.location?.origin || ''
    return `${base}/${encodeURIComponent(citySlug)}/${encodeURIComponent(String(activeFormData.public_slug).trim())}`
  }, [citySlug, activeFormData.public_slug])

  const setPublicSlugFromTitle = () => {
    const nextSlug = ensureUniqueSlug(activeFormData.titre, editingItem?.id)
    setFormData((prev) => ({ ...prev, public_slug: nextSlug }))
  }

  const copyText = async (text) => {
    try {
      if (!text) return
      await navigator.clipboard.writeText(text)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <ClipboardList size={22} aria-hidden="true" />
            Inscription
          </h1>
          <p>Créez des formulaires personnalisables (JSON) pour l’app mobile.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {activeTab === 'forms' && templates.length > 0 && (
            <div className="registration-templates-quick">
              <select
                className="registration-templates-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Créer depuis un template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titre || 'Template sans titre'}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                disabled={!selectedTemplateId}
                onClick={() => {
                  const t = templates.find((x) => x.id === selectedTemplateId)
                  if (t) openCreateFromTemplate(t)
                }}
              >
                Utiliser
              </Button>
            </div>
          )}
          <Button
            onClick={activeTab === 'templates' ? openCreateTemplate : openCreateForm}
            icon={<Plus size={16} />}
          >
            {activeTab === 'templates' ? 'Nouveau template' : 'Nouveau formulaire'}
          </Button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'forms' ? 'active' : ''}`} onClick={() => setActiveTab('forms')}>
          <ClipboardList size={16} aria-hidden="true" />
          Formulaires
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <LayoutTemplate size={16} aria-hidden="true" />
          Templates
        </button>
      </div>

      <EntityListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Rechercher (titre, slug, statut)…"
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
        items={visibleForms}
        loading={activeTab === 'templates' ? templatesLoading : loading}
        emptyText={activeTab === 'templates' ? 'Aucun template pour le moment.' : 'Aucun formulaire pour le moment.'}
        onItemClick={activeTab === 'templates' ? openEditTemplateWithBuilder : openEditWithBuilder}
        renderTitle={(item) => item?.titre || 'Sans titre'}
        renderMeta={(item) => (
          <>
            {activeTab === 'templates' ? (
              <>
                <span>Portée: {item?.city_id ? 'Ville' : 'Global'}</span>
                <span>Champs: {Array.isArray(item?.definition?.fields) ? item.definition.fields.length : '—'}</span>
              </>
            ) : (
              <>
                <span>Statut: {item?.status || '—'}</span>
                <span>
                  Capacité: {formatCapacity(item)} ({String(item?.capacity_mode || 'SUBMISSIONS').toUpperCase()})
                </span>
              </>
            )}
          </>
        )}
        renderBody={(item) => {
          const desc = item?.description ? String(item.description).slice(0, 80) : ''
          if (activeTab === 'templates') {
            return desc ? `${desc}${desc.length > 80 ? '…' : ''}` : 'Réutilisable pour créer des formulaires.'
          }
          const slug = item?.public_slug ? `Slug: ${item.public_slug}` : 'Slug: —'
          const pub = item?.is_public ? 'Public: oui' : 'Public: non'
          return `${slug} • ${pub}${desc ? `\n${desc}${desc.length > 80 ? '…' : ''}` : ''}`
        }}
      />

      <Drawer
        isOpen={activeDrawerOpen}
        onClose={() => {
          activeCloseDrawer()
          setSelectedFieldId(null)
        }}
        title={
          activeEditingItem
            ? isTemplate
              ? 'Modifier un template'
              : 'Modifier un formulaire'
            : isTemplate
                ? 'Créer un template'
                : 'Créer un formulaire'
        }
        width={880}
      >
        <form
          onSubmit={(e) => {
            // Ensure definition is normalized before submit
            activeSetFormData((prev) => ({ ...prev, definition: ensureDefinition(prev.definition) }))
            return activeHandleSubmit(e)
          }}
        >
          <div className="form-section">
            <div className="form-section-title">Configuration</div>

            <div className="form-row">
              <Input
                label="Titre"
                name="titre"
                value={activeFormData.titre}
                onChange={(e) => {
                  activeHandleInputChange(e)
                  // slug auto for creation (forms only)
                  if (!isTemplate && !editingItem) {
                    const nextSlug = ensureUniqueSlug(e.target.value, null)
                    setFormData((prev) => ({ ...prev, public_slug: nextSlug }))
                  }
                }}
                required
                error={activeErrors.titre}
                placeholder="Ex: Atelier enfants"
              />
              {!isTemplate ? (
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className={`form-input ${activeErrors.status ? 'error' : ''}`}
                    name="status"
                    value={activeFormData.status || 'draft'}
                    onChange={(e) => {
                      const next = String(e.target.value || 'draft')
                      setFormData((prev) => ({ ...prev, status: next }))
                    }}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>
                  {activeErrors.status && <span className="form-error">{activeErrors.status}</span>}
                </div>
              ) : (
                <div className="form-group">
                  <label className="input-label">Portée</label>
                  {admin?.role === 'superadmin' ? (
                    <select
                      className="registration-templates-select"
                      value={activeFormData.scope || 'city'}
                      onChange={(e) => activeSetFormData((prev) => ({ ...prev, scope: e.target.value }))}
                    >
                      <option value="city">Privé (ville)</option>
                      <option value="global">Global (toutes les villes)</option>
                    </select>
                  ) : (
                    <div className="builder-help">Privé (ville)</div>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Description"
              name="description"
              value={activeFormData.description}
              onChange={activeHandleInputChange}
              multiline
              rows={4}
              placeholder="Texte affiché avant le formulaire"
            />

            {!isTemplate && (
              <>
                <div className="form-row">
                  <Input
                    label="Slug public"
                    name="public_slug"
                    value={activeFormData.public_slug}
                    onChange={(e) => {
                      const next = ensureUniqueSlug(e.target.value, editingItem?.id)
                      setFormData((prev) => ({ ...prev, public_slug: next }))
                    }}
                    placeholder="atelier-enfants-2026"
                    readOnly={!editingItem}
                    error={activeErrors.public_slug}
                  />
                  <div className="form-group">
                    <label className="input-label">Public</label>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
                      <input
                        type="checkbox"
                        checked={!!activeFormData.is_public}
                        onChange={(e) => setFormData((prev) => ({ ...prev, is_public: e.target.checked }))}
                      />
                      Visible via lien (slug)
                    </label>

                    {!editingItem ? (
                      <div className="builder-help">Slug généré automatiquement à partir du titre.</div>
                    ) : (
                      <>
                        <div className="builder-help">Astuce: régénère un slug depuis le titre (unique).</div>
                        <Button type="button" variant="secondary" onClick={setPublicSlugFromTitle}>
                          Régénérer depuis titre
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {activeFormData.is_public && activeFormData.public_slug && (
                  <div className="public-link-row">
                    <div className="public-link-label">Lien public</div>
                    <div className="public-link-value">
                      {citySlug ? (
                        <a href={publicLink} target="_blank" rel="noreferrer">
                          {publicLink}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-gray-600)' }}>Slug ville manquant (reconnecte-toi)</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      icon={<Copy size={16} />}
                      disabled={!publicLink}
                      onClick={() => copyText(publicLink)}
                    >
                      {copiedLink ? 'Copié' : 'Copier'}
                    </Button>
                  </div>
                )}
              </>
            )}

            {!isTemplate && (
              <div className="form-row">
                <Input
                  label="Ouverture (starts_at)"
                  name="starts_at"
                  type="date"
                  value={activeFormData.starts_at}
                  onChange={activeHandleInputChange}
                />
                <Input
                  label="Mode capacité"
                  name="capacity_mode"
                  value={activeFormData.capacity_mode}
                  onChange={activeHandleInputChange}
                  placeholder="SUBMISSIONS / PERSONS"
                />
                <Input
                  label="Capacité max (vide = illimitée)"
                  name="capacity_max"
                  type="number"
                  value={activeFormData.capacity_max}
                  onChange={activeHandleInputChange}
                  placeholder="Ex: 30"
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">Builder du formulaire (JSON réutilisable en React Native)</div>

            {activeErrors.definition && <div className="page-error">{activeErrors.definition}</div>}

            <div className="builder">
              <div className="builder-panel">
                <div className="builder-panel-header">
                  <div className="builder-panel-title">Champs</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button type="button" variant="secondary" onClick={() => addField('text')}>
                      + Texte
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => addField('select')}>
                      + Liste
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => addField('number')}>
                      + Nombre
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => addField('checkbox')}>
                      + Checkbox
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => addField('date')}>
                      + Date
                    </Button>
                  </div>
                </div>

                {fields.length === 0 ? (
                  <div className="builder-empty">Ajoute ton premier champ avec les boutons ci-dessus.</div>
                ) : (
                  <div className="builder-fields">
                    {fields.map((f, idx) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`builder-field-item ${selectedFieldId === f.id ? 'active' : ''}`}
                        onClick={() => setSelectedFieldId(f.id)}
                      >
                        <div className="builder-field-top">
                          <div>
                            <div className="builder-field-name">
                              {idx + 1}. {f.label || 'Sans libellé'}
                            </div>
                            <div className="builder-field-meta">
                              <span>id: {f.id}</span>
                              <span>type: {typeLabel(f.type)}</span>
                              {f.required ? <span>requis</span> : <span>optionnel</span>}
                              {f.visibleWhen?.fieldId ? <span>condition</span> : null}
                            </div>
                          </div>

                          <div className="builder-actions" onClick={(e) => e.stopPropagation()}>
                            <button type="button" aria-label="Monter" onClick={() => moveField(f.id, 'up')}>
                              <ChevronUp size={16} />
                            </button>
                            <button type="button" aria-label="Descendre" onClick={() => moveField(f.id, 'down')}>
                              <ChevronDown size={16} />
                            </button>
                            <button type="button" aria-label="Dupliquer" onClick={() => duplicateField(f)}>
                              <Copy size={16} />
                            </button>
                            <button type="button" aria-label="Supprimer" onClick={() => deleteField(f.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="builder-panel">
                <div className="builder-panel-header">
                  <div className="builder-panel-title">Éditeur</div>
                  <Button
                    type="button"
                    variant="secondary"
                    icon={previewEnabled ? <EyeOff size={16} /> : <Eye size={16} />}
                    onClick={() => setPreviewEnabled((v) => !v)}
                  >
                    {previewEnabled ? 'Masquer aperçu' : 'Voir aperçu'}
                  </Button>
                </div>

                <div className="builder-editor">
                  {!selectedField ? (
                    <div className="builder-empty">Sélectionne un champ pour le modifier.</div>
                  ) : (
                    <>
                      <div className="builder-editor-grid">
                        <div className="full">
                          <Input
                            label="Libellé"
                            value={selectedField.label || ''}
                            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                            placeholder="Ex: Nom de l'enfant"
                          />
                        </div>

                        <Input
                          label="Identifiant (id)"
                          value={selectedField.id}
                          onChange={(e) => {
                            const nextId = slugify(e.target.value) || e.target.value
                            // rename field id + update references
                            setDefinition((def) => {
                              const next = { ...def, fields: [...def.fields] }
                              const idx = next.fields.findIndex((f) => f.id === selectedField.id)
                              if (idx < 0) return def
                              if (next.fields.some((f) => f.id === nextId)) return def
                              next.fields[idx] = { ...next.fields[idx], id: nextId }
                              next.fields = next.fields.map((f) => {
                                if (!f.visibleWhen) return f
                                return f.visibleWhen.fieldId === selectedField.id
                                  ? { ...f, visibleWhen: { ...f.visibleWhen, fieldId: nextId } }
                                  : f
                              })
                              setSelectedFieldId(nextId)
                              return next
                            })
                          }}
                          placeholder="ex: child-name"
                        />

                        <Input
                          label="Type"
                          value={selectedField.type}
                          onChange={(e) => {
                            const t = e.target.value
                            updateField(selectedField.id, {
                              type: t,
                              options: t === 'select' ? (selectedField.options?.length ? selectedField.options : ['Option 1']) : undefined
                            })
                          }}
                          placeholder="text / select / number ..."
                        />

                        <div className="form-group">
                          <label className="input-label">Requis</label>
                          <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
                            <input
                              type="checkbox"
                              checked={!!selectedField.required}
                              onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                            />
                            Champ obligatoire
                          </label>
                        </div>

                        <div className="full">
                          <Input
                            label="Placeholder"
                            value={selectedField.placeholder || ''}
                            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                            placeholder="Ex: Tapez ici…"
                          />
                        </div>

                        {selectedField.type === 'select' && (
                          <div className="full">
                            <Input
                              label="Options (séparées par des virgules)"
                              value={(selectedField.options || []).join(', ')}
                              onChange={(e) => {
                                const opts = String(e.target.value)
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                                updateField(selectedField.id, { options: opts })
                              }}
                              placeholder="Option 1, Option 2"
                            />
                          </div>
                        )}

                        <div className="full">
                          <div className="form-row">
                            <Input
                              label="Condition (afficher seulement si id=...)"
                              value={selectedField.visibleWhen?.fieldId || ''}
                              onChange={(e) => {
                                const fieldId = e.target.value
                                if (!fieldId) {
                                  updateField(selectedField.id, { visibleWhen: null })
                                  return
                                }
                                updateField(selectedField.id, {
                                  visibleWhen: { fieldId, operator: 'equals', value: selectedField.visibleWhen?.value ?? '' }
                                })
                              }}
                              placeholder="Ex: childName"
                            />
                            <Input
                              label="Valeur attendue"
                              value={selectedField.visibleWhen?.value ?? ''}
                              onChange={(e) => {
                                const rule = selectedField.visibleWhen
                                if (!rule?.fieldId) return
                                updateField(selectedField.id, { visibleWhen: { ...rule, value: e.target.value } })
                              }}
                              placeholder="Ex: oui"
                            />
                          </div>
                          <div className="builder-help">
                            Règle simple: le champ est visible si la valeur du champ référencé est égale.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {previewEnabled && (
                  <div className="preview">
                    <h3 className="preview-title">Aperçu (logique de conditions)</h3>
                    {fields.length === 0 ? (
                      <div className="builder-empty">Ajoute des champs pour voir l’aperçu.</div>
                    ) : (
                      <>
                        {fields.map((f) => {
                          const isVisible = evaluateVisible(f, previewAnswers)
                          if (!isVisible) return null
                          return (
                            <div key={f.id} className="preview-field">
                              <div className="preview-field-label">
                                {f.label || f.id} {f.required ? '*' : ''}
                              </div>
                              <div style={{ color: 'var(--color-gray-600)', fontSize: 13 }}>
                                type: {typeLabel(f.type)} {f.type === 'select' ? `(${(f.options || []).join(' / ')})` : ''}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="builder-help" style={{ marginTop: 10 }}>
              Structure JSON sauvegardée: <b>{'{ version: 1, fields: [...] }'}</b>. Chaque champ peut avoir <b>visibleWhen</b> pour gérer une condition simple.
            </div>
          </div>

          <div className="form-actions">
            {activeEditingItem && (
              <Button
                type="button"
                variant="danger"
                onClick={() => activeHandleDelete(activeEditingItem)}
                icon={<Trash2 size={16} />}
              >
                {isTemplate ? 'Supprimer' : 'Archiver'}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={activeCloseDrawer}>
              Fermer
            </Button>
            <Button type="submit" variant="success" icon={<Save size={16} />}>
              {activeEditingItem ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
