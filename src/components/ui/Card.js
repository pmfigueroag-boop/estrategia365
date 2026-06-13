import React from 'react';

/**
 * Modern Card Component
 * Base UI for Estrategia 365
 */
export default function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  variant = 'glass', // glass | solid
  padding = '1.5rem',
  hoverEffect = false,
  ...props
}) {
  const baseStyle = {
    borderRadius: '12px',
    padding: padding,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const variants = {
    glass: {
      background: 'var(--surface-color)', // defined in globals.css
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--surface-border)',
      boxShadow: 'var(--shadow-level-1)',
    },
    solid: {
      background: '#142132', // slightly lighter than #0A1A2F
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: 'var(--shadow-level-1)',
    }
  };

  return (
    <div 
      className={`ui-card ${className}`}
      style={{ ...baseStyle, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = variants[variant].boxShadow;
          e.currentTarget.style.borderColor = variants[variant].border.split(' ')[2];
        }
      }}
      {...props}
    >
      {(title || headerAction) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1.25rem' 
        }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className="ui-card-content" style={{ flex: 1 }}>
        {children}
      </div>

      {footer && (
        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}
