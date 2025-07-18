"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, GraduationCap, Loader2 } from "lucide-react"

interface Discipline {
  id: number
  name: string
  description: string
  year: number
}

const INFORMATICS_DISCIPLINES = [
  // 1º Ano - Todas exceto TREI, OGI, PT
  { id: 1, name: "Língua Portuguesa", description: "Leitura, redação, gramática e comunicação profissional", year: 1 },
  { id: 2, name: "Inglês Técnico", description: "Vocabulário técnico, leitura e tradução de textos de TI", year: 1 },
  { id: 3, name: "Matemática", description: "Álgebra, funções, estatística, trigonometria e cálculo", year: 1 },
  { id: 4, name: "FAI", description: "Formação de Atitudes Integradoras - Ética e cidadania", year: 1 },
  { id: 5, name: "Física", description: "Grandezas, leis de Newton, termodinâmica, ondas, eletricidade", year: 1 },
  { id: 6, name: "Química", description: "Estrutura da matéria, ligações, reações, soluções", year: 1 },
  { id: 7, name: "Educação Física", description: "Condição física, saúde mental, ergonomia", year: 1 },
  { id: 8, name: "TIC", description: "Hardware, software, sistemas operativos, internet, segurança", year: 1 },
  { id: 9, name: "SEAC", description: "Arquitetura de computadores, lógica digital, redes", year: 1 },
  { id: 10, name: "Electrotecnia", description: "Corrente, tensão, circuitos, transformadores", year: 1 },
  { id: 11, name: "TLP", description: "Lógica, algoritmos, programação estruturada e OO", year: 1 },

  // 2º Ano - Todas exceto TREI, OGI, PT, sem Educação Física
  { id: 12, name: "Língua Portuguesa", description: "Leitura, redação, gramática e comunicação profissional", year: 2 },
  { id: 13, name: "Inglês Técnico", description: "Vocabulário técnico, leitura e tradução de textos de TI", year: 2 },
  { id: 14, name: "Matemática", description: "Álgebra, funções, estatística, trigonometria e cálculo", year: 2 },
  { id: 15, name: "FAI", description: "Formação de Atitudes Integradoras - Ética e cidadania", year: 2 },
  { id: 16, name: "Física", description: "Grandezas, leis de Newton, termodinâmica, ondas, eletricidade", year: 2 },
  { id: 17, name: "Química", description: "Estrutura da matéria, ligações, reações, soluções", year: 2 },
  { id: 18, name: "TIC", description: "Hardware, software, sistemas operativos, internet, segurança", year: 2 },
  { id: 19, name: "SEAC", description: "Arquitetura de computadores, lógica digital, redes", year: 2 },
  { id: 20, name: "Electrotecnia", description: "Corrente, tensão, circuitos, transformadores", year: 2 },
  { id: 21, name: "TLP", description: "Lógica, algoritmos, programação estruturada e OO", year: 2 },

  // 3º Ano - Todas exceto PT, sem Língua Portuguesa e Inglês
  { id: 22, name: "Matemática", description: "Álgebra, funções, estatística, trigonometria e cálculo", year: 3 },
  { id: 23, name: "FAI", description: "Formação de Atitudes Integradoras - Ética e cidadania", year: 3 },
  { id: 24, name: "Física", description: "Grandezas, leis de Newton, termodinâmica, ondas, eletricidade", year: 3 },
  { id: 25, name: "Química", description: "Estrutura da matéria, ligações, reações, soluções", year: 3 },
  { id: 26, name: "TIC", description: "Hardware, software, sistemas operativos, internet, segurança", year: 3 },
  { id: 27, name: "SEAC", description: "Arquitetura de computadores, lógica digital, redes", year: 3 },
  { id: 28, name: "Electrotecnia", description: "Corrente, tensão, circuitos, transformadores", year: 3 },
  { id: 29, name: "TREI", description: "Manutenção, diagnóstico, montagem e testes de equipamentos", year: 3 },
  { id: 30, name: "OGI", description: "Gestão, organização, documentação, controle de qualidade", year: 3 },
  { id: 31, name: "TLP", description: "Lógica, algoritmos, programação estruturada e OO", year: 3 },

  // 4º Ano - Apenas PT
  { id: 32, name: "PT - Projeto Tecnológico", description: "Desenvolvimento de projeto tecnológico final", year: 4 },
]

export default function OnboardingQuizPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedYear) {
      toast({
        title: "Informações obrigatórias",
        description: "Por favor, selecione o curso e o ano.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: selectedCourse,
          year: parseInt(selectedYear),
        }),
      })

      if (response.ok) {
        toast({
          title: "Perfil configurado!",
          description: "Sua experiência foi personalizada com base nas suas respostas.",
        })
        router.push("/dashboard")
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao configurar perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao configurar perfil",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDisciplinesForYear = (year: number) => {
    return INFORMATICS_DISCIPLINES.filter(d => d.year === year)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-300" />
          </div>
          <CardTitle className="text-2xl">Personalize sua Experiência</CardTitle>
          <CardDescription>
            Responda algumas perguntas para personalizarmos seu plano de estudos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passo 1: Seleção do Curso */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Qual é o seu curso?</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione o curso que você está frequentando
                </p>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informatica">Informática</SelectItem>
                  {/* Adicionar outros cursos conforme necessário */}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={!selectedCourse}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Passo 2: Seleção do Ano */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Em que ano você está?</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione o ano/turma atual
                </p>
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Ano</SelectItem>
                  <SelectItem value="2">2º Ano</SelectItem>
                  <SelectItem value="3">3º Ano</SelectItem>
                  <SelectItem value="4">4º Ano</SelectItem>
                </SelectContent>
              </Select>

              {/* Mostrar disciplinas do ano selecionado */}
              {selectedYear && (
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Suas disciplinas:</Label>
                  <div className="grid gap-2">
                    {getDisciplinesForYear(parseInt(selectedYear)).map((discipline) => (
                      <div key={discipline.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{discipline.name}</p>
                          <p className="text-sm text-muted-foreground">{discipline.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !selectedCourse || !selectedYear}
                  className="w-full"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 