import { motion } from 'motion/react'
import { Eyebrow, Section } from '@/components/landing/primitives'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  scrollRevealContainer,
  scrollRevealItem,
  scrollRevealListInner,
  scrollRevealViewport,
} from '@/motion/scrollReveal'

const STEPS = [
  { num: '01', title: 'Escolha sua sala' },
  { num: '02', title: 'Sincronize seu foco' },
  { num: '03', title: 'Cresça com o coletivo' },
] as const

export function LandingHowItWorks() {
  const reduced = usePrefersReducedMotion()
  const c = scrollRevealContainer(reduced)
  const item = scrollRevealItem(reduced)
  const list = scrollRevealListInner(reduced)

  return (
    <Section id="como-funciona" className="border-t border-border/50">
      <motion.div
        variants={c}
        initial="hidden"
        whileInView="visible"
        viewport={scrollRevealViewport}
      >
        <motion.div variants={item} className="mb-14 max-w-xl">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Entre.
            <br />
            Foque.
            <br />
            Evolua junto.
          </h2>
        </motion.div>

        <motion.ol
          variants={list}
          className="grid gap-8 md:grid-cols-3 md:gap-6"
        >
          {STEPS.map((step) => (
            <motion.li
              key={step.num}
              variants={item}
              className="relative border-t border-border pt-8 md:border-t-0 md:border-l md:pl-8 md:pt-0 first:md:border-l-0 first:md:pl-0"
            >
              <span className="font-mono text-sm text-firefly">{step.num}</span>
              <p className="mt-3 text-lg font-medium text-primary">
                {step.title}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </Section>
  )
}
