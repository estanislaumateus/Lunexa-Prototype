"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, Loader2, RefreshCw } from "lucide-react"
import { getAIStudySuggestions } from "@/app/actions/study"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Suggestion {
  title: string
  subject: string
  level: string
  description: string
  estimatedTime: string
  reason: string
}

export function StudySuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const loadSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getAIStudySuggestions()

      if (result.error) {
        setError(result.error)
        toast({
          title: "Erro ao carregar sugestões",
          description: result.error,
          variant: "destructive",
        })
      } else if (Array.isArray(result.suggestions)) {
        setSuggestions(result.suggestions)
      } else {
        // Sugestões padrão se a IA falhar
        setSuggestions([
          {
            title: "Fundamentos de Matemática",
            subject: "Matemática",
            level: "fundamental",
            description: "Conceitos básicos de aritmética e álgebra",
            estimatedTime: "2h",
            reason: "Base essencial para estudos avançados",
          },
          {
            title: "História de Angola",
            subject: "História",
            level: "medio",
            description: "Principais períodos da história angolana",
            estimatedTime: "3h",
            reason: "Conhecimento fundamental sobre nosso país",
          },
          {
            title: "Física Básica",
            subject: "Física",
            level: "medio",
            description: "Mecânica e conceitos fundamentais",
            estimatedTime: "2h 30min",
            reason: "Base para compreender o mundo físico",
          },
        ])
      }
    } catch (error) {
      console.error("Erro ao carregar sugestões:", error)
      setError("Erro de conexão")
      toast({
        title: "Erro de conexão",
        description: "Verifique sua internet e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "fundamental":
        return "bg-blue-100 text-blue-800"
      case "medio":
        return "bg-green-100 text-green-800"
      case "universitario":
        return "bg-purple-100 text-purple-800"
      case "avancado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    router.push(`/dashboard/study?title=${encodeURIComponent(suggestion.title)}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sugestões de Estudo
            </CardTitle>
            <CardDescription>Tópicos recomendados por IA baseados no seu perfil</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadSuggestions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Gerando sugestões personalizadas...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">Erro ao carregar sugestões</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadSuggestions} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma sugestão disponível no momento.</p>
            <p className="text-sm">Complete alguns estudos para receber recomendações personalizadas.</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{suggestion.title}</h4>
                  <Badge className={getLevelColor(suggestion.level)}>{suggestion.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>📚 {suggestion.subject}</span>
                  <span>⏱️ {suggestion.estimatedTime}</span>
                </div>
                {suggestion.reason && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">💡 {suggestion.reason}</p>
                )}
              </div>
              <Button size="sm" onClick={() => handleSelectSuggestion(suggestion)} className="ml-4">
                <Play className="h-4 w-4 mr-2" />
                Estudar
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
