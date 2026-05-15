import { NavLink, Outlet } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-firefly-dim text-firefly'
      : 'text-secondary hover:bg-elevated hover:text-primary',
  ].join(' ')

export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-6">
        <div className="mb-8 px-2">
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">
            Synoire
          </p>
          <p className="mt-1 text-sm text-primary">Modo foco</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/painel" className={navClass} end>
            Painel
          </NavLink>
          <NavLink to="/hubs" className={navClass}>
            Hubs
          </NavLink>
          <NavLink to="/salas/demo" className={navClass}>
            Sala de estudo
          </NavLink>
          <NavLink to="/perfil" className={navClass}>
            Perfil
          </NavLink>
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
    </div>
  )
}
