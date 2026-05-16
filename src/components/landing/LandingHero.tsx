import { motion } from 'motion/react'
import { NightAtmosphere } from '@/components/landing/NightAtmosphere'
import { StudyRoomPreview } from '@/components/landing/StudyRoomPreview'
import { Eyebrow, LandingButton } from '@/components/landing/primitives'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

export function LandingHero() {
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)

  return (
    <section className="relative min-h-dvh overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24">
      <NightAtmosphere />

      <motion.div
        className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16"
        variants={c}
        initial={reduced ? false : 'hidden'}
        animate="visible"
      >
        <div className="flex flex-col justify-center">
          <motion.div variants={item}>
            <Eyebrow>Plataforma social de estudos • Beta</Eyebrow>
          </motion.div>
          <motion.h1
            variants={item}
            className="mt-6 text-balance text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
          >
            Estude junto.
            <br />
            Construa constância.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-secondary"
          >
            Entre em salas silenciosas de foco, sincronize seu ritmo de estudo e
            transforme presença coletiva em disciplina duradoura.
          </motion.p>
          <motion.div variants={item} className="mt-10">
            <LandingButton to="/entrar">Criar conta</LandingButton>
          </motion.div>
        </div>

        <motion.div variants={item} className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <StudyRoomPreview size="compact" />
        </motion.div>
      </motion.div>
    </section>
  )
}
