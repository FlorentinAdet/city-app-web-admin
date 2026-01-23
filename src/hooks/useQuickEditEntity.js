import { useCallback, useEffect, useMemo, useState } from 'react'

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

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchAll()
      setItems(response?.data || [])
    } catch (error) {
      console.error(mergedMessages.loadError, error)
      alert(mergedMessages.loadError)
    } finally {
      setLoading(false)
    }
  }, [fetchAll, mergedMessages.loadError])

  useEffect(() => {
    refresh()
  }, [refresh])

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingItem(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormData(initialFormData)
    setErrors({})
    setIsDrawerOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setFormData(mapItemToFormData ? mapItemToFormData(item) : initialFormData)
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
        await updateItem(editingItem.id, formData)
      } else {
        await createItem(formData)
      }

      await refresh()
      closeDrawer()
      alert(editingItem ? mergedMessages.updateSuccess : mergedMessages.createSuccess)
    } catch (error) {
      console.error(mergedMessages.saveError, error)
      alert(mergedMessages.saveError)
    }
  }

  const handleDelete = async (item) => {
    if (!item) return
    if (!confirm(mergedMessages.confirmDelete)) return

    try {
      await deleteItem(item.id)
      await refresh()
      if (editingItem?.id === item.id) {
        closeDrawer()
      }
      alert(mergedMessages.deleteSuccess)
    } catch (error) {
      console.error(mergedMessages.deleteError, error)
      alert(mergedMessages.deleteError)
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
