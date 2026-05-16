import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const FIREFLY_SPOTS = [
  { left: '12%', top: '18%', delay: '0s' },
  { left: '78%', top: '22%', delay: '1.2s' },
  { left: '45%', top: '12%', delay: '0.6s' },
  { left: '88%', top: '38%', delay: '2.1s' },
  { left: '22%', top: '42%', delay: '1.8s' },
  { left: '62%', top: '32%', delay: '0.3s' },
  { left: '8%', top: '58%', delay: '2.4s' },
  { left: '52%', top: '48%', delay: '1.1s' },
  { left: '35%', top: '28%', delay: '1.5s' },
  { left: '92%', top: '62%', delay: '0.9s' },
]

type NightAtmosphereProps = {
  className?: string
}

export function NightAtmosphere({ className = '' }: NightAtmosphereProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div
        className="absolute -left-1/4 top-0 h-[55%] w-[70%] bg-[radial-gradient(ellipse_at_center,rgba(216,255,94,0.07)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="absolute -right-1/4 top-1/4 h-[50%] w-[60%] bg-[radial-gradient(ellipse_at_center,rgba(103,199,255,0.06)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/2 h-[45%] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(30,38,48,0.5)_0%,transparent_65%)]"
        aria-hidden
      />

      {!reduced &&
        FIREFLY_SPOTS.map((spot, i) => (
          <span
            key={i}
            className="landing-firefly absolute h-1 w-1 rounded-full bg-firefly/80 shadow-[0_0_6px_rgba(216,255,94,0.6)]"
            style={{
              left: spot.left,
              top: spot.top,
              animationDelay: spot.delay,
            }}
          />
        ))}
    </div>
  )
}
