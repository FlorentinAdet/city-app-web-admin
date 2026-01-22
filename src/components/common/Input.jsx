import './Input.css'

export default function Input({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  error,
  multiline = false,
  rows = 4
}) {
  const InputElement = multiline ? 'textarea' : 'input'
  
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <InputElement
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input ${error ? 'input-error' : ''}`}
        rows={multiline ? rows : undefined}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
