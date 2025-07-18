"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Send, Star, MessageSquare, Bug, Lightbulb, Heart } from "lucide-react"

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<string>("")
  const [rating, setRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    if (!feedbackType) {
      toast({
        title: "Tipo de feedback obrigatório",
        description: "Por favor, selecione o tipo de feedback.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, avalie sua experiência.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Feedback enviado!",
          description: "Obrigado por compartilhar sua opinião conosco.",
        })
        
        // Limpar formulário
        setFeedbackType("")
        setRating(0)
        const form = document.querySelector('form') as HTMLFormElement
        if (form) form.reset()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao enviar feedback",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar feedback",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-5 w-5" />
      case "feature":
        return <Lightbulb className="h-5 w-5" />
      case "general":
        return <MessageSquare className="h-5 w-5" />
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Feedback</h2>
        <p className="text-muted-foreground">
          Sua opinião é muito importante para nós! Ajude-nos a melhorar a plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Enviar Feedback
          </CardTitle>
          <CardDescription>
            Conte-nos sobre sua experiência e sugestões para melhorar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* Tipo de Feedback */}
            <div className="space-y-2">
              <Label>Tipo de Feedback</Label>
              <div className="grid gap-3 md:grid-cols-3">
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    feedbackType === "bug" ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setFeedbackType("bug")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Bug/Problema</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reportar um erro ou problema encontrado
                  </p>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    feedbackType === "feature" ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setFeedbackType("feature")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Sugestão</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sugerir uma nova funcionalidade
                  </p>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    feedbackType === "general" ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setFeedbackType("general")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Geral</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Outros comentários ou opiniões
                  </p>
                </div>
              </div>
            </div>

            {/* Avaliação */}
            <div className="space-y-2">
              <Label>Avaliação Geral</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 0 && "Clique nas estrelas para avaliar"}
                {rating === 1 && "Muito insatisfeito"}
                {rating === 2 && "Insatisfeito"}
                {rating === 3 && "Neutro"}
                {rating === 4 && "Satisfeito"}
                {rating === 5 && "Muito satisfeito"}
              </p>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Resumo do seu feedback"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva detalhadamente sua experiência, sugestão ou problema encontrado..."
                rows={6}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interface">Interface e Usabilidade</SelectItem>
                  <SelectItem value="content">Conteúdo e Materiais</SelectItem>
                  <SelectItem value="performance">Performance e Velocidade</SelectItem>
                  <SelectItem value="features">Funcionalidades</SelectItem>
                  <SelectItem value="mobile">Versão Mobile</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select name="priority" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contato */}
            <div className="space-y-2">
              <Label htmlFor="contact">Email para Contato (Opcional)</Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                placeholder="seu@email.com"
              />
              <p className="text-sm text-muted-foreground">
                Deixe seu email se quiser que entremos em contato sobre seu feedback
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Feedback
                </>
              )}
            </Button>

            {/* Campos hidden para enviar dados do estado */}
            <input type="hidden" name="feedbackType" value={feedbackType} />
            <input type="hidden" name="rating" value={rating.toString()} />
          </form>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Processo de Revisão</h4>
              <p className="text-sm text-muted-foreground">
                Todo feedback é revisado pela nossa equipe. Bugs críticos são priorizados e funcionalidades sugeridas são avaliadas para implementação.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Atualizações</h4>
              <p className="text-sm text-muted-foreground">
                Mantenha-se informado sobre melhorias através das notificações da plataforma e nosso blog de atualizações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 