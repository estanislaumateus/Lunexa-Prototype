"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function StudyProgress() {
  const subjects = [
    { name: "Matemática", progress: 75, color: "bg-blue-600" },
    { name: "História", progress: 60, color: "bg-green-600" },
    { name: "Física", progress: 45, color: "bg-purple-600" },
    { name: "Inglês", progress: 80, color: "bg-orange-600" },
    { name: "Química", progress: 30, color: "bg-red-600" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por Matéria</CardTitle>
        <CardDescription>Acompanhe seu desenvolvimento em cada área</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subjects.map((subject) => (
          <div key={subject.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{subject.name}</span>
              <span className="text-sm text-muted-foreground">{subject.progress}%</span>
            </div>
            <Progress value={subject.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
