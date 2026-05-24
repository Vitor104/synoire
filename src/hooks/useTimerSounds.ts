import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const CHIME_SRC = '/sounds/pomodoro-start.mp3'
const VOLUME = 0.5

type UseTimerSoundsInput = {
  remainingSeconds: number
  isIdle: boolean
  /** Wait until the room timer is loaded before listening for transitions. */
  enabled?: boolean
}

type TimerSnapshot = {
  remainingSeconds: number
  isIdle: boolean
}

function playSafe(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch(() => {
    /* autoplay blocked or missing asset */
  })
}

export function useTimerSounds({
  remainingSeconds,
  isIdle,
  enabled = true,
}: UseTimerSoundsInput): void {
  const prefersReducedMotion = usePrefersReducedMotion()
  const chimeSound = useRef(new Audio(CHIME_SRC))
  const prevRef = useRef<TimerSnapshot | null>(null)
  const syncedRef = useRef(false)

  useEffect(() => {
    chimeSound.current.preload = 'auto'
    chimeSound.current.volume = VOLUME
  }, [])

  useEffect(() => {
    if (!enabled) {
      prevRef.current = null
      syncedRef.current = false
      return
    }

    if (prefersReducedMotion) return

    if (!syncedRef.current) {
      prevRef.current = { remainingSeconds, isIdle }
      syncedRef.current = true
      return
    }

    const prev = prevRef.current
    if (prev === null) return

    prevRef.current = { remainingSeconds, isIdle }

    const segmentEnded =
      !isIdle &&
      prev.remainingSeconds > 0 &&
      remainingSeconds === 0

    const segmentStarted =
      (prev.isIdle && !isIdle) ||
      (!isIdle &&
        prev.remainingSeconds === 0 &&
        remainingSeconds > 0)

    if (segmentEnded || segmentStarted) {
      playSafe(chimeSound.current)
    }
  }, [remainingSeconds, isIdle, enabled, prefersReducedMotion])

  useEffect(() => {
    const chime = chimeSound.current
    return () => {
      chime.pause()
      chime.currentTime = 0
    }
  }, [])
}
