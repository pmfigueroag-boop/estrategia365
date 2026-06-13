import React, { useState } from 'react';

/**
 * Modern Input Component with Floating Label
 * Base UI for Estrategia 365
 */
export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  icon,
  className = '',
  required = false,
  fullWidth = true,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue || type === 'date' || type === 'time';

  return (
    <div 
      className={`ui-input-wrapper ${className}`} 
      style={{ 
        position: 'relative', 
        width: fullWidth ? '100%' : 'auto', 
        marginBottom: '1.25rem' 
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div style={{ 
            position: 'absolute', 
            left: '1rem', 
            color: error ? 'var(--error-color)' : isFocused ? 'var(--accent-primary)' : 'var(--text-tertiary)', 
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={(e) => { setIsFocused(true); if (props.onFocus) props.onFocus(e); }}
          onBlur={(e) => { setIsFocused(false); if (props.onBlur) props.onBlur(e); }}
          required={required}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${error ? 'var(--error-color)' : isFocused ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.12)'}`,
            borderRadius: '8px',
            padding: `1.4rem 1rem 0.5rem ${icon ? '2.5rem' : '1rem'}`,
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: isFocused ? `0 0 0 3px ${error ? 'rgba(231,76,60,0.15)' : 'rgba(47,212,197,0.15)'}` : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'inherit',
          }}
          {...props}
        />
        <label
          htmlFor={id}
          style={{
            position: 'absolute',
            left: icon ? '2.5rem' : '1rem',
            top: isFloating ? '0.45rem' : '50%',
            transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: isFloating ? '0.75rem' : '0.95rem',
            color: error ? 'var(--error-color)' : isFocused ? 'var(--accent-primary)' : 'var(--text-secondary)',
            pointerEvents: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: isFloating ? 500 : 400,
            letterSpacing: isFloating ? '0.02em' : 'normal',
          }}
        >
          {label} {required && <span style={{ color: 'var(--error-color)' }}>*</span>}
        </label>
      </div>
      {error && (
        <div style={{ 
          color: 'var(--error-color)', 
          fontSize: '0.8rem', 
          marginTop: '0.4rem', 
          marginLeft: '0.2rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
