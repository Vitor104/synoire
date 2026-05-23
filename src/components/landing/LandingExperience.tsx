import { motion } from 'motion/react'
import { StudyRoomPreview } from '@/components/landing/StudyRoomPreview'
import { Section } from '@/components/landing/primitives'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  scrollRevealContainer,
  scrollRevealItem,
  scrollRevealViewport,
} from '@/motion/scrollReveal'

export function LandingExperience() {
  const reduced = usePrefersReducedMotion()
  const c = scrollRevealContainer(reduced)
  const item = scrollRevealItem(reduced)

  return (
    <Section
      id="experiencia"
      className="max-w-7xl border-t border-border/50 !px-4 sm:!px-6"
    >
      <motion.div
        variants={c}
        initial="hidden"
        whileInView="visible"
        viewport={scrollRevealViewport}
      >
        <motion.h2
          variants={item}
          className="mb-14 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl"
        >
          Entre na sala.
        </motion.h2>

        <motion.div variants={item}>
          <StudyRoomPreview size="cinema" lazy />
        </motion.div>

        <motion.p
          variants={item}
          className="mx-auto mt-10 max-w-xl text-center text-pretty text-secondary"
        >
          Um ambiente calmo criado para tornar a constância algo natural.
        </motion.p>
      </motion.div>
    </Section>
  )
}
