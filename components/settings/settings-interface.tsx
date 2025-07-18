"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Upload, Save, Loader2 } from "lucide-react"

export function SettingsInterface() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione apenas imagens.",
          variant: "destructive",
        })
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Configurações salvas!",
          description: "Suas configurações foram atualizadas com sucesso.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao salvar configurações",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e informações pessoais
        </p>
      </div>

      <form action={handleSubmit}>
        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Foto de Perfil */}
            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
                  <AvatarFallback>
                    <User className="w-10 h-10 text-gray-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Input
                    type="file"
                    name="avatar"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Carregar Imagem
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou GIF. Máximo 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" name="name" placeholder="Seu nome completo" />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" placeholder="Seu número de telefone" />
            </div>
          </CardContent>
        </Card>

        {/* Preferências de Estudo */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preferências de Estudo</CardTitle>
            <CardDescription>
              Configure suas preferências de aprendizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meta de Estudo */}
            <div className="space-y-2">
              <Label htmlFor="studyGoal">Meta de estudo semanal (horas)</Label>
              <Select name="studyGoal" defaultValue="2">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua meta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="5">5 horas</SelectItem>
                  <SelectItem value="10">10 horas</SelectItem>
                  <SelectItem value="15">15 horas</SelectItem>
                  <SelectItem value="20">20 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nível de Dificuldade */}
            <div className="space-y-2">
              <Label htmlFor="difficultyLevel">Nível de dificuldade preferido</Label>
              <Select name="difficultyLevel" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure suas preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações gerais</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações sobre atualizações e novidades
                </p>
              </div>
              <Switch name="notificationsEnabled" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes de estudo</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes para manter sua rotina de estudos
                </p>
              </div>
              <Switch name="studyReminders" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de avaliação</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre novas avaliações disponíveis
                </p>
              </div>
              <Switch name="assessmentAlerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
