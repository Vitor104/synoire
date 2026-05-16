import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { LandingButton } from '@/components/landing/primitives'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { pageStaggerEase } from '@/motion/pageStagger'

export function LandingNavbar() {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-night/80 backdrop-blur-md"
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: pageStaggerEase }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
        >
          <img
            src="/logoSynoire.svg"
            alt="Synoire"
            className="h-auto w-36 object-contain object-left sm:w-40 md:w-44"
            width={176}
            height={48}
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
    </motion.header>
  )
}
