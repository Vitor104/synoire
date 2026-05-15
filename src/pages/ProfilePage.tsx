export function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-primary">Perfil</h1>
      <p className="mt-2 text-sm text-secondary">
        Nome público, concurso-alvo e preferências de foco — persistência no
        Supabase após auth.
      </p>
      <dl className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Nome</dt>
          <dd className="text-primary">—</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Hub principal</dt>
          <dd className="text-primary">—</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">XP / nível</dt>
          <dd className="text-primary">Em breve</dd>
        </div>
      </dl>
    </div>
  )
}
