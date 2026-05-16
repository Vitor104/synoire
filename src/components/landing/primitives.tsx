import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type SectionProps = {
  id?: string
  children: ReactNode
  className?: string
  narrow?: boolean
}

export function Section({ id, children, className = '', narrow }: SectionProps) {
  return (
    <section
      id={id}
      className={`px-6 py-28 md:py-36 ${narrow ? 'max-w-4xl mx-auto' : 'max-w-6xl mx-auto'} ${className}`}
    >
      {children}
    </section>
  )
}

type EyebrowProps = {
  children: ReactNode
  variant?: 'plain' | 'pill'
}

export function Eyebrow({ children, variant = 'plain' }: EyebrowProps) {
  if (variant === 'pill') {
    return (
      <p className="inline-block rounded-full border border-firefly/35 bg-night/80 px-4 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-firefly sm:text-xs">
        {children}
      </p>
    )
  }

  return (
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
      {children}
    </p>
  )
}

type LandingButtonProps = {
  to: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}

export function LandingButton({
  to,
  children,
  variant = 'primary',
  className = '',
}: LandingButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night'
  const styles =
    variant === 'primary'
      ? 'bg-firefly text-night hover:brightness-110'
      : 'border border-border text-primary hover:bg-surface'

  return (
    <Link to={to} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  )
}
