import { LandingExperience } from '@/components/landing/LandingExperience'
import { LandingFeaturesGrid } from '@/components/landing/LandingFeaturesGrid'
import { LandingFinalCta } from '@/components/landing/LandingFinalCta'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingSolution } from '@/components/landing/LandingSolution'

export function HomePage() {
  return (
    <div className="min-h-dvh bg-night text-primary">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-firefly focus:px-4 focus:py-2 focus:text-night"
      >
        Ir para o conteúdo
      </a>
      <LandingNavbar />
      <main id="conteudo">
        <LandingHero />
        <LandingProblem />
        <LandingSolution />
        <LandingExperience />
        <LandingHowItWorks />
        <LandingFeaturesGrid />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
