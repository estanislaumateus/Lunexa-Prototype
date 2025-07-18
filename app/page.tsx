import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BrainCircuit, BookOpen, Rocket, GraduationCap } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function InstitutionalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-white dark:bg-gray-950">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Lunexa</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-600 dark:text-gray-300"
            prefetch={false}
          >
            Entrar
          </Link>
          <Button asChild>
            <Link href="/register">Começar Gratuitamente</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-white">
                A sua plataforma de estudos inteligente, feita para Angola.
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl dark:text-gray-300">
                Transforme sua maneira de aprender com trilhas de estudo personalizadas, assistentes de IA e conteúdo focado no currículo do ensino médio de Angola.
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/register">
                    Começar a usar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                  Funcionalidades Principais
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Potencialize seus Estudos</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Nossa plataforma oferece ferramentas inovadoras para ajudar você a atingir seu máximo potencial acadêmico.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold">Aprendizagem Personalizada</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receba sugestões de estudo e planos de aula criados especificamente para suas necessidades e objetivos.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                   <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold">Conteúdo Focado</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Acesse materiais, textos e vídeos alinhados com o currículo do ensino médio de Angola.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold">Assistentes com IA</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tire dúvidas e explore tópicos com a ajuda de múltiplos assistentes de inteligência artificial.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-950">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Como Funciona?</h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Comece a aprender em 3 passos simples.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl">1</div>
                <h3 className="text-xl font-bold pt-4">Crie sua Conta</h3>
                <p className="text-gray-600 dark:text-gray-400">Responda a um quiz rápido para entendermos seus interesses de estudo.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl">2</div>
                <h3 className="text-xl font-bold pt-4">Receba seu Plano</h3>
                <p className="text-gray-600 dark:text-gray-400">A plataforma irá gerar um plano de estudos personalizado para você.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl">3</div>
                <h3 className="text-xl font-bold pt-4">Comece a Aprender</h3>
                <p className="text-gray-600 dark:text-gray-400">Explore os materiais, assista aos vídeos e converse com as IAs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Lunexa. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termos de Serviço
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Política de Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  )
}
