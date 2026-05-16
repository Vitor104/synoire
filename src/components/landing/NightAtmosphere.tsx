import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
const FIREFLY_SPOTS = [
  { left: '12%', top: '18%', delay: 0, size: 4, duration: 4.2 },
  { left: '78%', top: '22%', delay: 1.2, size: 3, duration: 5.1 },
  { left: '45%', top: '12%', delay: 0.6, size: 5, duration: 3.8 },
  { left: '88%', top: '38%', delay: 2.1, size: 3, duration: 4.6 },
  { left: '22%', top: '42%', delay: 1.8, size: 4, duration: 5.4 },
  { left: '62%', top: '32%', delay: 0.3, size: 3, duration: 4 },
  { left: '8%', top: '58%', delay: 2.4, size: 5, duration: 3.6 },
  { left: '52%', top: '48%', delay: 1.1, size: 4, duration: 4.8 },
  { left: '35%', top: '28%', delay: 1.5, size: 3, duration: 5.2 },
  { left: '92%', top: '62%', delay: 0.9, size: 4, duration: 4.4 },
  { left: '18%', top: '72%', delay: 0.4, size: 3, duration: 5.6 },
  { left: '70%', top: '68%', delay: 1.7, size: 5, duration: 4.1 },
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
      <motion.div
        className="absolute -left-1/4 top-0 h-[60%] w-[75%] bg-[radial-gradient(ellipse_at_center,rgba(216,255,94,0.09)_0%,transparent_72%)]"
        animate={
          reduced
            ? undefined
            : {
                opacity: [0.55, 0.95, 0.55],
                scale: [1, 1.08, 1],
                x: [0, 24, 0],
                y: [0, 12, 0],
              }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -right-1/4 top-1/4 h-[55%] w-[65%] bg-[radial-gradient(ellipse_at_center,rgba(103,199,255,0.07)_0%,transparent_70%)]"
        animate={
          reduced
            ? undefined
            : {
                opacity: [0.4, 0.75, 0.4],
                scale: [1, 1.06, 1],
                x: [0, -18, 0],
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[50%] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(30,38,48,0.55)_0%,transparent_68%)]"
        animate={
          reduced
            ? undefined
            : { opacity: [0.7, 1, 0.7] }
        }
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {!reduced &&
        FIREFLY_SPOTS.map((spot, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-firefly shadow-[0_0_10px_rgba(216,255,94,0.75)]"
            style={{
              left: spot.left,
              top: spot.top,
              width: spot.size,
              height: spot.size,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.75, 1.35, 0.75],
              y: [0, -14 - (i % 3) * 4, 0],
              x: [0, (i % 2 === 0 ? 6 : -6), 0],
            }}
            transition={{
              duration: spot.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: spot.delay,
            }}
          />
        ))}
    </div>
  )
}
