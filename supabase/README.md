# Supabase — Synoire

## Migrações

```bash
supabase link --project-ref <ref>
supabase db push
```

## Edge Functions (Stripe Glow)

| Função | JWT | Descrição |
|--------|-----|-----------|
| `create-checkout` | sim | Cria sessão Stripe Checkout para assinatura Glow |
| `stripe-webhook` | **não** | Recebe eventos Stripe e atualiza `profiles` |

### Secrets (Dashboard → Project Settings → Edge Functions)

Defina no projeto remoto (nunca no front-end):

| Secret | Uso |
|--------|-----|
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PRICE_ID` | `price_1TYey02abnSfEi4yqxkvjxz0` (Synoire Glow — modo teste) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (endpoint de webhook após deploy) |
| `FRONTEND_URL` | URL **com protocolo**: `http://localhost:5173` (dev) ou `https://seu-app.netlify.app` (prod). Evite valor vazio, aspas ou só `localhost:5173` sem `http://` |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente nas Edge Functions.

Template local: [`functions/.env.example`](functions/.env.example) → copiar para `functions/.env`.

**Projeto `synoire-app` (`xnfdfvckrwpabsxbttyc`):** após deploy, confirme no Dashboard que `STRIPE_PRICE_ID` está definido como `price_1TYey02abnSfEi4yqxkvjxz0` (sem isso, `create-checkout` retorna erro 500).

### Deploy

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### Webhook Stripe

1. Stripe Dashboard → Developers → Webhooks → Add endpoint  
2. URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`  
3. Eventos: `checkout.session.completed`, `customer.subscription.deleted`  
4. Copiar **Signing secret** → secret `STRIPE_WEBHOOK_SECRET`
