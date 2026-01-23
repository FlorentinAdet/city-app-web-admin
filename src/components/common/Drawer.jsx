import { useEffect } from 'react'
import './Drawer.css'
import { X } from 'lucide-react'

export default function Drawer({ isOpen, onClose, title, children, width = 520 }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <button className="drawer-close" onClick={onClose} aria-label="Fermer">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}
