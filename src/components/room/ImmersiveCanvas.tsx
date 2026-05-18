import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ImmersiveThemeId } from '@/lib/immersiveThemes'

type Firefly = {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  pulse: number
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function initFireflies(
  count: number,
  w: number,
  h: number,
  rand: () => number,
  horizonRatio = 0.58,
): Firefly[] {
  const horizon = h * horizonRatio
  const out: Firefly[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      x: rand() * w,
      y: horizon + rand() * (h - horizon - 8),
      vx: (rand() - 0.5) * 0.35,
      vy: (rand() - 0.5) * 0.22,
      phase: rand() * Math.PI * 2,
      pulse: 0.6 + rand() * 0.4,
    })
  }
  return out
}

function initStars(
  count: number,
  w: number,
  h: number,
  rand: () => number,
  heightRatio = 0.55,
): { x: number; y: number; r: number; tw: number }[] {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * w,
      y: rand() * h * heightRatio,
      r: rand() * 1.2 + 0.3,
      tw: rand() * Math.PI * 2,
    })
  }
  return stars
}

type ImmersiveCanvasProps = {
  presentCount: number
  variant?: 'room' | 'preview'
  theme?: ImmersiveThemeId
  motionSpeed?: number
  pulseSpeed?: number
  syncFlashUntil?: number
}

export function ImmersiveCanvas({
  presentCount,
  variant = 'room',
  theme = 'firefly',
  motionSpeed = 1,
  pulseSpeed = 0.0025,
  syncFlashUntil = 0,
}: ImmersiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const firefliesRef = useRef<Firefly[]>([])
  const starsRef = useRef<{ x: number; y: number; r: number; tw: number }[]>(
    [],
  )
  const randRef = useRef(mulberry32(0x9e3779b9))
  const motionSpeedRef = useRef(motionSpeed)
  const pulseSpeedRef = useRef(pulseSpeed)
  const syncFlashUntilRef = useRef(syncFlashUntil)
  const themeRef = useRef(theme)

  motionSpeedRef.current = motionSpeed
  pulseSpeedRef.current = pulseSpeed
  syncFlashUntilRef.current = syncFlashUntil
  themeRef.current = theme

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isPreview = variant === 'preview'
    const maxFlies = reduced ? 18 : isPreview ? 32 : 72
    const n = Math.min(Math.max(4, presentCount), maxFlies)
    const starCount = reduced ? 40 : isPreview ? 50 : 90
    const dprCap = isPreview ? 1 : 2
    const shadowScale = isPreview ? 0.55 : 1

    let raf = 0
    let t0 = performance.now()
    let visible = document.visibilityState !== 'hidden'

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      const parent = canvas.parentElement
      const w = Math.max(parent?.clientWidth ?? canvas.clientWidth, 1)
      const h = Math.max(parent?.clientHeight ?? canvas.clientHeight, 1)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const rand = randRef.current
      const currentTheme = themeRef.current
      const horizonRatio =
        currentTheme === 'forest' ? 0.48 : currentTheme === 'rain' ? 0.56 : 0.58
      starsRef.current = initStars(starCount, w, h, rand)
      const flyCount =
        currentTheme === 'rain'
          ? Math.max(4, Math.floor(n * 0.45))
          : currentTheme === 'forest'
            ? Math.max(4, Math.floor(n * 0.75))
            : n
      firefliesRef.current = initFireflies(flyCount, w, h, rand, horizonRatio)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const drawHorizon = (w: number, h: number, t: number, currentTheme: ImmersiveThemeId) => {
      const base =
        currentTheme === 'forest' ? h * 0.46 : currentTheme === 'rain' ? h * 0.54 : h * 0.52
      const hill1 =
        currentTheme === 'forest' ? '#050a06' : currentTheme === 'rain' ? '#06080c' : '#070a0e'
      const hill2 =
        currentTheme === 'forest' ? '#0a1208' : currentTheme === 'rain' ? '#0a0e14' : '#0d1218'

      ctx.fillStyle = hill1
      ctx.beginPath()
      ctx.moveTo(0, base)
      ctx.bezierCurveTo(
        w * 0.2,
        base - 18 + Math.sin(t * 0.0004) * 6,
        w * 0.55,
        base + 28 + Math.cos(t * 0.00035) * 8,
        w,
        base + 12,
      )
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = hill2
      ctx.beginPath()
      ctx.moveTo(0, base + 36)
      ctx.bezierCurveTo(
        w * 0.25,
        base + 8,
        w * 0.65,
        base + 52,
        w,
        base + 40,
      )
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fill()
    }

    const drawRain = (w: number, h: number, t: number) => {
      if (reduced) return
      const streaks = Math.min(120, Math.floor(w / 8))
      ctx.strokeStyle = 'rgba(160, 190, 220, 0.08)'
      ctx.lineWidth = 1
      for (let i = 0; i < streaks; i++) {
        const x = ((i * 97 + Math.floor(t * 0.02)) % streaks) * (w / streaks)
        const offset = (t * 0.35 + i * 41) % 40
        const y = (offset / 40) * h
        const len = 12 + (i % 5) * 3
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - 2, y + len)
        ctx.stroke()
      }
    }

    const drawSky = (w: number, h: number, currentTheme: ImmersiveThemeId) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65)
      if (currentTheme === 'rain') {
        sky.addColorStop(0, '#080c12')
        sky.addColorStop(0.45, '#0a1018')
        sky.addColorStop(1, '#0e1520')
      } else if (currentTheme === 'forest') {
        sky.addColorStop(0, '#060a08')
        sky.addColorStop(0.45, '#0a120c')
        sky.addColorStop(1, '#0e1810')
      } else {
        sky.addColorStop(0, '#0b0f14')
        sky.addColorStop(0.45, '#0d1219')
        sky.addColorStop(1, '#111820')
      }
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)
    }

    const drawFog = (w: number, h: number, currentTheme: ImmersiveThemeId) => {
      const fog = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        0,
        w * 0.5,
        h * 0.55,
        Math.max(w, h) * 0.55,
      )
      if (currentTheme === 'rain') {
        fog.addColorStop(0, 'rgba(18, 26, 36, 0)')
        fog.addColorStop(0.55, 'rgba(14, 20, 30, 0.4)')
        fog.addColorStop(1, 'rgba(8, 12, 18, 0.9)')
      } else if (currentTheme === 'forest') {
        fog.addColorStop(0, 'rgba(16, 28, 20, 0)')
        fog.addColorStop(0.55, 'rgba(12, 22, 16, 0.35)')
        fog.addColorStop(1, 'rgba(6, 12, 8, 0.88)')
      } else {
        fog.addColorStop(0, 'rgba(22, 28, 36, 0)')
        fog.addColorStop(0.55, 'rgba(18, 24, 32, 0.35)')
        fog.addColorStop(1, 'rgba(11, 15, 20, 0.85)')
      }
      ctx.fillStyle = fog
      ctx.fillRect(0, 0, w, h)
    }

    const loop = (now: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const t = now - t0
      const currentTheme = themeRef.current

      drawSky(w, h, currentTheme)

      const stars = starsRef.current
      const starTint =
        currentTheme === 'forest'
          ? '220, 235, 210'
          : currentTheme === 'rain'
            ? '200, 215, 235'
            : '220, 230, 245'
      for (const s of stars) {
        const tw = 0.35 + 0.65 * Math.sin(s.tw + t * 0.0012)
        ctx.fillStyle = `rgba(${starTint}, ${0.12 * tw})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      drawFog(w, h, currentTheme)
      drawHorizon(w, h, t, currentTheme)

      if (currentTheme === 'rain') {
        drawRain(w, h, t)
      }

      const flies = firefliesRef.current
      const speed = reduced ? 0.15 : motionSpeedRef.current
      const syncUntil = syncFlashUntilRef.current
      const inSyncFlash = syncUntil > 0 && now < syncUntil

      const glowColor =
        currentTheme === 'forest'
          ? { shadow: '#a8c878', fill: '180, 220, 120' }
          : currentTheme === 'rain'
            ? { shadow: '#b8d4e8', fill: '190, 220, 240' }
            : { shadow: '#d8ff5e', fill: '216, 255, 94' }

      const minY = currentTheme === 'forest' ? h * 0.42 : h * 0.5

      for (const f of flies) {
        f.x += f.vx * speed
        f.y += f.vy * speed
        if (f.x < -20) f.x = w + 20
        if (f.x > w + 20) f.x = -20
        if (f.y < minY) f.y = minY + 2
        if (f.y > h - 10) f.y = h - 12

        const glow = inSyncFlash
          ? 0.9 + 0.1 * Math.sin(t * 0.008)
          : 0.35 +
            0.65 * Math.sin(f.phase + t * pulseSpeedRef.current * f.pulse)
        const r = 2 + glow * 2.2
        ctx.shadowColor = glowColor.shadow
        ctx.shadowBlur = reduced
          ? 6
          : (14 + glow * 10) * shadowScale
        ctx.fillStyle = `rgba(${glowColor.fill}, ${0.45 + glow * 0.45})`
        ctx.beginPath()
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      if (visible) raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      const nowVisible = document.visibilityState !== 'hidden'
      if (nowVisible === visible) return
      visible = nowVisible
      if (visible) {
        t0 = performance.now()
        raf = requestAnimationFrame(loop)
      } else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    if (visible) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
    }
  }, [presentCount, reduced, variant, theme])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden
    />
  )
}
