/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  /** `true` — auth stub navega para o painel sem Supabase (só front-end). */
  readonly VITE_DEMO_MODE?: string
  /** `true` — segmentos de timer de 1s para testes E2E (vite --mode test). */
  readonly VITE_E2E_TEST_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
