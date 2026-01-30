import { useEffect, useMemo, useState } from 'react'
import Drawer from '../components/common/Drawer'
import EntityCardGrid from '../components/common/EntityCardGrid'
import EntityListToolbar from '../components/common/EntityListToolbar'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { reportsAPI } from '../services/api'
import useQuickEditEntity from '../hooks/useQuickEditEntity'
import { filterAndSort } from '../utils/listFiltering'
import './PageStyles.css'
import './ReportsPage.css'
import { useToast } from '../context/ToastContext'
import { AlertTriangle, Calendar, Check, ChevronDown, MessageSquare, Trash2, User } from 'lucide-react'

export default function ReportsPage() {
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')

  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [commentTarget, setCommentTarget] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')

  const [tagMenu, setTagMenu] = useState(null)
  const [tagMenuQuery, setTagMenuQuery] = useState('')
  const [savingId, setSavingId] = useState('')

  const statusLabels = useMemo(
    () => ({
      Nouveau: 'Nouveau',
      En_cours_de_traitement: 'En cours',
      R_solu: 'Résolu'
    }),
    []
  )

  const statusOrder = useMemo(() => ['Nouveau', 'En_cours_de_traitement', 'R_solu'], [])

  const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

  const normalizeUrgence = (value) => String(value || '').trim().toLowerCase()

  const urgenceClass = (value) => {
    const u = normalizeUrgence(value)
    if (!u) return ''
    if (u.startsWith('haut') || u.includes('élev') || u.includes('eleve') || u.includes('urgent')) return 'report-tag--urgence-high'
    if (u.startsWith('moy')) return 'report-tag--urgence-medium'
    return 'report-tag--urgence-low'
  }

  const normalizeReport = (r) => {
    const data = isPlainObject(r?.data) ? r.data : {}
    const location = isPlainObject(data?.location) ? data.location : null
    const titre = r?.titre ?? data?.title ?? ''
    const categorie = data?.categorie ?? data?.category ?? ''
    const urgence = data?.urgence ?? data?.urgency ?? ''
    const description = data?.description ?? ''
    const photoUrl = data?.photoUrl ?? data?.imageUrl ?? data?.photo_url ?? data?.image_url ?? ''
    const status = r?.status ?? 'Nouveau'

    const userName = `${r?.users?.name ?? ''} ${r?.users?.surname ?? ''}`.trim()
    const userEmail = r?.users?.email ?? ''

    return {
      id: r?.id,
      created_at: r?.created_at,
      titre,
      categorie,
      urgence,
      description,
      photoUrl,
      location,
      status,
      statusLabel: statusLabels[status] || String(status || ''),
      userName: userName || '—',
      userEmail: userEmail || '—',
      adminComment: data?.admin_comment ?? '',
      raw: r,
    }
  }

  const initialFormData = useMemo(
    () => ({
      status: 'Nouveau',
      categorie: '',
      urgence: '',
      admin_comment: ''
    }),
    []
  )

  const {
    items: reports,
    loading,
    isDrawerOpen,
    editingItem,
    formData,
    openEdit,
    closeDrawer,
    handleDelete,
    refresh,
    setFormData
  } = useQuickEditEntity({
    fetchAll: reportsAPI.getAll,
    createItem: reportsAPI.create,
    updateItem: (id, form) => reportsAPI.update(id, form),
    deleteItem: reportsAPI.delete,
    initialFormData,
    mapItemToFormData: (item) => ({
      status: item?.status || 'Nouveau',
      categorie: item?.categorie || '',
      urgence: item?.urgence || '',
      admin_comment: item?.adminComment || ''
    }),
    validate: () => ({}),
    messages: {
      loadError: 'Erreur lors du chargement des signalements',
      saveError: 'Erreur lors de la sauvegarde',
      deleteError: 'Erreur lors de la suppression',
      updateSuccess: 'Signalement modifié avec succès',
      deleteSuccess: 'Signalement supprimé avec succès',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce signalement ?'
    }
  })

  const normalizedReports = useMemo(() => (reports || []).map(normalizeReport), [reports])

  const availableCategories = useMemo(() => {
    const set = new Set()
    for (const r of normalizedReports) {
      const c = String(r?.categorie || '').trim()
      if (c) set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [normalizedReports])

  const availableUrgences = useMemo(() => {
    const set = new Set()
    for (const r of normalizedReports) {
      const u = String(r?.urgence || '').trim()
      if (u) set.add(u)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [normalizedReports])

  const urgencePresets = useMemo(() => {
    const defaults = ['faible', 'moyenne', 'haute']
    const fromData = availableUrgences.map((u) => String(u || '').trim()).filter(Boolean)
    const set = new Set([...defaults, ...fromData])
    return Array.from(set).filter(Boolean)
  }, [availableUrgences])

  const visibleReports = useMemo(() => {
    const base = filterAndSort({
      items: normalizedReports,
      query,
      dateFrom,
      dateTo,
      sort,
      getText: (item) => {
        const bits = [
          item?.titre,
          item?.categorie,
          item?.urgence,
          item?.statusLabel,
          item?.description,
          item?.userName,
          item?.userEmail
        ]
        return bits.filter(Boolean).join(' ')
      },
      getTitle: (item) => item?.titre ?? '',
      getDate: (item) => item?.createdAt || item?.created_at
    })

    let filtered = base
    if (statusFilter) filtered = filtered.filter((r) => String(r?.status || '') === statusFilter)
    if (categoryFilter) filtered = filtered.filter((r) => String(r?.categorie || '') === categoryFilter)
    if (urgencyFilter) filtered = filtered.filter((r) => String(r?.urgence || '') === urgencyFilter)
    return filtered
  }, [normalizedReports, query, dateFrom, dateTo, sort, statusFilter, categoryFilter, urgencyFilter])

  const formatDateTime = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR')
  }

  const formatDateShort = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR')
  }

  const unionOptions = (list, current) => {
    const out = new Set((Array.isArray(list) ? list : []).map((v) => String(v || '').trim()).filter(Boolean))
    const c = String(current || '').trim()
    if (c) out.add(c)
    return Array.from(out)
  }

  const closeTagMenu = () => {
    setTagMenu(null)
    setTagMenuQuery('')
  }

  useEffect(() => {
    if (!tagMenu) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeTagMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [tagMenu])

  const openTagMenu = (e, config) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setTagMenu({
      ...config,
      rect: {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      }
    })
    setTagMenuQuery('')
  }

  const quickUpdate = async (rowId, payload, successMessage) => {
    if (!rowId) return
    setSavingId(rowId)
    try {
      await reportsAPI.update(rowId, payload)
      await refresh()
      if (successMessage) toast.success(successMessage)
    } catch (e) {
      const msg = e?.response?.data?.error || 'Erreur lors de la mise à jour'
      console.error(msg, e)
      toast.error(msg)
    } finally {
      setSavingId('')
    }
  }

  const openCommentModal = (row) => {
    setCommentTarget(row)
    setCommentDraft(String(row?.adminComment || ''))
    setCommentModalOpen(true)
  }

  const closeCommentModal = () => {
    setCommentModalOpen(false)
    setCommentTarget(null)
    setCommentDraft('')
  }

  const saveComment = async (rowId, comment) => {
    await quickUpdate(
      rowId,
      {
        data: {
          admin_comment: comment,
          admin_comment_at: new Date().toISOString()
        }
      },
      'Commentaire mis à jour'
    )
  }

  const handleMenuSelect = async (nextValue) => {
    if (!tagMenu?.rowId || !tagMenu?.kind) return

    const trimmed = String(nextValue || '').trim()
    if (!trimmed) return

    const rowId = tagMenu.rowId
    if (tagMenu.kind === 'status') {
      await quickUpdate(rowId, { status: trimmed }, 'Statut mis à jour')
      if (editingItem?.id === rowId) setFormData((prev) => ({ ...prev, status: trimmed }))
    }
    if (tagMenu.kind === 'categorie') {
      await quickUpdate(rowId, { data: { categorie: trimmed } }, 'Catégorie mise à jour')
      if (editingItem?.id === rowId) setFormData((prev) => ({ ...prev, categorie: trimmed }))
    }
    if (tagMenu.kind === 'urgence') {
      await quickUpdate(rowId, { data: { urgence: trimmed } }, 'Urgence mise à jour')
      if (editingItem?.id === rowId) setFormData((prev) => ({ ...prev, urgence: trimmed }))
    }

    closeTagMenu()
  }

  const tagMenuView = useMemo(() => {
    if (!tagMenu) return null
    const options = unionOptions(tagMenu.options, tagMenu.value)
    const q = String(tagMenuQuery || '').trim().toLowerCase()
    const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options

    const canCreate = tagMenu.allowCreate && q && !options.some((o) => o.toLowerCase() === q)

    // Position (fixed) with simple viewport clamping
    const margin = 12
    const menuWidth = Math.max(260, Math.min(360, Math.round(tagMenu.rect.width || 260)))
    const preferredLeft = tagMenu.rect.left
    const maxLeft = window.innerWidth - menuWidth - margin
    const left = Math.max(margin, Math.min(preferredLeft, maxLeft))
    const top = Math.min(tagMenu.rect.bottom + 8, window.innerHeight - margin)

    return {
      filtered,
      canCreate,
      menuWidth,
      left,
      top
    }
  }, [tagMenu, tagMenuQuery])

  return (
    <div className="page reports-page">
      <div className="page-header">
        <div>
          <h1>
            <AlertTriangle size={22} aria-hidden="true" />
            Gestion des Signalements
          </h1>
          <p>Gérez les signalements: tags, commentaire, suppression</p>
        </div>
      </div>

      <EntityListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Rechercher (titre, catégorie, urgence, utilisateur, description)…"
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
            <option value="Nouveau">Nouveau</option>
            <option value="En_cours_de_traitement">En cours</option>
            <option value="R_solu">Résolu</option>
          </select>
        </label>

        <label className="entity-toolbar-label">
          Catégorie
          <select
            className="entity-toolbar-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="entity-toolbar-label">
          Urgence
          <select
            className="entity-toolbar-input"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            aria-label="Filtrer par urgence"
          >
            <option value="">Toutes</option>
            {availableUrgences.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
      </EntityListToolbar>

      <EntityCardGrid
        items={visibleReports}
        loading={loading}
        emptyText="Aucun signalement pour le moment."
        onItemClick={openEdit}
        renderCover={(item) =>
          item?.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item?.titre ? `Photo - ${item.titre}` : 'Photo signalement'}
              loading="lazy"
            />
          ) : null
        }
        renderTitle={(item) => (
          <div className="report-row-titleWrap">
            <div className="report-row-titleText">{item?.titre || 'Signalement'}</div>
            <div className="report-row-sub" title={item?.userEmail || ''}>
              <span className="report-row-subItem">
                <Calendar size={14} aria-hidden="true" />
                {formatDateShort(item?.created_at)}
              </span>
              <span className="report-row-subSep">•</span>
              <span className="report-row-subItem">
                <User size={14} aria-hidden="true" />
                {item?.userName || '—'}
              </span>
            </div>
          </div>
        )}
        renderBody={(item) => {
          const categorieOptions = unionOptions(availableCategories, item?.categorie)
          const urgenceOptions = unionOptions(urgencePresets, item?.urgence)

          return (
            <div className="report-row-body">
              <div className="report-row-desc" title={String(item?.description || '')}>
                {String(item?.description || '').trim() || '—'}
              </div>

              <div className="report-tags report-tags--row" aria-label="Tags">
                <button
                  type="button"
                  className="report-tag report-tag--status report-tag--btn"
                  disabled={savingId === item?.id}
                  onClick={(e) =>
                    openTagMenu(e, {
                      kind: 'status',
                      rowId: item?.id,
                      value: item?.status,
                      options: statusOrder,
                      allowCreate: false,
                      title: 'Statut'
                    })
                  }
                >
                  {item?.statusLabel || '—'} <ChevronDown size={14} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="report-tag report-tag--btn"
                  disabled={savingId === item?.id}
                  onClick={(e) =>
                    openTagMenu(e, {
                      kind: 'categorie',
                      rowId: item?.id,
                      value: item?.categorie,
                      options: categorieOptions,
                      allowCreate: true,
                      title: 'Catégorie'
                    })
                  }
                >
                  {item?.categorie || '—'} <ChevronDown size={14} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={`report-tag report-tag--btn ${urgenceClass(item?.urgence)}`}
                  disabled={savingId === item?.id}
                  onClick={(e) =>
                    openTagMenu(e, {
                      kind: 'urgence',
                      rowId: item?.id,
                      value: item?.urgence,
                      options: urgenceOptions,
                      allowCreate: true,
                      title: 'Urgence'
                    })
                  }
                >
                  {item?.urgence || '—'} <ChevronDown size={14} aria-hidden="true" />
                </button>
              </div>

              {item?.adminComment ? (
                <div className="report-row-admin" title={String(item.adminComment)}>
                  Réponse: {String(item.adminComment)}
                </div>
              ) : (
                <div className="report-row-admin report-row-admin--empty">—</div>
              )}
            </div>
          )
        }}
        renderActions={(item) => (
          <div className="report-card-actions">
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              icon={<MessageSquare size={16} />}
              onClick={() => openCommentModal(item)}
              aria-label="Commenter"
              title="Commenter"
              disabled={savingId === item?.id}
            />
            <Button
              variant="danger"
              size="sm"
              iconOnly
              icon={<Trash2 size={16} />}
              onClick={() => handleDelete(item)}
              aria-label="Supprimer"
              title="Supprimer"
              disabled={savingId === item?.id}
            />
          </div>
        )}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingItem ? 'Détails du signalement' : 'Signalement'}
        width={560}
      >
        {editingItem ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="form-section" style={{ padding: 16, marginBottom: 0 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{editingItem?.titre || 'Signalement'}</div>

                <div className="report-tags">
                  <button
                    type="button"
                    className="report-tag report-tag--status report-tag--btn"
                    disabled={savingId === editingItem?.id}
                    onClick={(e) =>
                      openTagMenu(e, {
                        kind: 'status',
                        rowId: editingItem?.id,
                        value: formData.status,
                        options: statusOrder,
                        allowCreate: false,
                        title: 'Statut'
                      })
                    }
                  >
                    {statusLabels[formData.status] || formData.status || '—'} <ChevronDown size={14} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="report-tag report-tag--btn"
                    disabled={savingId === editingItem?.id}
                    onClick={(e) =>
                      openTagMenu(e, {
                        kind: 'categorie',
                        rowId: editingItem?.id,
                        value: formData.categorie,
                        options: unionOptions(availableCategories, formData.categorie),
                        allowCreate: true,
                        title: 'Catégorie'
                      })
                    }
                  >
                    {formData.categorie || '—'} <ChevronDown size={14} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className={`report-tag report-tag--btn ${urgenceClass(formData.urgence)}`}
                    disabled={savingId === editingItem?.id}
                    onClick={(e) =>
                      openTagMenu(e, {
                        kind: 'urgence',
                        rowId: editingItem?.id,
                        value: formData.urgence,
                        options: unionOptions(urgencePresets, formData.urgence),
                        allowCreate: true,
                        title: 'Urgence'
                      })
                    }
                  >
                    {formData.urgence || '—'} <ChevronDown size={14} aria-hidden="true" />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 4, fontSize: 12, color: 'var(--color-gray-600)' }}>
                  <div>Créé le {formatDateTime(editingItem?.created_at)}</div>
                  <div>
                    {editingItem?.userName ? `Utilisateur: ${editingItem.userName}` : 'Utilisateur: —'}
                    {editingItem?.userEmail ? ` • ${editingItem.userEmail}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {editingItem?.photoUrl ? (
              <div className="form-section" style={{ padding: 16, marginBottom: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Photo</div>
                <a href={editingItem.photoUrl} target="_blank" rel="noreferrer">
                  <img
                    src={editingItem.photoUrl}
                    alt="Photo du signalement"
                    style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border-color)' }}
                  />
                </a>
              </div>
            ) : null}

            {editingItem?.description ? (
              <div className="form-section" style={{ padding: 16, marginBottom: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Description</div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{editingItem.description}</div>
              </div>
            ) : null}

            <div className="form-section" style={{ padding: 16, marginBottom: 0 }}>
              <Input
                label="Commentaire pour l'utilisateur"
                name="admin_comment"
                value={formData.admin_comment}
                onChange={(e) => setFormData((prev) => ({ ...prev, admin_comment: e.target.value }))}
                multiline
                rows={5}
                placeholder="Écrivez un commentaire visible côté utilisateur"
              />

              <div className="form-actions" style={{ marginTop: 12 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  icon={<MessageSquare size={16} />}
                  onClick={() => openCommentModal(editingItem)}
                  aria-label="Ouvrir en grand"
                  title="Ouvrir en grand"
                  disabled={savingId === editingItem?.id}
                />
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!editingItem?.id) return
                    await saveComment(editingItem.id, formData.admin_comment)
                  }}
                  disabled={!editingItem?.id || savingId === editingItem?.id}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="page-loading">Sélectionnez un signalement…</div>
        )}
      </Drawer>

      <Modal
        isOpen={commentModalOpen}
        onClose={closeCommentModal}
        title={commentTarget ? `Commentaire - ${commentTarget.titre || 'Signalement'}` : 'Commentaire'}
        size="medium"
        footer={(
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeCommentModal}>Annuler</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!commentTarget?.id) return
                await saveComment(commentTarget.id, commentDraft)
                if (editingItem?.id === commentTarget.id) {
                  setFormData((prev) => ({ ...prev, admin_comment: commentDraft }))
                }
                closeCommentModal()
              }}
              disabled={!commentTarget?.id || savingId === commentTarget?.id}
            >
              Enregistrer
            </Button>
          </div>
        )}
      >
        <Input
          label="Commentaire pour l'utilisateur"
          name="commentDraft"
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          multiline
          rows={7}
          placeholder="Votre message…"
        />
      </Modal>

      {tagMenu && tagMenuView ? (
        <div className="report-menu-layer" onMouseDown={closeTagMenu}>
          <div
            className="report-menu"
            style={{ width: tagMenuView.menuWidth, left: tagMenuView.left, top: tagMenuView.top }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={tagMenu.title || 'Menu'}
          >
            <div className="report-menu-header">{tagMenu.title || 'Choisir'}</div>

            {tagMenu.allowCreate ? (
              <input
                className="report-menu-search"
                value={tagMenuQuery}
                onChange={(e) => setTagMenuQuery(e.target.value)}
                placeholder="Rechercher ou créer…"
                autoFocus
              />
            ) : null}

            <div className="report-menu-list" role="listbox">
              {tagMenuView.filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`report-menu-item${String(opt) === String(tagMenu.value) ? ' is-active' : ''}`}
                  onClick={() => handleMenuSelect(opt)}
                  role="option"
                  aria-selected={String(opt) === String(tagMenu.value)}
                >
                  <span className="report-menu-item-label">{opt}</span>
                  {String(opt) === String(tagMenu.value) ? <Check size={16} aria-hidden="true" /> : null}
                </button>
              ))}

              {tagMenuView.canCreate ? (
                <button
                  type="button"
                  className="report-menu-item report-menu-item--create"
                  onClick={() => handleMenuSelect(String(tagMenuQuery || '').trim())}
                >
                  <span className="report-menu-item-label">Créer “{String(tagMenuQuery || '').trim()}”</span>
                </button>
              ) : null}

              {!tagMenuView.filtered.length && !tagMenuView.canCreate ? (
                <div className="report-menu-empty">Aucun résultat</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
