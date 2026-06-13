'use client';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * ClientShell — Client-side wrapper for auth-gated rendering.
 * Public routes (login) render directly. All others go through AuthGuard.
 */
export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname?.startsWith(r));

  if (isPublicRoute) return children;
  return <AuthGuard>{children}</AuthGuard>;
}
