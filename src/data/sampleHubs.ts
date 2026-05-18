import type { HubView } from '@/lib/hubs/types'

/** @deprecated Import HubView from @/lib/hubs */
export type HubSummary = HubView

/** Hubs exemplo — usados apenas em VITE_DEMO_MODE */
export const SAMPLE_HUBS: HubView[] = [
  {
    id: 'demo-pf',
    slug: 'pf',
    name: 'Polícia Federal',
    shortLabel: 'PF',
    accentStripe: 'bg-firefly shadow-[0_0_16px_rgba(163,163,79,0.3)]',
    accentBadge: 'border-firefly/40 bg-firefly/10 text-firefly',
  },
  {
    id: 'demo-bb',
    slug: 'bb',
    name: 'Banco do Brasil',
    shortLabel: 'BB',
    accentStripe: 'bg-aqua shadow-[0_0_16px_rgba(103,199,255,0.28)]',
    accentBadge: 'border-aqua/45 bg-aqua/10 text-aqua',
  },
  {
    id: 'demo-inss',
    slug: 'inss',
    name: 'INSS',
    shortLabel: 'INSS',
    accentStripe: 'bg-primary/35',
    accentBadge: 'border-border bg-elevated text-primary',
  },
  {
    id: 'demo-trt',
    slug: 'trt',
    name: 'TRT',
    shortLabel: 'TRT',
    accentStripe: 'bg-[#60a5fa] shadow-[0_0_14px_rgba(96,165,250,0.35)]',
    accentBadge: 'border-[#60a5fa]/45 bg-[#60a5fa]/12 text-[#93c5fd]',
  },
  {
    id: 'demo-rfb',
    slug: 'rfb',
    name: 'Receita Federal',
    shortLabel: 'RFB',
    accentStripe: 'bg-firefly shadow-[0_0_16px_rgba(163,163,79,0.3)]',
    accentBadge: 'border-firefly/40 bg-firefly/10 text-firefly',
  },
]
