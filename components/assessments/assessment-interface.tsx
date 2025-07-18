"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, Trophy, Play, Loader2, BookOpen } from "lucide-react"


import {
  getAssessments,
  getAssessment,
  submitAssessment,
  createCustomAssessment,
  getAssessmentStats,
} from "@/app/actions/assessments"
import { getStudyTopics } from "@/app/actions/study"
import { useToast } from "@/hooks/use-toast"
import { RowDataPacket, OkPacket } from "mysql2";

interface Assessment {
  id: number
  title: string
  subject: string
  questions: AssessmentQuestion[]
  total_questions: number
  difficulty: string
  completed: boolean
  score?: number
}

interface AssessmentQuestion {
  id: number
  question: string
  options: string[]
  correct: string
  explanation: string
}

interface StudyTopic {
  id: number
  title: string
  subject: string
  level: string
}

export function AssessmentInterface() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [studyTopics, setStudyTopics] = useState<StudyTopic[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [assessmentsData, topicsData, statsData] = await Promise.all([
          getAssessments(),
          getStudyTopics(),
          getAssessmentStats(),
        ])

        if (Array.isArray(assessmentsData)) {
          setAssessments(assessmentsData as Assessment[])
        } else {
          console.error("Dados inválidos:", assessmentsData)
        }

        setStudyTopics(topicsData)
        setStats(statsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as avaliações.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])


  const startAssessment = async (assessmentId: number) => {
    try {
      const rawAssessment = await getAssessment(assessmentId)

      const assessment: Assessment = {
        ...rawAssessment,
        completed: false, // ou true, se tiver lógica para isso
      }

      setSelectedAssessment(assessment)
      setCurrentQuestion(0)
      setAnswers({})
      setShowResults(false)
      setResults(null)

      toast({
        title: "Avaliação iniciada",
        description: `${assessment.title} - ${assessment.total_questions} questões`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a avaliação.",
        variant: "destructive",
      })
    }
  }


  const createTopicAssessment = async () => {
    if (!selectedTopic) {
      toast({
        title: "Selecione um tópico",
        description: "Escolha um tópico de estudo para gerar a avaliação.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const topic = studyTopics.find((t) => t.id.toString() === selectedTopic)
      if (!topic) return

      // Determinar número de questões e dificuldade baseado no progresso
      const questionCount = Math.min(15, Math.max(5, Math.floor(Math.random() * 10) + 5))
      const difficulties = ["easy", "medium", "hard"]
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]

      const result = await createCustomAssessment(
        `Avaliação: ${topic.title}`,
        topic.subject,
        topic.title,
        difficulty,
        questionCount,
      )

      if (result.error) {
        toast({
          title: "Erro ao criar avaliação",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success && result.assessment) {
        toast({
          title: "Avaliação criada!",
          description: `${questionCount} questões sobre ${topic.title}`,
        })

        // Atualizar lista e iniciar avaliação
        const response = await fetch("/api/assessments")
        if (!response.ok) throw new Error("Erro ao buscar avaliações")
        const updatedAssessments = await response.json()

        setAssessments(updatedAssessments)
        await startAssessment(result.assessment.id)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a avaliação.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (!selectedAssessment) return

    if (currentQuestion < selectedAssessment.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      finishAssessment()
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const finishAssessment = async () => {
    if (!selectedAssessment) return

    try {
      const result = await submitAssessment(selectedAssessment.id, answers, 15)

      if (result.success) {
        setResults(result)
        setShowResults(true)

        toast({
          title: "Avaliação concluída!",
          description: `Sua nota: ${result.score.toFixed(1)}`,
        })

        // Atualizar estatísticas
        const updatedStats = await getAssessmentStats()
        setStats(updatedStats)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível submeter a avaliação.",
        variant: "destructive",
      })
    }
  }

  const resetAssessment = () => {
    setSelectedAssessment(null)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setResults(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Tela de resultados
  if (showResults && results) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Avaliação Concluída!</CardTitle>
            <CardDescription>Confira seu desempenho abaixo</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className="text-4xl font-bold text-green-600">{results.score.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Nota final</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{results.totalQuestions - results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Aproveitamento</div>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={resetAssessment}>Voltar às Avaliações</Button>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Ver Correção
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Correção detalhada */}
        {!showResults && selectedAssessment && (
          <Card>
            <CardHeader>
              <CardTitle>Correção Detalhada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAssessment.questions.map((question, index) => {
                const userAnswer = answers[question.id]
                const isCorrect = userAnswer === question.correct

                return (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {index + 1}. {isCorrect ? "Correto" : "Incorreto"}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-2">{question.question}</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Sua resposta:</strong>{" "}
                        <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                          {userAnswer || "Não respondida"}
                        </span>
                      </p>
                      <p>
                        <strong>Resposta correta:</strong> <span className="text-green-600">{question.correct}</span>
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Explicação:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Tela de avaliação em andamento
  if (selectedAssessment && !showResults) {
    const question = selectedAssessment.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / selectedAssessment.questions.length) * 100

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{selectedAssessment.title}</h3>
            <p className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {selectedAssessment.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Clock className="h-4 w-4 mr-1" />
              Tempo livre
            </Badge>
            <Button variant="outline" size="sm" onClick={resetAssessment}>
              Sair
            </Button>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerSelect(question.id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
                Anterior
              </Button>
              <Button onClick={nextQuestion} disabled={!answers[question.id]}>
                {currentQuestion === selectedAssessment.questions.length - 1 ? "Finalizar" : "Próxima"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela principal de avaliações
  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações Feitas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.general?.total_assessments || 0}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.general?.average_score || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Últimas avaliações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhor Nota</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.general?.best_score || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Recorde pessoal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.general?.total_questions > 0
                  ? Math.round((stats.general.total_correct / stats.general.total_questions) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Geral</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Criar avaliação personalizada */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Avaliação Personalizada</CardTitle>
          <CardDescription>Gere uma avaliação específica sobre um tópico que você estudou</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="topic-select">Selecione um tópico de estudo</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um tópico..." />
                </SelectTrigger>
                <SelectContent>
                  {studyTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.title} - {topic.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createTopicAssessment} disabled={isCreating || !selectedTopic}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Gerar Avaliação
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Disponíveis</CardTitle>
          <CardDescription>Teste seus conhecimentos e acompanhe seu progresso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{assessment.subject}</Badge>
                    <Badge
                      variant={
                        assessment.difficulty === "easy"
                          ? "default"
                          : assessment.difficulty === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {assessment.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{assessment.total_questions} questões</span>
                    <span>Tempo livre</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {assessment.completed ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Nota: {assessment.score?.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Não realizada</span>
                    )}
                    <Button size="sm" onClick={() => startAssessment(assessment.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      {assessment.completed ? "Refazer" : "Iniciar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
