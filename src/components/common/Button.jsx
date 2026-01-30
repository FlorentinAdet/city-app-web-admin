import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  icon,
  iconOnly = false,
  onClick,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}${iconOnly ? ' btn-icon-only' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  )
}
