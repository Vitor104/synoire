import { Link } from 'react-router-dom'

const linkClass =
  'text-firefly underline decoration-firefly/40 underline-offset-2 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firefly/50'

export function TermsOfServicePage() {
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
            <h1 className="text-3xl font-semibold text-white">Termos de Uso</h1>
            <p className="text-sm text-white/70">
              Vigência: maio de 2026. Estes termos podem ser atualizados periodicamente; a versão
              publicada nesta página prevalece.
            </p>
          </header>

          <div className="space-y-6 pt-8 text-sm leading-relaxed text-white/70">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">1. Aceitação</h2>
              <p>
                Estes Termos de Uso regulam o acesso e a utilização do{' '}
                <strong className="font-medium text-white/90">Synoire</strong>, plataforma de foco e
                produtividade voltada a concurseiros.
              </p>
              <p>
                Ao acessar o site, criar uma conta ou utilizar qualquer funcionalidade, você
                declara ter lido, compreendido e concordado com estes Termos e com a nossa{' '}
                <Link to="/privacy" className={linkClass}>
                  Política de Privacidade
                </Link>
                . Se não concordar, não utilize o serviço.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">2. Uso permitido</h2>
              <p>
                O Synoire destina-se exclusivamente a fins de estudo, foco e produtividade em
                ambiente colaborativo. Você compromete-se a utilizar a plataforma de forma lícita,
                respeitosa e em conformidade com estes Termos.
              </p>
              <p>É expressamente proibido, entre outras condutas:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>assédio, discriminação, ameaças ou comportamento abusivo em salas de estudo;</li>
                <li>uso de bots, scripts ou automação não autorizada;</li>
                <li>spam, perturbação de outros usuários ou tentativas de fraude;</li>
                <li>qualquer uso que viole a legislação aplicável ou prejudique a operação do serviço.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">3. Conta</h2>
              <p>
                Você é responsável por manter a confidencialidade das suas credenciais de acesso e
                por todas as atividades realizadas na sua conta. Utilize senha forte e não
                compartilhe seus dados de login com terceiros.
              </p>
              <p>
                Compromete-se a fornecer informações verdadeiras e mantê-las atualizadas. Notifique-nos
                imediatamente em caso de suspeita de uso não autorizado da sua conta.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">4. Assinatura Glow</h2>
              <p>
                Determinados recursos premium do Synoire estão disponíveis mediante assinatura do
                plano <strong className="font-medium text-white/90">Synoire Glow</strong>.
              </p>
              <p>
                A contratação implica cobrança recorrente, na periodicidade escolhida no momento da
                assinatura (mensal ou anual), com valores e condições apresentados no fluxo de
                checkout. Os pagamentos são processados de forma segura pela{' '}
                <strong className="font-medium text-white/90">Stripe</strong>; o Synoire não armazena
                dados completos de cartão em seus servidores.
              </p>
              <p>
                O acesso aos benefícios Glow permanece ativo enquanto a assinatura estiver em dia,
                conforme o status refletido na sua conta.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">5. Cancelamentos</h2>
              <p>
                Você pode cancelar a assinatura Glow a qualquer momento, acessando{' '}
                <strong className="font-medium text-white/90">Perfil → Configurações</strong> e
                utilizando a opção{' '}
                <strong className="font-medium text-white/90">Gerenciar Assinatura</strong>, que
                direciona ao portal de gestão do provedor de pagamento quando disponível.
              </p>
              <p>
                Após o cancelamento, o acesso premium permanece válido até o término do período de
                faturamento já pago. Não há reembolso por períodos parcialmente não utilizados,
                salvo quando exigido pela legislação aplicável.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">
                6. Limitações de responsabilidade
              </h2>
              <p>
                O Synoire é uma ferramenta de apoio à produtividade e constância nos estudos.{' '}
                <strong className="font-medium text-white/90">
                  Não garantimos aprovação em concursos
                </strong>{' '}
                nem resultados específicos de desempenho acadêmico ou profissional.
              </p>
              <p>
                O serviço é fornecido <strong className="font-medium text-white/90">no estado em
                que se encontra</strong>, podendo ocorrer instabilidades técnicas, manutenções
                programadas ou indisponibilidade temporária. Na extensão máxima permitida pela lei,
                o Synoire não se responsabiliza por danos indiretos, lucros cessantes ou perdas
                decorrentes do uso ou da impossibilidade de uso da plataforma.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">7. Propriedade intelectual</h2>
              <p>
                A marca Synoire, identidade visual, design, código-fonte, textos institucionais e
                demais elementos proprietários da plataforma pertencem ao Synoire ou a seus
                licenciadores, sendo vedada a reprodução não autorizada.
              </p>
              <p>
                O conteúdo que você cria ou envia (como biografia, metas e preferências de perfil)
                permanece de sua titularidade. Ao publicá-lo na plataforma, você concede ao Synoire
                licença não exclusiva, limitada e necessária para armazenar, exibir e operar o
                serviço em seu benefício e no de outros usuários, nos termos da{' '}
                <Link to="/privacy" className={linkClass}>
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="mt-10 text-xl font-semibold text-white">8. Encerramento</h2>
              <p>
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, sem
                prejuízo de outras medidas cabíveis. Você pode encerrar sua participação a qualquer
                momento excluindo a conta conforme descrito na{' '}
                <Link to="/privacy" className={linkClass}>
                  Política de Privacidade
                </Link>{' '}
                (<strong className="font-medium text-white/90">Perfil → Configurações → Excluir Conta
                Permanentemente</strong>).
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
