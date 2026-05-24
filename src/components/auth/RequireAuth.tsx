import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) {
    return <Outlet />
  }

  if (isLoading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-night text-secondary"
        aria-busy="true"
        aria-label="Carregando sessão"
      >
        <span className="text-sm">Carregando…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}
