"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AssessmentInterface } from "@/components/assessments/assessment-interface"
import { createCustomAssessment } from "@/app/actions/assessments"
import { getStudyTopics } from "@/app/actions/study"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AssessmentsPage() {
  const searchParams = useSearchParams()
  const topicId = searchParams.get("topic")
  const topicTitle = searchParams.get("title")
  const mode = searchParams.get("mode") // 'assessment' ou 'exercise'
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function autoCreateAssessment() {
      if (topicId && topicTitle && !isAutoCreating) {
        setIsAutoCreating(true)

        try {
          // Buscar dados do tópico
          const topics = await getStudyTopics()
          const topic = topics.find((t: any) => t.id.toString() === topicId)

          if (topic) {
            const isAssessment = mode === "assessment"
            const questionCount = isAssessment ? Math.floor(Math.random() * 10) + 10 : Math.floor(Math.random() * 5) + 5 // 10-20 para avaliação, 5-10 para exercícios
            const difficulty = isAssessment ? "medium" : "easy"

            const result = await createCustomAssessment(
              `${isAssessment ? "Avaliação" : "Exercícios"}: ${topicTitle}`,
              topic.subject,
              topicTitle,
              difficulty,
              questionCount,
            )

            if (result.success) {
              toast({
                title: `${isAssessment ? "Avaliação" : "Exercícios"} criado!`,
                description: `${questionCount} questões sobre ${topicTitle}`,
              })
            }
          }
        } catch (error) {
          console.error("Erro ao criar avaliação automática:", error)
        } finally {
          setIsAutoCreating(false)
        }
      }
    }

    autoCreateAssessment()
  }, [topicId, topicTitle, mode, isAutoCreating, toast])

  if (isAutoCreating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Gerando {mode === "assessment" ? "avaliação" : "exercícios"} sobre {topicTitle}...
          </p>
        </div>
      </div>
    )
  }

  return <AssessmentInterface />
}
