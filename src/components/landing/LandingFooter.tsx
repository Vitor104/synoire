import { Link } from 'react-router-dom'
import { FireflyIcon } from '@/components/landing/FireflyIcon'

const LINKS = [
  { label: 'Produto', href: '/hubs' },
  { label: 'Sobre', href: '#' },
  { label: 'Política de Privacidade', href: '/privacy' },
  { label: 'Termos', href: '#' },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 px-6 py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
        >
          <FireflyIcon className="h-2 w-2" />
          <span className="text-sm font-semibold text-primary">Synoire</span>
        </Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      </div>
    </footer>
  )
}
