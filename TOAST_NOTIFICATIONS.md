# Système de notifications Toast

## Description

Le système de notifications toast permet d'afficher des retours utilisateurs lors des actions CRUD (création, modification, suppression) et autres actions importantes dans l'application.

## Caractéristiques

- **Position** : Bas à gauche de l'écran
- **Code couleur** :
  - ✅ Vert pour les succès
  - ❌ Rouge pour les erreurs
  - ℹ️ Bleu pour les informations
  - ⚠️ Orange pour les avertissements
- **Animation** : Apparition/disparition en slide depuis la gauche
- **Durée** : 5 secondes par défaut (configurable)
- **Fermeture** : Automatique après la durée ou manuelle via le bouton ×

## Utilisation

### Import

```jsx
import { useToast } from '../context/ToastContext'
```

### Dans un composant

```jsx
function MonComposant() {
  const toast = useToast()

  const handleAction = async () => {
    try {
      // Votre action
      await api.create(data)
      toast.success('Élément créé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  return (
    // ...
  )
}
```

### Méthodes disponibles

- `toast.success(message, duration?)` - Notification de succès (vert)
- `toast.error(message, duration?)` - Notification d'erreur (rouge)
- `toast.info(message, duration?)` - Notification d'information (bleu)
- `toast.warning(message, duration?)` - Notification d'avertissement (orange)

## Fichiers concernés

### Composants créés
- `/src/components/common/Toast.jsx` - Composant de notification individuelle
- `/src/components/common/Toast.css` - Styles du toast
- `/src/context/ToastContext.jsx` - Contexte et provider pour gérer les notifications

### Fichiers modifiés
- `/src/App.jsx` - Ajout du ToastProvider
- `/src/hooks/useQuickEditEntity.js` - Remplacement des alertes par des toasts
- `/src/pages/UsersPage.jsx` - Notifications pour les actions utilisateurs
- `/src/pages/AdminPanelPage.jsx` - Notifications pour les actions admin
- `/src/pages/LoginPage.jsx` - Notification de connexion
- `/src/components/common/ImageUploadField.jsx` - Notification d'upload d'image

### Pages bénéficiant automatiquement via useQuickEditEntity
- `/src/pages/NewsPage.jsx` - Gestion des actualités
- `/src/pages/EventsPage.jsx` - Gestion des événements
- `/src/pages/ReportsPage.jsx` - Gestion des signalements

## Exemples d'utilisation

### Création d'un élément
```jsx
try {
  await api.create(formData)
  toast.success('Article créé avec succès')
} catch (error) {
  toast.error('Erreur lors de la création de l\'article')
}
```

### Modification d'un élément
```jsx
try {
  await api.update(id, formData)
  toast.success('Article modifié avec succès')
} catch (error) {
  toast.error('Erreur lors de la modification')
}
```

### Suppression d'un élément
```jsx
if (confirm('Êtes-vous sûr ?')) {
  try {
    await api.delete(id)
    toast.success('Article supprimé avec succès')
  } catch (error) {
    toast.error('Erreur lors de la suppression')
  }
}
```

### Upload d'image
```jsx
try {
  const result = await uploadFn(file)
  toast.success('Image uploadée avec succès')
} catch (error) {
  toast.error('Erreur lors de l\'upload')
}
```

## Personnalisation

Pour modifier la durée d'affichage par défaut, éditez `/src/context/ToastContext.jsx` :

```jsx
const success = useCallback((message, duration = 5000) => addToast(message, 'success', duration), [addToast])
```

Pour modifier l'apparence, éditez `/src/components/common/Toast.css`.
