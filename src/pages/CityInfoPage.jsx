import { useEffect, useMemo, useState } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import ImageUploadField from '../components/common/ImageUploadField'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { cityProfileAPI, citySettingsAPI, uploadsAPI } from '../services/api'
import './PageStyles.css'
import './CityInfoPage.css'
import { Info, Plus, Save, Trash2 } from 'lucide-react'

const DAYS = [
  { key: 'monday', label: 'Lundi', value: 'Monday' },
  { key: 'tuesday', label: 'Mardi', value: 'Tuesday' },
  { key: 'wednesday', label: 'Mercredi', value: 'Wednesday' },
  { key: 'thursday', label: 'Jeudi', value: 'Thursday' },
  { key: 'friday', label: 'Vendredi', value: 'Friday' },
  { key: 'saturday', label: 'Samedi', value: 'Saturday' },
  { key: 'sunday', label: 'Dimanche', value: 'Sunday' }
]

const defaultSettings = () => ({
  address: '',
  contacts: {
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    x: '',
    others: []
  },
  opening_hours: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  },
  waste_collection: {
    days: [],
    recycling: ''
  }
})

const safeObj = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

export default function CityInfoPage() {
  const toast = useToast()
  const { updateCity } = useAuth()
  const [activeTab, setActiveTab] = useState('form')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoSaving, setLogoSaving] = useState(false)
  const [settings, setSettings] = useState(defaultSettings)
  const [jsonText, setJsonText] = useState('')

  const mergedSettings = useMemo(() => {
    const base = defaultSettings()
    const s = safeObj(settings)

    const merged = {
      ...base,
      ...s,
      contacts: {
        ...base.contacts,
        ...safeObj(s.contacts)
      },
      opening_hours: {
        ...base.opening_hours,
        ...safeObj(s.opening_hours)
      },
      waste_collection: {
        ...base.waste_collection,
        ...safeObj(s.waste_collection)
      }
    }

    if (!Array.isArray(merged.contacts.others)) merged.contacts.others = []
    if (!Array.isArray(merged.waste_collection.days)) merged.waste_collection.days = []

    return merged
  }, [settings])

  useEffect(() => {
    let mounted = true

    const fetchSettings = async () => {
      setLoading(true)
      try {
        const [settingsRes, cityRes] = await Promise.all([
          citySettingsAPI.get(),
          cityProfileAPI.getMe()
        ])

        const data = settingsRes?.data
        const city = cityRes?.data
        if (!mounted) return
        setSettings(data && typeof data === 'object' ? data : defaultSettings())
        setLogoUrl(city?.logo_url || '')
        if (city && typeof city === 'object') updateCity?.(city)
      } catch (err) {
        console.error(err)
        if (mounted) {
          setSettings(defaultSettings())
          setLogoUrl('')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSettings()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setJsonText(JSON.stringify(mergedSettings, null, 2))
  }, [mergedSettings])

  const updateSetting = (path, value) => {
    setSettings((prev) => {
      const next = (typeof structuredClone === 'function')
        ? structuredClone(prev)
        : JSON.parse(JSON.stringify(prev))
      let cursor = next
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]
        cursor[key] = safeObj(cursor[key])
        cursor = cursor[key]
      }
      cursor[path[path.length - 1]] = value
      return next
    })
  }

  const toggleWasteDay = (dayValue) => {
    const current = Array.isArray(mergedSettings.waste_collection.days)
      ? mergedSettings.waste_collection.days
      : []

    const next = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue]

    updateSetting(['waste_collection', 'days'], next)
  }

  const addOtherContact = () => {
    const others = Array.isArray(mergedSettings.contacts.others) ? mergedSettings.contacts.others : []
    updateSetting(['contacts', 'others'], [...others, { label: '', type: 'phone', value: '' }])
  }

  const updateOtherContact = (index, patch) => {
    const others = Array.isArray(mergedSettings.contacts.others) ? mergedSettings.contacts.others : []
    const next = others.map((c, i) => (i === index ? { ...(c || {}), ...patch } : c))
    updateSetting(['contacts', 'others'], next)
  }

  const removeOtherContact = (index) => {
    const others = Array.isArray(mergedSettings.contacts.others) ? mergedSettings.contacts.others : []
    updateSetting(['contacts', 'others'], others.filter((_, i) => i !== index))
  }

  const save = async () => {
    setSaving(true)
    try {
      let payload = mergedSettings

      if (activeTab === 'json') {
        const parsed = JSON.parse(jsonText)
        payload = parsed
        setSettings(parsed)
      }

      await citySettingsAPI.save(payload)
      toast.success('Informations de la ville enregistrées')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de l’enregistrement')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const resetDefaults = () => {
    setSettings(defaultSettings())
    toast.success('Valeurs par défaut appliquées')
  }

  const updateLogo = async (nextUrl) => {
    setLogoSaving(true)
    try {
      setLogoUrl(nextUrl || '')
      await cityProfileAPI.updateLogo(nextUrl || null)
      updateCity?.({ logo_url: nextUrl || '' })
      toast.success('Logo enregistré')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la mise à jour du logo')
      console.error(err)
    } finally {
      setLogoSaving(false)
    }
  }

  if (loading) {
    return <div className="page-loading">Chargement…</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <Info size={22} aria-hidden="true" />
            Informations de la ville
          </h1>
          <p>Adresse, contacts, horaires et infos pratiques.</p>
        </div>

        <div className="city-info-actions">
          <Button variant="secondary" onClick={resetDefaults} disabled={saving}>
            Réinitialiser
          </Button>
          <Button variant="primary" onClick={save} disabled={saving} icon={<Save size={16} />}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'form' ? 'active' : ''}`} onClick={() => setActiveTab('form')}>
          Formulaire
        </button>
        <button className={`tab ${activeTab === 'json' ? 'active' : ''}`} onClick={() => setActiveTab('json')}>
          JSON
        </button>
      </div>

      {activeTab === 'json' ? (
        <div className="form-section">
          <div className="form-section-title">Édition JSON</div>
          <div className="form-group">
            <textarea
              className="form-input city-info-json"
              rows={18}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="city-info-hint">
            Structure attendue (exemple) : address, contacts, opening_hours, waste_collection.
          </div>
        </div>
      ) : (
        <>
          <div className="form-section">
            <div className="form-section-title">Logo</div>
            <ImageUploadField
              label="Logo de la ville"
              helpText="JPEG, PNG ou WebP (max 5MB). Redimensionné automatiquement en 512×512 max."
              value={logoUrl}
              disabled={saving || logoSaving}
              uploadFn={async (file) => {
                const res = await uploadsAPI.uploadLogo(file)
                return res.data
              }}
              onChangeUrl={(url) => updateLogo(url)}
            />
          </div>

          <div className="form-section">
            <div className="form-section-title">Adresse</div>
            <Input
              label="Adresse"
              placeholder="1 place de la mairie"
              value={mergedSettings.address || ''}
              onChange={(e) => updateSetting(['address'], e.target.value)}
            />
          </div>

          <div className="form-section">
            <div className="form-section-title">Contacts</div>
            <div className="form-row">
              <Input
                label="Téléphone principal"
                placeholder="01 02 03 04 05"
                value={mergedSettings.contacts.phone || ''}
                onChange={(e) => updateSetting(['contacts', 'phone'], e.target.value)}
              />
              <Input
                label="Email principal"
                placeholder="contact@ville.fr"
                value={mergedSettings.contacts.email || ''}
                onChange={(e) => updateSetting(['contacts', 'email'], e.target.value)}
              />
              <Input
                label="Site internet"
                placeholder="https://ville.fr"
                value={mergedSettings.contacts.website || ''}
                onChange={(e) => updateSetting(['contacts', 'website'], e.target.value)}
              />
            </div>

            <div className="form-row">
              <Input
                label="Facebook"
                placeholder="https://facebook.com/..."
                value={mergedSettings.contacts.facebook || ''}
                onChange={(e) => updateSetting(['contacts', 'facebook'], e.target.value)}
              />
              <Input
                label="Instagram"
                placeholder="https://instagram.com/..."
                value={mergedSettings.contacts.instagram || ''}
                onChange={(e) => updateSetting(['contacts', 'instagram'], e.target.value)}
              />
              <Input
                label="TikTok"
                placeholder="https://tiktok.com/@..."
                value={mergedSettings.contacts.tiktok || ''}
                onChange={(e) => updateSetting(['contacts', 'tiktok'], e.target.value)}
              />
              <Input
                label="X (Twitter)"
                placeholder="https://x.com/..."
                value={mergedSettings.contacts.x || ''}
                onChange={(e) => updateSetting(['contacts', 'x'], e.target.value)}
              />
            </div>

            <div className="city-info-subheader">
              <div>Autres contacts</div>
              <Button variant="secondary" size="sm" onClick={addOtherContact} icon={<Plus size={16} />}>
                Ajouter
              </Button>
            </div>

            <div className="city-info-list">
              {mergedSettings.contacts.others.length === 0 ? (
                <div className="city-info-empty">Aucun contact supplémentaire</div>
              ) : (
                mergedSettings.contacts.others.map((c, index) => (
                  <div className="city-info-list-row" key={index}>
                    <Input
                      label="Nom"
                      placeholder="Accueil mairie"
                      value={c?.label || ''}
                      onChange={(e) => updateOtherContact(index, { label: e.target.value })}
                    />

                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        className="form-input"
                        value={c?.type || 'phone'}
                        onChange={(e) => updateOtherContact(index, { type: e.target.value })}
                      >
                        <option value="phone">Téléphone</option>
                        <option value="email">Email</option>
                        <option value="link">Lien</option>
                      </select>
                    </div>

                    <Input
                      label="Valeur"
                      placeholder="01 02... / contact@... / https://..."
                      value={c?.value || ''}
                      onChange={(e) => updateOtherContact(index, { value: e.target.value })}
                    />

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeOtherContact(index)}
                      icon={<Trash2 size={16} />}
                      aria-label="Supprimer"
                      title="Supprimer"
                    >
                      Supprimer
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Horaires d’ouverture</div>
            <div className="form-row">
              {DAYS.map((d) => (
                <Input
                  key={d.key}
                  label={d.label}
                  placeholder="09:00-12:00 / 14:00-17:00"
                  value={mergedSettings.opening_hours[d.key] || ''}
                  onChange={(e) => updateSetting(['opening_hours', d.key], e.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Collecte des déchets</div>

            <div className="city-info-checkbox-grid">
              {DAYS.map((d) => (
                <label className="city-info-checkbox" key={d.value}>
                  <input
                    type="checkbox"
                    checked={mergedSettings.waste_collection.days.includes(d.value)}
                    onChange={() => toggleWasteDay(d.value)}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>

            <Input
              label="Recyclage (jour ou précision)"
              placeholder="Wednesday"
              value={mergedSettings.waste_collection.recycling || ''}
              onChange={(e) => updateSetting(['waste_collection', 'recycling'], e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  )
}
