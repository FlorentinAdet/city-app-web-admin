import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  icon,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  )
}
