import { useEffect, useMemo, useState } from 'react'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { usersAdminAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useConfirmDialog } from '../context/ConfirmDialogContext'
import './PageStyles.css'
import './UsersPage.css'
import {
  Ban,
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Shield,
  User,
  Users as UsersIcon
} from 'lucide-react'

const PERMISSIONS = [
  { key: 'city_info', label: 'Informations de la ville' },
  { key: 'annoucements', label: 'Annonces' },
  { key: 'news', label: 'Actualités' },
  { key: 'events', label: 'Événements' },
  { key: 'polls', label: 'Sondages' },
  { key: 'registration_forms', label: 'Inscriptions' },
  { key: 'reports', label: 'Signalements' }
]

const accessLabel = (level) => {
  if (level === 'editor') return 'Éditeur'
  if (level === 'viewer') return 'Visualiseur'
  return 'Aucun accès'
}

const accessNote = (level) => {
  if (level === 'editor') return 'Peut modifier'
  if (level === 'viewer') return 'Lecture seule'
  return 'Onglet masqué'
}

const normalizeLevel = (raw) => {
  const v = String(raw || '').toLowerCase().trim()
  if (v === 'editor' || v === 'editeur' || v === 'éditeur') return 'editor'
  if (v === 'viewer' || v === 'visualisateur') return 'viewer'
  if (v === 'none' || v === 'aucun' || v === 'aucun accès' || v === 'aucun_acces') return 'none'
  return 'none'
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''))

const defaultAccess = () => {
  const access = {}
  for (const p of PERMISSIONS) access[p.key] = 'none'
  return access
}

export default function UsersPage() {
  const toast = useToast()
  const { confirm } = useConfirmDialog()

  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [permMenu, setPermMenu] = useState(null) // { x, y, key }

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'utilisateur',
    nom: '',
    prenom: '',
    access: defaultAccess()
  })

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await usersAdminAPI.getAll()
      setItems(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      console.error('Erreur lors du chargement des comptes admin:', err)
      toast.error(err?.response?.data?.error || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    const q = String(query || '').toLowerCase().trim()
    if (!q) return items
    return items.filter((u) => {
      const profile = u?.profile || {}
      const name = `${profile?.prenom || ''} ${profile?.nom || ''}`.toLowerCase()
      const email = String(u?.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [items, query])

  const openCreate = () => {
    setEditingItem(null)
    setErrors({})
    setForm({
      email: '',
      password: '',
      role: 'utilisateur',
      nom: '',
      prenom: '',
      access: defaultAccess()
    })
    setIsModalOpen(true)
  }

  const openEdit = (item) => {
    const profile = item?.profile || {}
    const accessRaw = profile?.access || {}
    const nextAccess = defaultAccess()
    for (const p of PERMISSIONS) {
      if (accessRaw[p.key] !== undefined) nextAccess[p.key] = normalizeLevel(accessRaw[p.key])
    }

    setEditingItem(item)
    setErrors({})
    setForm({
      email: item?.email || '',
      password: '',
      role: item?.role || 'utilisateur',
      nom: profile?.nom || '',
      prenom: profile?.prenom || '',
      access: nextAccess
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setErrors({})
    setPermMenu(null)
    setSaving(false)
  }

  const validate = () => {
    const next = {}
    if (!String(form.email || '').trim()) next.email = "L'email est requis"
    else if (!isValidEmail(form.email)) next.email = "L'email n'est pas valide"
    if (!editingItem) {
      if (!String(form.password || '').trim()) next.password = 'Le mot de passe est requis'
      else if (String(form.password).length < 6) next.password = '6 caractères minimum'
    } else {
      if (form.password && String(form.password).length < 6) next.password = '6 caractères minimum'
    }
    if (String(form.role || '').trim() !== 'admin' && String(form.role || '').trim() !== 'utilisateur') {
      next.role = 'Rôle invalide'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        email: String(form.email || '').trim(),
        role: String(form.role || '').trim(),
        ...(form.password ? { password: String(form.password) } : {}),
        profile: {
          nom: String(form.nom || '').trim(),
          prenom: String(form.prenom || '').trim(),
          access: form.access
        }
      }

      if (editingItem) {
        await usersAdminAPI.update(editingItem.id, payload)
        toast.success('Compte mis à jour')
      } else {
        await usersAdminAPI.create(payload)
        toast.success('Compte créé')
      }

      await fetchAdmins()
      closeModal()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      toast.error(err?.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (item) => {
    const isDisabled = String(item?.status || '').toLowerCase() === 'disable'
    const title = isDisabled ? 'Réactiver le compte ?' : 'Désactiver le compte ?'
    const message = isDisabled
      ? 'Le compte pourra à nouveau se connecter.'
      : 'Le compte ne pourra plus se connecter.'

    const ok = await confirm({
      title,
      message,
      confirmText: isDisabled ? 'Réactiver' : 'Désactiver',
      cancelText: 'Annuler',
      confirmVariant: isDisabled ? 'success' : 'danger',
      cancelVariant: 'secondary'
    })
    if (!ok) return

    try {
      await usersAdminAPI.update(item.id, { status: isDisabled ? 'active' : 'disable' })
      await fetchAdmins()
      toast.success(isDisabled ? 'Compte réactivé' : 'Compte désactivé')
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err)
      toast.error(err?.response?.data?.error || 'Erreur lors du changement de statut')
    }
  }

  const rolePill = (role) => {
    const r = String(role || '').toLowerCase().trim()
    if (r === 'admin') return { label: 'Admin', icon: Shield }
    return { label: 'Utilisateur', icon: User }
  }

  const avatarText = (item) => {
    const profile = item?.profile || {}
    const name = String(profile?.prenom || profile?.nom || item?.email || '').trim()
    return name ? name[0]?.toUpperCase() : '?'
  }

  const openPermMenu = (e, key) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setPermMenu({
      key,
      x: Math.min(rect.left, window.innerWidth - 300),
      y: rect.bottom + 6
    })
  }

  const closePermMenu = () => setPermMenu(null)

  const choosePerm = (value) => {
    if (!permMenu?.key) return
    setForm((prev) => ({
      ...prev,
      access: { ...prev.access, [permMenu.key]: value }
    }))
    closePermMenu()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <UsersIcon size={22} aria-hidden="true" />
            Utilisateurs (admin)
          </h1>
          <p>Comptes d’accès au tableau de bord (table users_admin).</p>
        </div>

        <div className="users-admin-header-actions">
          <Input
            label=""
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (nom, email)…"
          />
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Chargement…</div>
      ) : (
        <div className="users-admin-list">
          {visible.length === 0 ? (
            <div className="empty-state">Aucun utilisateur pour le moment.</div>
          ) : (
            visible.map((item) => {
              const profile = item?.profile || {}
              const pill = rolePill(item?.role)
              const RoleIcon = pill.icon
              const status = String(item?.status || '').toLowerCase().trim()
              const isDisabled = status === 'disable'
              const fullName = `${profile?.prenom || ''} ${profile?.nom || ''}`.trim() || '—'

              let accessSummary = '—'
              if (String(item?.role || '').toLowerCase().trim() === 'admin') {
                accessSummary = 'Tous accès'
              } else {
                const access = profile?.access || {}
                const allowed = PERMISSIONS.reduce((acc, p) => acc + (normalizeLevel(access?.[p.key]) !== 'none' ? 1 : 0), 0)
                accessSummary = `${allowed}/${PERMISSIONS.length} onglets`;
              }

              return (
                <div key={item.id} className="user-admin-row">
                  <div className="user-admin-left" onClick={() => openEdit(item)} role="button" tabIndex={0}>
                    <div className="user-admin-avatar" aria-hidden="true">{avatarText(item)}</div>
                    <div className="user-admin-main">
                      <div className="user-admin-title">
                        <div className="user-admin-name" title={fullName}>{fullName}</div>
                        <span className={`user-admin-pill ${isDisabled ? 'is-disabled' : ''}`}>
                          <RoleIcon size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                          {pill.label}
                        </span>
                        {isDisabled && <span className="user-admin-pill is-disabled">Désactivé</span>}
                      </div>
                      <div className="user-admin-email" title={item?.email || ''}>{item?.email || '—'}</div>
                      <div className="user-admin-meta">
                        <span>Accès: {accessSummary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="user-admin-actions">
                    <Button
                      iconOnly
                      variant="secondary"
                      title="Modifier"
                      onClick={() => openEdit(item)}
                      icon={<Pencil size={16} aria-hidden="true" />}
                    />
                    <Button
                      iconOnly
                      variant={isDisabled ? 'success' : 'danger'}
                      title={isDisabled ? 'Réactiver' : 'Désactiver'}
                      onClick={() => toggleStatus(item)}
                      icon={isDisabled ? <RotateCcw size={16} aria-hidden="true" /> : <Ban size={16} aria-hidden="true" />}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
        size="large"
      >
        <form onSubmit={submit}>
          <div className="users-admin-grid">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              placeholder="email@exemple.com"
              required
            />

            <Input
              label={editingItem ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              error={errors.password}
              placeholder={editingItem ? '••••••••' : '6 caractères minimum'}
              required={!editingItem}
            />
          </div>

          <div className="users-admin-grid">
            <Input
              label="Prénom"
              name="prenom"
              value={form.prenom}
              onChange={(e) => setForm((prev) => ({ ...prev, prenom: e.target.value }))}
              placeholder="Prénom"
            />

            <Input
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom"
            />
          </div>

          <div className="form-section">
            <div className="form-section-title">Rôle</div>
            <div className="users-admin-role-row">
              <div
                className={`users-admin-role-chip ${form.role === 'admin' ? 'is-active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, role: 'admin' }))}
                role="button"
                tabIndex={0}
              >
                <Shield size={16} aria-hidden="true" /> Admin
              </div>
              <div
                className={`users-admin-role-chip ${form.role === 'utilisateur' ? 'is-active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, role: 'utilisateur' }))}
                role="button"
                tabIndex={0}
              >
                <User size={16} aria-hidden="true" /> Utilisateur
              </div>
              {errors.role && <span className="form-error">{errors.role}</span>}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Accès par onglet</div>
            {form.role === 'admin' ? (
              <div className="city-info-hint">Les admins ont accès à tout (éditeur) et peuvent gérer l’onglet Utilisateurs.</div>
            ) : (
              <div className="users-admin-perms">
                {PERMISSIONS.map((p) => {
                  const level = form.access?.[p.key] || 'none'
                  return (
                    <div key={p.key} className="users-admin-perm-row">
                      <div className="users-admin-perm-label">{p.label}</div>
                      <div
                        className={`users-admin-perm-chip is-${level}`}
                        onClick={(e) => openPermMenu(e, p.key)}
                        role="button"
                        tabIndex={0}
                      >
                        {accessLabel(level)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="success" disabled={saving} icon={<Check size={16} aria-hidden="true" />}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {permMenu && (
        <div className="user-menu-layer" onClick={closePermMenu}>
          <div
            className="user-menu"
            style={{ left: permMenu.x, top: permMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="user-menu-header">Choisir le niveau d’accès</div>
            <div className="user-menu-list">
              {['none', 'viewer', 'editor'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`user-menu-item ${form.access?.[permMenu.key] === level ? 'is-active' : ''}`}
                  onClick={() => choosePerm(level)}
                >
                  <span className="user-menu-item-label">{accessLabel(level)}</span>
                  <span className="user-menu-item-note">{accessNote(level)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
