'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

/**
 * Mobile Bottom Navigation
 * Provides quick access to main domains for mobile users.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Show only on mobile screens (768px or less)
      setIsVisible(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  // Don't show on auth/landing pages
  if (['/', '/login', '/register', '/forgot-password', '/reset-password', '/select-tenant', '/select-plan'].includes(pathname)) return null;

  const NAV_ITEMS = [
    { href: '/dashboard', label: 'Command', icon: '📊' },
    { href: '/strategy', label: 'Strategy', icon: '♟️' },
    // { href: '/hoshin', label: 'Hoshin', icon: '🔗' }, // POST-MVP
    { href: '/execution', label: 'Control', icon: '⚡' },
  ];

  const isActive = (href) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the bottom nav */}
      <div style={{ height: '70px', display: 'block', width: '100%' }} aria-hidden="true" />
      
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface-color)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.75rem 0.5rem calc(0.75rem + env(safe-area-inset-bottom))',
        zIndex: 1000,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
      }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '64px',
              }}
            >
              <div style={{ 
                fontSize: '1.4rem', 
                marginBottom: '0.25rem',
                transform: active ? 'scale(1.15) translateY(-2px)' : 'scale(1) translateY(0)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: active ? 'drop-shadow(0 2px 8px rgba(47,212,197,0.4))' : 'none',
              }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.01em'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
