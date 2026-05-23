import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ImmersiveCanvas } from '@/components/room/ImmersiveCanvas'
import { RoomSessionFooter } from '@/components/room/RoomSessionFooter'
import { RoomTimerRing } from '@/components/room/RoomTimerRing'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const MOCK_PRESENT = 24
const FOCUS_SECONDS = 25 * 60

type StudyRoomPreviewProps = {
  size?: 'compact' | 'cinema'
  className?: string
  lazy?: boolean
}

export function StudyRoomPreview({
  size = 'compact',
  className = '',
  lazy = false,
}: StudyRoomPreviewProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(!lazy)

  useEffect(() => {
    if (!lazy || active) return
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [lazy, active])

  const isCinema = size === 'cinema'

  const heightClass = isCinema
    ? 'min-h-[min(72vh,520px)] sm:min-h-[min(68vh,560px)]'
    : 'aspect-[16/10] min-h-[220px] sm:min-h-[280px]'

  return (
    <motion.div
      ref={rootRef}
      role="img"
      aria-label="Prévia da sala de estudo Synoire com anel do timer de foco, vaga-lumes e rodapé de sessão"
      className={`relative overflow-hidden rounded-2xl border border-border bg-night shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_24px_48px_-12px_rgba(0,0,0,0.55),0_0_40px_-8px_rgba(163,163,79,0.08)] ${heightClass} ${className}`}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={
        reduced
          ? undefined
          : { duration: 7, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <div className="absolute inset-0 z-0">
        {active && (
          <ImmersiveCanvas
            presentCount={MOCK_PRESENT}
            background="minimal"
          />
        )}
      </div>

      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-28 pt-12"
        aria-hidden
      >
        <RoomTimerRing
          phase="focus"
          remainingSeconds={FOCUS_SECONDS}
          segmentDuration={FOCUS_SECONDS}
          showProgress
          prefersReducedMotion={reduced}
        />
      </div>

      <RoomSessionFooter
        phase="focus"
        focusCycle="25/5"
        isPlaying
        embedded
        prefersReducedMotion={reduced}
        chromeClass="opacity-100"
      />
    </motion.div>
  )
}
