import { Link, useNavigate } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function AuthPage() {
  const navigate = useNavigate()
  const supabaseReady = isSupabaseConfigured && getSupabase()

  const goToPainel = () => {
    navigate('/painel')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-primary">Entrar</h1>
      <p className="mt-2 text-sm text-secondary">
        {demoMode
          ? 'Modo demo: navegue pelo app sem Supabase (apenas front-end).'
          : 'Fluxo de auth com Supabase será ligado aqui (e-mail / OAuth).'}
      </p>
      {demoMode && (
        <p className="mt-6 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-secondary">
          Nenhuma conta é criada e nada é enviado à rede. Use os botões abaixo
          para ir ao painel.
        </p>
      )}
      {!demoMode && !supabaseReady && (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Defina <code className="text-amber-100">VITE_SUPABASE_URL</code> e{' '}
          <code className="text-amber-100">VITE_SUPABASE_ANON_KEY</code> no
          arquivo <code className="text-amber-100">.env</code> para habilitar o
          cliente.
        </p>
      )}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          disabled={!demoMode}
          onClick={demoMode ? goToPainel : undefined}
          className={
            demoMode
              ? 'w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-primary transition hover:bg-elevated'
              : 'w-full cursor-not-allowed rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-secondary'
          }
        >
          Continuar com e-mail (stub)
        </button>
        <button
          type="button"
          disabled={!demoMode}
          onClick={demoMode ? goToPainel : undefined}
          className={
            demoMode
              ? 'w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-primary transition hover:bg-elevated'
              : 'w-full cursor-not-allowed rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-secondary'
          }
        >
          Continuar com Google (stub)
        </button>
      </div>
      <Link
        to="/"
        className="mt-10 inline-block text-sm text-secondary hover:text-primary"
      >
        ← Voltar
      </Link>
    </div>
  )
}
