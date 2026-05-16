import { motion } from 'motion/react'
import { Eyebrow, Section } from '@/components/landing/primitives'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  scrollRevealContainer,
  scrollRevealItem,
  scrollRevealListInner,
  scrollRevealViewport,
} from '@/motion/scrollReveal'

const STATS = [
  { value: '73%', label: 'abandonam a rotina cedo' },
  { value: '4x', label: 'mais constância com presença coletiva' },
  { value: '21 dias', label: 'para consolidar hábitos consistentes' },
] as const

export function LandingProblem() {
  const reduced = usePrefersReducedMotion()
  const c = scrollRevealContainer(reduced)
  const item = scrollRevealItem(reduced)
  const list = scrollRevealListInner(reduced)

  return (
    <Section id="problema" className="border-t border-border/50">
      <motion.div
        variants={c}
        initial="hidden"
        whileInView="visible"
        viewport={scrollRevealViewport}
        className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start"
      >
        <div>
          <motion.div variants={item}>
            <Eyebrow>O problema</Eyebrow>
          </motion.div>
          <motion.h2
            variants={item}
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-primary md:text-4xl"
          >
            O isolamento quebra a constância.
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-6 text-pretty text-lg leading-relaxed text-secondary"
          >
            Estudar sozinho frequentemente leva à perda de ritmo, distração e
            abandono da rotina. A motivação enfraquece quando o foco depende
            apenas da força de vontade.
          </motion.p>
        </div>

        <motion.ul
          variants={list}
          className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5"
        >
          {STATS.map((stat) => (
            <motion.li
              key={stat.value}
              variants={item}
              className="rounded-2xl border border-border bg-surface px-6 py-8"
            >
              <p className="text-3xl font-bold tracking-tight text-firefly md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                {stat.label}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </Section>
  )
}
