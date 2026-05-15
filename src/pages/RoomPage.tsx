import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImmersiveCanvas } from '@/components/room/ImmersiveCanvas'
import { SAMPLE_HUBS } from '@/data/sampleHubs'
import { DEFAULT_SOUNDSCAPES } from '@/data/defaultSoundscapes'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useRoomSoundscape } from '@/hooks/useRoomSoundscape'

const FOCUS_MINUTES = 25
const BREAK_MINUTES = 5
const MOCK_PRESENT = 128

type Phase = 'focus' | 'break'

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function roomTitle(roomId: string | undefined) {
  if (!roomId) return 'Sala de estudo'
  const hub = SAMPLE_HUBS.find((h) => h.slug === roomId)
  if (hub) return `Sala ${hub.name}`
  if (roomId === 'demo') return 'Sala de demonstração'
  const pretty = roomId.replace(/[-_]/g, ' ')
  return `Sala ${pretty.charAt(0).toUpperCase()}${pretty.slice(1)}`
}

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const title = useMemo(() => roomTitle(roomId), [roomId])
  const prefersReducedMotion = usePrefersReducedMotion()

  const entranceMs = useMemo(() => {
    if (prefersReducedMotion) return 420
    return 700 + Math.floor(Math.random() * 500)
  }, [prefersReducedMotion])

  const [phase, setPhase] = useState<Phase>('focus')
  const [remaining, setRemaining] = useState(FOCUS_MINUTES * 60)
  const [running, setRunning] = useState(false)
  const phaseRef = useRef(phase)
  const tickRef = useRef<number | null>(null)

  const [chromeLit, setChromeLit] = useState(false)
  const [soundOpen, setSoundOpen] = useState(false)
  const idleTimerRef = useRef<number | null>(null)

  const sound = useRoomSoundscape()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const bumpChrome = useCallback(() => {
    setChromeLit(true)
    if (idleTimerRef.current != null) window.clearTimeout(idleTimerRef.current)
    idleTimerRef.current = window.setTimeout(() => {
      setChromeLit(false)
      idleTimerRef.current = null
    }, 2600)
  }, [])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current != null) window.clearTimeout(idleTimerRef.current)
    }
  }, [])

  const clearTick = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!running) {
      clearTick()
      return
    }
    tickRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) return prev - 1
        const nextPhase: Phase =
          phaseRef.current === 'focus' ? 'break' : 'focus'
        phaseRef.current = nextPhase
        setPhase(nextPhase)
        return (
          (nextPhase === 'focus' ? FOCUS_MINUTES : BREAK_MINUTES) * 60
        )
      })
    }, 1000)
    return clearTick
  }, [running, clearTick])

  const reset = () => {
    setRunning(false)
    phaseRef.current = 'focus'
    setPhase('focus')
    setRemaining(FOCUS_MINUTES * 60)
  }

  const chromeClass = chromeLit
    ? 'opacity-100'
    : 'opacity-[0.38] hover:opacity-100'

  const easeInOut: [number, number, number, number] = [0.42, 0, 0.58, 1]

  return (
    <div
      role="main"
      aria-label={`Sala de estudo: ${title}`}
      className="fixed inset-0 z-10 overflow-hidden bg-night text-primary"
      onMouseMove={bumpChrome}
    >
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        initial={
          prefersReducedMotion ? { scale: 1 } : { scale: 1.05 }
        }
        animate={{ scale: 1 }}
        transition={{
          duration: entranceMs / 1000,
          ease: easeInOut,
        }}
      >
        <ImmersiveCanvas presentCount={MOCK_PRESENT} />
      </motion.div>

      <motion.div
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-24 pt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: entranceMs / 1000,
          ease: easeInOut,
        }}
      >
        <p
          className={`text-center text-xs font-medium uppercase tracking-[0.2em] transition-opacity duration-500 ${chromeClass} ${
            phase === 'focus' ? 'text-firefly' : 'text-aqua'
          }`}
        >
          {phase === 'focus' ? 'Sessão de foco' : 'Pausa curta'}
        </p>

        <h1 className="mt-3 text-center text-lg font-normal text-secondary transition-opacity duration-500 sm:text-xl">
          {title}
        </h1>

        <p
          className={`mt-2 text-center text-sm text-secondary transition-opacity duration-500 ${chromeClass}`}
        >
          {MOCK_PRESENT} presentes
        </p>

        <p
          className={`mt-14 font-mono text-6xl font-light tabular-nums tracking-tight sm:text-7xl md:text-8xl ${phase === 'focus' ? 'text-primary' : 'text-aqua'}`}
        >
          {formatTime(remaining)}
        </p>

        <div
          className={`mt-12 flex flex-wrap items-center justify-center gap-3 transition-opacity duration-500 ${chromeClass}`}
        >
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="pointer-events-auto rounded-xl bg-firefly px-6 py-3 text-sm font-medium text-night hover:brightness-110"
          >
            {running ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="pointer-events-auto rounded-xl border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-elevated"
          >
            Resetar
          </button>
        </div>
      </motion.div>

      <div
        role="toolbar"
        aria-label="Ações da sala"
        className={`pointer-events-none fixed left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 p-4 transition-opacity duration-500 sm:p-6 ${chromeClass}`}
      >
        <Link
          to="/painel"
          className="pointer-events-auto rounded-lg px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
        >
          Sair
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOpen((o) => !o)}
            className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
            aria-expanded={soundOpen}
          >
            Som
          </button>
        </div>
      </div>

      {soundOpen && (
        <div
          className="pointer-events-auto fixed right-4 top-14 z-30 w-[min(100%-2rem,20rem)] rounded-2xl border border-border bg-surface p-4 shadow-lg sm:right-6"
          role="dialog"
          aria-label="Configurar som ambiente"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-primary">Ambiente</p>
            <button
              type="button"
              className="text-xs text-aqua hover:underline"
              onClick={() => sound.togglePause()}
              disabled={!sound.activeLabel}
            >
              {sound.isPlaying ? 'Pausar áudio' : 'Retomar'}
            </button>
          </div>

          <label className="mt-4 block text-xs text-secondary">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={sound.userVolume}
              onChange={(e) =>
                sound.setUserVolume(Number.parseFloat(e.target.value))
              }
              className="mt-1 block w-full accent-firefly"
            />
          </label>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-secondary">
            Synoire default
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {DEFAULT_SOUNDSCAPES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-2 text-left text-primary hover:bg-elevated"
                  onClick={() => void sound.playLibraryTrack(t.file, t.label)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-secondary">
            MP3 local (não enviado ao servidor)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void sound.setCustomFile(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            className="mt-2 w-full rounded-xl border border-dashed border-border py-6 text-sm text-secondary hover:border-aqua/50 hover:bg-elevated"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const f = e.dataTransfer.files?.[0]
              if (f?.type === 'audio/mpeg' || f.name.toLowerCase().endsWith('.mp3')) {
                void sound.setCustomFile(f)
              }
            }}
          >
            Arrastar MP3 ou clicar para escolher
          </button>
          {sound.activeLabel && (
            <p className="mt-2 truncate text-xs text-aqua" title={sound.activeLabel}>
              A tocar: {sound.activeLabel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
