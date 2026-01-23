import React from 'react';
import './Input.css';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
  required,
  className,
  name,
  multiline = false,
  rows = 4,
  ...props
}, ref) => {
  const InputElement = multiline ? 'textarea' : 'input';
  
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <InputElement
        ref={ref}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-input ${error ? 'error' : ''} ${className || ''}`}
        rows={multiline ? rows : undefined}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
