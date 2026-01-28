import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import './PublicRegistrationFormPage.css'

const ensureDefinition = (definition) => {
  if (definition && typeof definition === 'object' && !Array.isArray(definition)) {
    const fields = Array.isArray(definition.fields) ? definition.fields : []
    return { version: 1, ...definition, fields }
  }
  return { version: 1, fields: [] }
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

export default function PublicRegistrationFormPage() {
  const { citySlug, formSlug } = useParams()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [personsCount, setPersonsCount] = useState(1)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const res = await api.get(`/public/registration-forms/${encodeURIComponent(citySlug)}/${encodeURIComponent(formSlug)}`)
        if (cancelled) return
        const f = res?.data
        setForm(f)

        const def = ensureDefinition(f?.definition)
        const init = {}
        for (const field of def.fields) {
          if (field?.type === 'checkbox') init[field.id] = false
          else init[field.id] = ''
        }
        setAnswers(init)
        setPersonsCount(1)
      } catch (e) {
        if (cancelled) return
        const msg = e?.response?.data?.error || 'Impossible de charger le formulaire.'
        setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (citySlug && formSlug) run()

    return () => {
      cancelled = true
    }
  }, [citySlug, formSlug])

  const definition = useMemo(() => ensureDefinition(form?.definition), [form])
  const fields = definition.fields

  const isFieldVisible = (field) => {
    const rule = field?.visibleWhen
    if (!rule || !rule.fieldId) return true
    const left = answers?.[rule.fieldId]
    const right = rule.value
    return String(left ?? '') === String(right ?? '')
  }

  const handleChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field.id]: value }))
    if (fieldErrors[field.id]) {
      setFieldErrors((prev) => ({ ...prev, [field.id]: '' }))
    }
  }

  const validate = () => {
    const errs = {}
    for (const field of fields) {
      if (!isFieldVisible(field)) continue
      if (!field?.required) continue
      const v = answers?.[field.id]
      if (field.type === 'checkbox') {
        if (!v) errs[field.id] = 'Ce champ est requis'
      } else {
        if (String(v ?? '').trim() === '') errs[field.id] = 'Ce champ est requis'
      }
    }
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')

    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      const body = {
        data: answers,
        persons_count: form?.capacity_mode?.toUpperCase?.() === 'PERSONS' ? Number(personsCount || 1) : 1
      }

      const res = await api.post(
        `/public/registration-forms/${encodeURIComponent(citySlug)}/${encodeURIComponent(formSlug)}/submissions`,
        body
      )

      const remaining = res?.data?.remaining
      setSuccess(remaining === null || remaining === undefined ? 'Inscription envoyée avec succès.' : `Inscription envoyée. Places restantes: ${remaining}`)
    } catch (e2) {
      const status = e2?.response?.status
      const msg = e2?.response?.data?.error || 'Erreur lors de l’envoi.'
      if (status === 409) {
        setError('Complet: la capacité est atteinte.')
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="public-form-page">
        <div className="public-form-card">
          <div className="public-form-title">Chargement…</div>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="public-form-page">
        <div className="public-form-card">
          <div className="public-form-title">Formulaire indisponible</div>
          <div className="public-form-error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-form-page">
      <div className="public-form-card">
        <div className="public-form-title">{form?.titre || 'Inscription'}</div>
        {form?.description ? <div className="public-form-subtitle">{form.description}</div> : null}

        {error ? <div className="public-form-error">{error}</div> : null}
        {success ? <div className="public-form-success">{success}</div> : null}

        <form onSubmit={onSubmit} className="public-form">
          {form?.capacity_mode?.toUpperCase?.() === 'PERSONS' && (
            <div className="public-field">
              <label className="public-label">Nombre de personnes</label>
              <input
                className="public-input"
                type="number"
                min={1}
                value={personsCount}
                onChange={(e) => setPersonsCount(e.target.value)}
              />
              <div className="public-help">Le formulaire compte en nombre de personnes.</div>
            </div>
          )}

          {fields.map((field) => {
            if (!isFieldVisible(field)) return null
            const err = fieldErrors[field.id]

            return (
              <div key={field.id} className="public-field">
                <label className="public-label">
                  {field.label || field.id}
                  {field.required ? <span className="public-required">*</span> : null}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    className={`public-input ${err ? 'error' : ''}`}
                    rows={4}
                    placeholder={field.placeholder || ''}
                    value={answers[field.id] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className={`public-input ${err ? 'error' : ''}`}
                    value={answers[field.id] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                  >
                    <option value="">—</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <label className="public-checkbox-row">
                    <input
                      type="checkbox"
                      checked={!!answers[field.id]}
                      onChange={(e) => handleChange(field, e.target.checked)}
                    />
                    <span>{field.placeholder || `Valider (${typeLabel(field.type)})`}</span>
                  </label>
                ) : (
                  <input
                    className={`public-input ${err ? 'error' : ''}`}
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder || ''}
                    value={answers[field.id] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                )}

                {err ? <div className="public-field-error">{err}</div> : null}
              </div>
            )
          })}

          <button className="public-submit" type="submit" disabled={submitting}>
            {submitting ? 'Envoi…' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  )
}
