import React, { useEffect } from 'react'
import './Toast.css'

const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => onClose(id)} aria-label="Fermer">
        ×
      </button>
    </div>
  )
}

export default Toast
