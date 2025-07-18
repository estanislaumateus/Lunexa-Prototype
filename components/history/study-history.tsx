"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, BookOpen, Trophy } from "lucide-react"

export function StudyHistory() {
  const studyHistory = [
    {
      id: 1,
      subject: "Matemática",
      topic: "Álgebra Linear",
      date: "2024-01-15",
      duration: "2h 30min",
      progress: 85,
      score: 9.2,
      status: "completed",
    },
    {
      id: 2,
      subject: "História",
      topic: "Revolução Francesa",
      date: "2024-01-14",
      duration: "1h 45min",
      progress: 100,
      score: 8.7,
      status: "completed",
    },
    {
      id: 3,
      subject: "Física",
      topic: "Termodinâmica",
      date: "2024-01-13",
      duration: "3h 15min",
      progress: 60,
      score: null,
      status: "in-progress",
    },
    {
      id: 4,
      subject: "Inglês",
      topic: "Conversação Avançada",
      date: "2024-01-12",
      duration: "1h 20min",
      progress: 100,
      score: 9.5,
      status: "completed",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47h 32min</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tópicos Estudados</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Notas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.9</div>
            <p className="text-xs text-muted-foreground">Últimas avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado</CardTitle>
          <CardDescription>Acompanhe todas suas sessões de estudo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studyHistory.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{session.topic}</h4>
                    {getStatusBadge(session.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.subject} • {session.date} • {session.duration}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Progresso:</span>
                      <Progress value={session.progress} className="w-20 h-2" />
                      <span className="text-sm">{session.progress}%</span>
                    </div>
                    {session.score && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">{session.score}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
