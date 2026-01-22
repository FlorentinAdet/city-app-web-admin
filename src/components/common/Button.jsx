import './Button.css'

export default function Button({ children, variant = 'primary', onClick, disabled, type = 'button', icon }) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}
