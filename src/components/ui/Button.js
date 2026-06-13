import React from 'react';

/**
 * Modern Button Component
 * Base UI for Estrategia 365
 */
export default function Button({
  children,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md', // sm | md | lg
  isLoading = false,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  onClick,
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled || isLoading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
      color: '#ffffff',
      boxShadow: 'var(--shadow-level-2)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(8px)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'rgba(231, 76, 60, 0.1)',
      color: 'var(--error-color)',
      border: '1px solid rgba(231, 76, 60, 0.2)',
    }
  };

  const sizes = {
    sm: { padding: '0.4rem 0.8rem', fontSize: '0.85rem' },
    md: { padding: '0.6rem 1.25rem', fontSize: '0.95rem' },
    lg: { padding: '0.8rem 1.75rem', fontSize: '1.05rem', fontWeight: 600 },
  };

  const style = {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button 
      className={`ui-btn ${className}`} 
      style={style} 
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
      onMouseEnter={(e) => {
        if (disabled || isLoading) return;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = 'var(--text-primary)';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'var(--error-color)';
          e.currentTarget.style.color = '#fff';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled || isLoading) return;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.filter = 'none';
        e.currentTarget.style.boxShadow = variants[variant].boxShadow || 'none';
        e.currentTarget.style.background = variants[variant].background;
        e.currentTarget.style.borderColor = variants[variant].border ? variants[variant].border.split(' ')[2] : 'transparent';
        e.currentTarget.style.color = variants[variant].color;
      }}
      onFocus={(e) => {
        if (!disabled) e.currentTarget.style.boxShadow = '0 0 0 2px var(--bg-color), 0 0 0 4px var(--accent-primary)';
      }}
      onBlur={(e) => {
        if (!disabled) e.currentTarget.style.boxShadow = variants[variant].boxShadow || 'none';
      }}
    >
      {isLoading ? (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
