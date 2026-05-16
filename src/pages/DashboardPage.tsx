import { motion, type Variants } from 'motion/react'
import {
  pageStaggerContainer,
  pageStaggerItem,
  pageStaggerListInner,
} from '@/motion/pageStagger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

function StatCard({
  label,
  value,
  hint,
  variants,
}: {
  label: string
  value: string
  hint: string
  variants: Variants
}) {
  return (
    <motion.div variants={variants} className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm text-secondary">{hint}</p>
    </motion.div>
  )
}

export function DashboardPage() {
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)
  const listInner = pageStaggerListInner(reduced)

  return (
    <motion.div
      className="mx-auto max-w-5xl"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.header variants={item} className="mb-10">
        <h1 className="text-2xl font-semibold text-primary">Painel</h1>
        <p className="mt-1 text-sm text-secondary">
          Visão rápida de constância — dados reais virão do Supabase.
        </p>
      </motion.header>
      <motion.div
        variants={listInner}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          variants={item}
          label="Hoje"
          value="0 h"
          hint="Horas estudadas (placeholder)"
        />
        <StatCard
          variants={item}
          label="Streak"
          value="0 dias"
          hint="Sequência de dias com foco"
        />
        <StatCard
          variants={item}
          label="Meta semanal"
          value="0 / 20 h"
          hint="Progresso da meta (placeholder)"
        />
      </motion.div>
      <motion.section
        variants={item}
        className="mt-10 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 className="text-sm font-medium text-primary">Evolução semanal</h2>
        <p className="mt-2 text-sm text-secondary">
          Gráfico de barras / linha será adicionado com dados agregados.
        </p>
        <div className="mt-6 flex h-32 items-end gap-2">
          {[35, 55, 40, 70, 25, 60, 45].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-firefly/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}
