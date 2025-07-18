"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Trophy, Target } from "lucide-react"
import { getStudyStats } from "@/app/actions/study"
import { getAssessmentStats } from "@/app/actions/assessments"

export function DashboardOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [studyStats, assessmentStats] = await Promise.all([
          getStudyStats(),
          getAssessmentStats(),
        ])

        setStats({
          study: studyStats,
          assessments: assessmentStats,
        })
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const studyHours = Math.floor((stats?.study?.general?.total_minutes || 0) / 60)
  const studyMinutes = (stats?.study?.general?.total_minutes || 0) % 60
  const weekHours = Math.floor((stats?.study?.week?.week_minutes || 0) / 60)
  const weekMinutes = (stats?.study?.week?.week_minutes || 0) % 60

  const overviewStats = [
    {
      title: "Horas Estudadas",
      value: `${weekHours}h ${weekMinutes}min`,
      description: "Esta semana",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Tópicos Estudados",
      value: stats?.study?.general?.topics_studied || 0,
      description: "Total",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Média de Notas",
      value: (Number(stats?.assessments?.general?.average_score) || 0).toFixed(1),
      description: "Avaliações",
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      title: "Sessões de Estudo",
      value: stats?.study?.general?.total_sessions || 0,
      description: "Total realizadas",
      icon: Target,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewStats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
