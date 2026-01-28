import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useConfirmDialog } from '../context/ConfirmDialogContext'

export default function useQuickEditEntity({
  fetchAll,
  createItem,
  updateItem,
  deleteItem,
  initialFormData,
  mapItemToFormData,
  validate,
  messages
}) {
  const toast = useToast()
  const { confirm } = useConfirmDialog()
  const mergedMessages = useMemo(
    () => ({
      loadError: 'Erreur lors du chargement',
      saveError: 'Erreur lors de la sauvegarde',
      deleteError: 'Erreur lors de la suppression',
      createSuccess: 'Création effectuée',
      updateSuccess: 'Mise à jour effectuée',
      deleteSuccess: 'Suppression effectuée',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
      ...messages
    }),
    [messages]
  )

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})

  // Keep latest callbacks/messages without re-creating refresh/effects.
  const handlersRef = useRef({ fetchAll, createItem, updateItem, deleteItem })
  const messagesRef = useRef(mergedMessages)
  const initialFormDataRef = useRef(initialFormData)
  const mountedRef = useRef(true)
  const refreshInFlightRef = useRef(false)

  useEffect(() => {
    handlersRef.current = { fetchAll, createItem, updateItem, deleteItem }
  }, [fetchAll, createItem, updateItem, deleteItem])

  useEffect(() => {
    messagesRef.current = mergedMessages
  }, [mergedMessages])

  useEffect(() => {
    initialFormDataRef.current = initialFormData
  }, [initialFormData])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const resolveMessage = useCallback((key, error) => {
    const msg = messagesRef.current?.[key]
    if (typeof msg === 'function') return msg(error)

    // For load errors, surface backend reason when available.
    if (key === 'loadError') {
      const backend = error?.response?.data?.error
      if (backend) return backend
    }

    return msg
  }, [])

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) return
    refreshInFlightRef.current = true
    setLoading(true)
    try {
      const response = await handlersRef.current.fetchAll()
      if (!mountedRef.current) return
      setItems(response?.data || [])
    } catch (error) {
      const msg = resolveMessage('loadError', error) || 'Erreur lors du chargement'
      console.error(msg, error)
      toast.error(msg)
    } finally {
      if (mountedRef.current) setLoading(false)
      refreshInFlightRef.current = false
    }
  }, [resolveMessage, toast])

  useEffect(() => {
    refresh()
    // Intentionally run on mount only; refresh is stable and uses refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingItem(null)
    setFormData(initialFormDataRef.current)
    setErrors({})
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormData(initialFormDataRef.current)
    setErrors({})
    setIsDrawerOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setFormData(mapItemToFormData ? mapItemToFormData(item) : initialFormDataRef.current)
    setErrors({})
    setIsDrawerOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate ? validate(formData) : {}
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      if (editingItem) {
        await handlersRef.current.updateItem(editingItem.id, formData)
      } else {
        await handlersRef.current.createItem(formData)
      }

      await refresh()
      closeDrawer()
      toast.success(editingItem ? messagesRef.current.updateSuccess : messagesRef.current.createSuccess)
    } catch (error) {
      const msg = resolveMessage('saveError', error) || 'Erreur lors de la sauvegarde'
      console.error(msg, error)
      toast.error(msg)
    }
  }

  const handleDelete = async (item) => {
    if (!item) return
    const shouldDelete = await confirm({
      title: 'Confirmer la suppression',
      message: messagesRef.current.confirmDelete,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmVariant: 'danger',
      cancelVariant: 'secondary'
    })

    if (!shouldDelete) return

    try {
      await handlersRef.current.deleteItem(item.id)
      await refresh()
      if (editingItem?.id === item.id) {
        closeDrawer()
      }
      toast.success(messagesRef.current.deleteSuccess)
    } catch (error) {
      const msg = resolveMessage('deleteError', error) || 'Erreur lors de la suppression'
      console.error(msg, error)
      toast.error(msg)
    }
  }

  return {
    items,
    loading,
    refresh,
    isDrawerOpen,
    editingItem,
    formData,
    errors,
    setFormData,
    setErrors,
    openCreate,
    openEdit,
    closeDrawer,
    handleInputChange,
    handleSubmit,
    handleDelete
  }
}
