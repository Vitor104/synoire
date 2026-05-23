import { motion } from 'motion/react'
import { useMemo } from 'react'
import type { RoomPhase } from '@/lib/roomTimer'

const LETTER_POOL = 'MRKAJSTVLEBDFGHPONC'

const ORB_ANGLES = [
  -72, -48, -28, -8, 12, 32, 52, 72, 108, 128, 148, 168,
]

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type OrbStyle = 'firefly' | 'aqua' | 'neutral'

function orbStyleFor(index: number, phase: RoomPhase, rand: () => number): OrbStyle {
  if (index === 0) return phase === 'focus' ? 'firefly' : 'aqua'
  const r = rand()
  if (phase === 'break') {
    if (r < 0.45) return 'aqua'
    if (r < 0.75) return 'neutral'
    return 'firefly'
  }
  if (r < 0.5) return 'firefly'
  if (r < 0.8) return 'neutral'
  return 'aqua'
}

const STYLE_CLASSES: Record<
  OrbStyle,
  { bg: string; shadow: string }
> = {
  firefly: {
    bg: 'bg-firefly/20',
    shadow: 'shadow-[0_0_20px_-4px_rgba(163,163,79,0.35)]',
  },
  aqua: {
    bg: 'bg-aqua/20',
    shadow: 'shadow-[0_0_20px_-4px_rgba(107,143,122,0.3)]',
  },
  neutral: {
    bg: 'bg-elevated/80',
    shadow: 'shadow-[0_0_16px_-6px_rgba(245,245,240,0.12)]',
  },
}

type RoomFireflyOrbsProps = {
  presentCount: number
  currentUserInitial: string
  phase: RoomPhase
  prefersReducedMotion?: boolean
  className?: string
}

export function RoomFireflyOrbs({
  presentCount,
  currentUserInitial,
  phase,
  prefersReducedMotion = false,
  className = '',
}: RoomFireflyOrbsProps) {
  const count = Math.min(Math.max(presentCount, 1), 12)

  const orbs = useMemo(() => {
    const rand = mulberry32(presentCount * 0x9e3779b1)
    const usedLetters = new Set<string>()
    const initial = currentUserInitial.toUpperCase().slice(0, 1) || '?'
    usedLetters.add(initial)

    return Array.from({ length: count }, (_, i) => {
      const angle = ORB_ANGLES[i % ORB_ANGLES.length]
      const rad = (angle * Math.PI) / 180
      const rx = 46 + (i % 3) * 2
      const ry = 38 + (i % 2) * 3
      const x = 50 + Math.cos(rad) * rx
      const y = 50 + Math.sin(rad) * ry

      let letter = initial
      if (i > 0) {
        let pick = LETTER_POOL[Math.floor(rand() * LETTER_POOL.length)]
        let guard = 0
        while (usedLetters.has(pick) && guard < 20) {
          pick = LETTER_POOL[Math.floor(rand() * LETTER_POOL.length)]
          guard++
        }
        usedLetters.add(pick)
        letter = pick
      }

      const style = orbStyleFor(i, phase, rand)
      const floatDelay = rand() * 2
      const floatY = 4 + rand() * 4

      return { x, y, letter, style, floatDelay, floatY, isSelf: i === 0 }
    })
  }, [count, presentCount, currentUserInitial, phase])

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      {orbs.map((orb, i) => {
        const classes = STYLE_CLASSES[orb.style]
        const El = prefersReducedMotion ? 'div' : motion.div
        const motionProps = prefersReducedMotion
          ? {}
          : {
              animate: { y: [0, -orb.floatY, 0] },
              transition: {
                duration: 5 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut' as const,
                delay: orb.floatDelay,
              },
            }

        return (
          <El
            key={i}
            {...motionProps}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
            }}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/5 text-sm font-medium text-primary/90 sm:h-12 sm:w-12 ${classes.bg} ${classes.shadow} ${
                orb.isSelf
                  ? phase === 'focus'
                    ? 'ring-1 ring-firefly/50 ring-offset-2 ring-offset-night/80'
                    : 'ring-1 ring-aqua/50 ring-offset-2 ring-offset-night/80'
                  : ''
              }`}
            >
              {orb.letter}
            </span>
          </El>
        )
      })}
    </div>
  )
}
