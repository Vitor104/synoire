import { motion } from 'motion/react'
import { Link, useParams } from 'react-router-dom'
import { SAMPLE_HUBS } from '@/data/sampleHubs'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function HubDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const hub = SAMPLE_HUBS.find((h) => h.slug === slug)
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)

  if (!hub) {
    return (
      <motion.div
        className="mx-auto max-w-lg py-16 text-center"
        variants={c}
        initial={reduced ? false : 'hidden'}
        animate="visible"
      >
        <motion.p variants={item} className="text-secondary">
          Hub não encontrado.
        </motion.p>
        <motion.div variants={item}>
          <Link to="/hubs" className="mt-4 inline-block text-sm text-aqua">
            Voltar aos hubs
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={slug}
      className="mx-auto max-w-3xl"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.div variants={item}>
        <Link
          to="/hubs"
          className="text-sm text-secondary hover:text-primary"
        >
          ← Hubs
        </Link>
      </motion.div>
      <motion.header variants={item} className="mt-6">
        <h1 className="text-2xl font-semibold text-primary">{hub.name}</h1>
        <p className="mt-2 text-sm text-secondary">
          Salas ativas e metas do hub aparecerão aqui. Realtime para presença
          será plugado no Supabase.
        </p>
      </motion.header>
      <motion.div
        variants={item}
        className="mt-8 rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-secondary"
      >
        Lista de salas (placeholder)
      </motion.div>
    </motion.div>
  )
}
