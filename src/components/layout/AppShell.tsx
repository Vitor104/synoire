import { useEffect, useId, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { StudyPartnersSidebar } from '@/components/dashboard/StudyPartnersSidebar'
import { useStudyPartners } from '@/contexts/StudyPartnersContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-firefly-dim text-firefly'
      : 'text-secondary hover:bg-elevated hover:text-primary',
  ].join(' ')

const NAV_LINKS_BEFORE_PARTNERS: readonly { to: string; label: string; end?: boolean }[] = [
  { to: '/painel', label: 'Painel', end: true },
  { to: '/hubs', label: 'Hubs' },
]

const NAV_LINKS_AFTER_PARTNERS: readonly { to: string; label: string; end?: boolean }[] = [
  { to: '/perfil', label: 'Perfil' },
]

function ShellNavItems({
  partnersOpen,
  pendingCount,
  onOpenPartners,
  onNavigate,
}: {
  partnersOpen: boolean
  pendingCount: number
  onOpenPartners: () => void
  onNavigate?: () => void
}) {
  const linkExtra = onNavigate ? { onClick: onNavigate } : {}

  return (
    <>
      {NAV_LINKS_BEFORE_PARTNERS.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={navClass} {...linkExtra}>
          {label}
        </NavLink>
      ))}
      <PartnersNavButton
        onClick={onOpenPartners}
        pendingCount={pendingCount}
        isOpen={partnersOpen}
      />
      {NAV_LINKS_AFTER_PARTNERS.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={navClass} {...linkExtra}>
          {label}
        </NavLink>
      ))}
    </>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden>
      <span
        className={[
          'absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-primary transition-transform duration-200',
          open ? 'translate-y-1.5 rotate-45' : '',
        ].join(' ')}
      />
      <span
        className={[
          'absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-primary transition-opacity duration-200',
          open ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      />
      <span
        className={[
          'absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-primary transition-transform duration-200',
          open ? '-translate-y-1.5 -rotate-45' : '',
        ].join(' ')}
      />
    </span>
  )
}

function PartnersNavButton({
  onClick,
  pendingCount,
  isOpen,
}: {
  onClick: () => void
  pendingCount: number
  isOpen: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={[
        'relative w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
        isOpen
          ? 'bg-firefly-dim text-firefly'
          : 'text-secondary hover:bg-elevated hover:text-primary',
      ].join(' ')}
    >
      Parceiros
      {pendingCount > 0 && (
        <span className="absolute right-2 top-1/2 flex h-4 min-w-4 -translate-y-1/2 items-center justify-center rounded-full bg-firefly/20 px-1 text-[10px] font-medium tabular-nums text-firefly">
          {pendingCount}
        </span>
      )}
    </button>
  )
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [partnersOpen, setPartnersOpen] = useState(false)
  const location = useLocation()
  const menuPanelId = useId()
  const prefersReducedMotion = usePrefersReducedMotion()
  const { incomingInvites } = useStudyPartners()
  const pendingCount = incomingInvites.length

  const openPartners = () => {
    setMenuOpen(false)
    setPartnersOpen(true)
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 769px)')
    if (!mq.matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(min-width: 770px)')
    const onWide = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onWide)
    return () => mq.removeEventListener('change', onWide)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col min-[770px]:flex-row">
      {/* Barra + menu sanduíche: 320px–769px */}
      <header className="sticky top-0 z-50 flex min-[770px]:hidden items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-primary transition hover:border-firefly/40 hover:bg-surface"
          aria-expanded={menuOpen}
          aria-controls={menuPanelId}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
        <NavLink
          to="/"
          className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/logoSynoire.svg"
            alt="Synoire"
            className="ml-auto block h-auto max-h-10 w-auto max-w-[10rem] object-contain object-right"
          />
        </NavLink>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 min-[770px]:hidden bg-night/75 backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id={menuPanelId}
            role="navigation"
            aria-label="Navegação principal"
            className="fixed left-0 right-0 top-16 z-50 max-h-[min(calc(100dvh-4rem),32rem)] min-[770px]:hidden overflow-y-auto border-b border-border bg-surface px-3 py-4 shadow-xl"
          >
            <nav className="flex flex-col gap-1">
              <ShellNavItems
                partnersOpen={partnersOpen}
                pendingCount={pendingCount}
                onOpenPartners={openPartners}
                onNavigate={() => setMenuOpen(false)}
              />
            </nav>
            <div className="mt-4 border-t border-border pt-4">
              <NavLink
                to="/entrar"
                className="block rounded-lg px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                Sair (stub)
              </NavLink>
            </div>
          </div>
        </>
      )}

      <aside className="hidden min-[770px]:flex w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-6">
        <div className="mb-8 px-2">
          <NavLink
            to="/"
            className="block w-full max-w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <img
              src="/logoSynoire.svg"
              alt="Synoire"
              className="block h-auto w-full max-h-28 object-contain object-left sm:max-h-32"
            />
          </NavLink>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <ShellNavItems
            partnersOpen={partnersOpen}
            pendingCount={pendingCount}
            onOpenPartners={openPartners}
          />
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <NavLink
            to="/entrar"
            className="block rounded-lg px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
          >
            Sair (stub)
          </NavLink>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-night p-6 md:p-10">
        <Outlet />
      </main>

      <StudyPartnersSidebar
        open={partnersOpen}
        onClose={() => setPartnersOpen(false)}
        prefersReducedMotion={prefersReducedMotion}
      />
    </div>
  )
}
