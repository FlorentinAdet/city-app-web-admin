import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'

const ConfirmDialogContext = createContext(null)

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)

  const closeWith = useCallback((value) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setDialog(null)
    if (resolve) resolve(value)
  }, [])

  const confirm = useCallback((options) => {
    const normalized = typeof options === 'string' ? { message: options } : (options || {})

    const nextDialog = {
      title: normalized.title || 'Confirmation',
      message: normalized.message || 'Confirmer cette action ?',
      confirmText: normalized.confirmText || 'Confirmer',
      cancelText: normalized.cancelText || 'Annuler',
      confirmVariant: normalized.confirmVariant || 'danger',
      cancelVariant: normalized.cancelVariant || 'secondary'
    }

    // If a dialog is already open, cancel it.
    if (resolverRef.current) {
      try {
        resolverRef.current(false)
      } catch {
        // ignore
      }
    }

    setDialog(nextDialog)

    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Modal
        isOpen={Boolean(dialog)}
        onClose={() => closeWith(false)}
        title={dialog?.title}
        size="small"
        footer={
          <>
            <Button variant={dialog?.cancelVariant || 'secondary'} onClick={() => closeWith(false)}>
              {dialog?.cancelText || 'Annuler'}
            </Button>
            <Button variant={dialog?.confirmVariant || 'danger'} onClick={() => closeWith(true)}>
              {dialog?.confirmText || 'Confirmer'}
            </Button>
          </>
        }
      >
        <div style={{ lineHeight: 1.5 }}>{dialog?.message}</div>
      </Modal>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}
