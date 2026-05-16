import { Link } from 'react-router-dom'
import { LandingButton } from '@/components/landing/primitives'

export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-night/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
        >
          <img
            src="/logoSynoire.svg"
            alt="Synoire"
            className="h-5 w-auto sm:h-6"
            width={120}
            height={24}
          />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <LandingButton to="/entrar" variant="ghost" className="px-4 py-2.5">
            Entrar
          </LandingButton>
          <LandingButton to="/entrar" variant="primary" className="px-4 py-2.5">
            Criar conta
          </LandingButton>
        </nav>
      </div>
    </header>
  )
}
