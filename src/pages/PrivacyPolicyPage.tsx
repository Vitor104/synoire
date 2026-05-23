import { Link } from 'react-router-dom'

const SUPPORT_EMAIL = 'suporteSynoire@gmail.com'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-night text-primary">
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <Link
          to="/"
          className="inline-block text-sm text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
        >
          ← Voltar
        </Link>

        <article className="rounded-2xl border border-white/10 bg-panel/60 p-8 backdrop-blur-sm md:p-10">
          <header className="space-y-3 border-b border-white/10 pb-8">
            <h1 className="text-3xl font-semibold text-white">Política de Privacidade</h1>
            <p className="text-sm text-white/70">
              Vigência: maio de 2026. Esta política pode ser atualizada periodicamente; a versão
              publicada nesta página prevalece.
            </p>
          </header>

          <div className="space-y-6 pt-8 text-sm leading-relaxed text-white/70">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">1. Introdução</h2>
              <p>
                O <strong className="font-medium text-white/90">Synoire</strong> é uma plataforma
                digital de foco e produtividade voltada a concurseiros, oferecendo salas de estudo
                em tempo real, hubs por concurso, metas, streaks e ferramentas de constância nos
                estudos.
              </p>
              <p>
                Esta Política de Privacidade descreve como tratamos dados pessoais quando você
                utiliza nossos serviços. Ao criar uma conta ou usar o Synoire, você declara ter
                lido e compreendido este documento.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">2. Dados coletados</h2>
              <p>Podemos tratar as seguintes categorias de dados, conforme o uso da plataforma:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-medium text-white/90">Dados de conta:</strong> endereço
                  de e-mail, nome ou nome de usuário e, quando informado, foto de perfil.
                </li>
                <li>
                  <strong className="font-medium text-white/90">Dados de uso:</strong> tempo de
                  foco, metas, streaks, participação em salas e hubs, preferências de estudo e
                  demais informações geradas pelo uso das funcionalidades do produto.
                </li>
                <li>
                  <strong className="font-medium text-white/90">Dados de pagamento:</strong>{' '}
                  transações relacionadas a planos pagos são processadas de forma segura por
                  provedores externos especializados. O Synoire não armazena dados completos de
                  cartão de crédito ou débito em seus próprios servidores.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">3. Como usamos os dados</h2>
              <p>Utilizamos os dados pessoais para finalidades legítimas e necessárias ao serviço:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>autenticação e gestão da sua conta;</li>
                <li>
                  exibição de estatísticas e indicadores no painel (dashboard), metas e histórico de
                  constância;
                </li>
                <li>funcionamento de salas de estudo e recursos em tempo real;</li>
                <li>melhoria contínua da experiência, desempenho e segurança da plataforma;</li>
                <li>atendimento ao usuário e comunicações relacionadas ao serviço;</li>
                <li>cumprimento de obrigações legais e regulatórias aplicáveis.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">4. Compartilhamento</h2>
              <p>
                <strong className="font-medium text-white/90">Não vendemos</strong> seus dados
                pessoais a terceiros.
              </p>
              <p>
                Compartilhamos informações estritamente com infraestrutura essencial à operação do
                Synoire:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-medium text-white/90">Supabase</strong> — hospedagem de
                  banco de dados, autenticação e armazenamento associados ao produto;
                </li>
                <li>
                  <strong className="font-medium text-white/90">Stripe</strong> — processamento
                  seguro de pagamentos e gestão de assinaturas, quando aplicável.
                </li>
              </ul>
              <p>
                Também poderemos divulgar dados quando exigido por lei, ordem judicial ou autoridade
                competente, ou para proteger direitos, segurança e integridade da plataforma e de
                seus usuários.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">5. Segurança</h2>
              <p>
                Adotamos medidas técnicas e organizacionais alinhadas às boas práticas do setor,
                incluindo comunicação criptografada (HTTPS), controles de acesso e políticas de
                segurança no banco de dados (como Row Level Security no PostgreSQL).
              </p>
              <p>
                Embora empreguemos esforços razoáveis para proteger suas informações, nenhum sistema
                na internet é totalmente isento de riscos. Recomendamos o uso de senhas fortes e a
                proteção das credenciais da sua conta.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">
                6. Direitos do titular (LGPD)
              </h2>
              <p>
                Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode, entre
                outros direitos:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>confirmar a existência de tratamento e acessar seus dados;</li>
                <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
                <li>
                  solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou tratados
                  em desconformidade;
                </li>
                <li>solicitar portabilidade, quando aplicável;</li>
                <li>revogar consentimento, quando o tratamento tiver essa base legal;</li>
                <li>
                  solicitar a exclusão de dados tratados com base no consentimento, observadas as
                  hipóteses legais de retenção.
                </li>
              </ul>
              <p>
                Você pode atualizar informações do perfil diretamente na plataforma. Para{' '}
                <strong className="font-medium text-white/90">excluir sua conta e os dados
                associados</strong>, acesse <strong className="font-medium text-white/90">Perfil →
                Configurações</strong> e utilize o botão{' '}
                <strong className="font-medium text-white/90">Excluir Conta Permanentemente</strong>
                . Essa ação é irreversível e remove históricos de estudo, metas e demais dados
                vinculados à conta, conforme descrito na interface.
              </p>
              <p>
                Para exercer outros direitos ou esclarecer dúvidas sobre o tratamento de dados,
                entre em contato pelo canal indicado na seção seguinte.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">7. Contato</h2>
              <p>
                Para questões sobre privacidade, proteção de dados ou solicitações relacionadas à
                LGPD, envie um e-mail para{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-firefly underline decoration-firefly/40 underline-offset-2 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
