import { motion } from 'motion/react'
import { useMemo } from 'react'

const BAR_COUNT = 24

type RoomAmbientWaveformProps = {
  isPlaying: boolean
  phaseAccent?: 'focus' | 'break'
  prefersReducedMotion?: boolean
  className?: string
}

export function RoomAmbientWaveform({
  isPlaying,
  phaseAccent = 'focus',
  prefersReducedMotion = false,
  className = '',
}: RoomAmbientWaveformProps) {
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => ({
        base: 0.15 + ((i * 7) % 11) / 30,
        peak: 0.35 + ((i * 5) % 13) / 25,
        delay: (i % 8) * 0.08,
        duration: 0.9 + (i % 5) * 0.15,
      })),
    [],
  )

  const activeColor =
    phaseAccent === 'focus'
      ? 'bg-firefly/50'
      : 'bg-aqua/45'
  const idleColor = 'bg-secondary/25'

  return (
    <div
      className={`flex h-5 items-end justify-center gap-[3px] ${className}`}
      aria-hidden
    >
      {bars.map((bar, i) => {
        const animate =
          isPlaying && !prefersReducedMotion
            ? {
                scaleY: [bar.base, bar.peak, bar.base * 0.9, bar.peak * 0.85, bar.base],
              }
            : { scaleY: isPlaying ? bar.base * 1.1 : bar.base * 0.65 }

        return (
          <motion.span
            key={i}
            className={`w-[2px] origin-bottom rounded-full ${isPlaying ? activeColor : idleColor}`}
            style={{ height: '100%' }}
            animate={animate}
            transition={
              isPlaying && !prefersReducedMotion
                ? {
                    duration: bar.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: bar.delay,
                  }
                : { duration: 0.4 }
            }
          />
        )
      })}
    </div>
  )
}
