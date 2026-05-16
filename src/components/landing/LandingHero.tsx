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
    <section className="relative min-h-dvh overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      <NightAtmosphere />

      <motion.div
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
        variants={c}
        initial={reduced ? false : 'hidden'}
        animate="visible"
      >
        <motion.div variants={item}>
          <Eyebrow variant="pill">Plataforma social de estudos · Beta</Eyebrow>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 font-serif text-balance text-4xl font-semibold tracking-tight text-primary md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]"
        >
          Estude junto.
          <br />
          Construa constância.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-secondary"
        >
          Entre em salas silenciosas de foco, sincronize seu ritmo de estudo e
          transforme presença coletiva em disciplina duradoura.
        </motion.p>

        <motion.div variants={item} className="mt-10">
          <LandingButton to="/entrar" className="px-8 py-3.5 text-base">
            Criar conta gratuita
          </LandingButton>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 w-full max-w-lg md:mt-16 md:max-w-xl"
        >
          <StudyRoomPreview size="hero" />
        </motion.div>
      </motion.div>
    </section>
  )
}
