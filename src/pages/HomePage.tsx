import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function HomePage() {
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)

  return (
    <motion.div
      className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.div variants={item}>
        <img
          src="/logoSynoire.svg"
          alt="Synoire"
          className="block h-auto w-full max-w-2xl object-contain object-left max-h-32 sm:max-h-40 md:max-h-48"
        />
      </motion.div>
      <motion.h1
        variants={item}
        className="mt-4 text-balance text-4xl font-semibold tracking-tight text-primary md:text-5xl"
      >
        Estudo coletivo sem ruído de rede social.
      </motion.h1>
      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-secondary"
      >
        Salas em tempo real, hubs por concurso e um painel claro de constância
        — feito para quem alterna picos de produtividade com semanas paradas.
      </motion.p>
      <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/painel"
          className="inline-flex items-center justify-center rounded-xl bg-firefly px-5 py-3 text-sm font-medium text-night transition hover:brightness-110"
        >
          Entrar no painel
        </Link>
        <Link
          to="/entrar"
          className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-primary transition hover:bg-surface"
        >
          Criar conta (em breve)
        </Link>
      </motion.div>
      <motion.p
        variants={item}
        className="mt-12 text-sm text-secondary"
      >
        MVP: autenticação Supabase, hubs, salas com pomodoro sincronizado, metas
        e streaks.
      </motion.p>
    </motion.div>
  )
}
