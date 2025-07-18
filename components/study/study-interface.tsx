"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Play, BookOpen, Video, FileText, Plus, Loader2, Clock, CheckCircle, Pause, X } from "lucide-react"
import {
  getStudyTopics,
  createStudyTopic,
  getStudyTopicContent,
  startStudySession,
  endStudySession,
  getYoutubeVideos,
} from "@/app/actions/study"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface StudyTopic {
  id: number
  title: string
  subject: string
  level: string
  description: string
  content?: string
  progress: number
  completed: boolean
}

interface StudySession {
  topicId: number
  startTime: string
  isActive: boolean
}

interface YouTubeVideo {
  title: string
  videoId: string
  duration: string
  description: string
  thumbnail: string
}

export function StudyInterface() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null)
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [newTopic, setNewTopic] = useState({
    title: "",
    subject: "",
    level: "",
    description: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Carregar tópicos
  useEffect(() => {
    async function loadTopics() {
      try {
        const topicsData = await getStudyTopics()
        setTopics(topicsData as StudyTopic[])
      } catch (error) {
        console.error("Erro ao carregar tópicos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os tópicos de estudo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [toast])

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectTopic = async (topic: StudyTopic) => {
    setSelectedTopic(topic);
    setVideos([]); // Limpar vídeos anteriores
    setContentLoading(true);

    try {
      // Buscar conteúdo e vídeos
      const [topicContent, topicVideos] = await Promise.all([
        getStudyTopicContent(topic.id),
        getYoutubeVideos(topic.title),
      ]);

      if (topicContent.content) {
        setSelectedTopic({ ...topic, content: topicContent.content });
      }
      
      setVideos(topicVideos as YouTubeVideo[]);

    } catch (error) {
      console.error("Erro ao selecionar tópico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do tópico.",
        variant: "destructive",
      });
    } finally {
      setContentLoading(false);
    }
  };

  // Função para formatar o conteúdo de texto
  const formatContent = (content: string) => {
    if (!content) return ""

    // Dividir o conteúdo em seções baseadas em marcadores
    const sections = content.split(/(?=##\s)/g).filter(Boolean)

    return sections
      .map((section) => {
        // Processar cada seção
        let formattedSection = section
          .replace(/^##\s(.+)$/gm, '<h2 class="text-xl font-bold text-blue-600 mb-3 mt-6">$1</h2>')
          .replace(/^###\s(.+)$/gm, '<h3 class="text-lg font-semibold text-gray-700 mb-2 mt-4">$1</h3>')
          .replace(/^\*\*(.+)\*\*$/gm, '<p class="font-semibold text-gray-800 mb-2">$1</p>')
          .replace(/^-\s(.+)$/gm, '<li class="mb-1 text-gray-700">$1</li>')
          .replace(/^(\d+)\.\s(.+)$/gm, '<li class="mb-2 text-gray-700"><strong>$1.</strong> $2</li>')

        // Envolver listas em ul/ol
        formattedSection = formattedSection.replace(
          /(<li class="mb-1[^>]*>.*?<\/li>)/gs,
          '<ul class="list-disc list-inside mb-4 ml-4">$1</ul>',
        )
        formattedSection = formattedSection.replace(
          /(<li class="mb-2[^>]*>.*?<\/li>)/gs,
          '<ol class="list-decimal list-inside mb-4 ml-4">$1</ol>',
        )

        // Processar parágrafos normais
        formattedSection = formattedSection.replace(
          /^(?!<[h|u|o|l])[^<\n]+$/gm,
          '<p class="mb-3 text-gray-700 leading-relaxed">$&</p>',
        )

        return formattedSection
      })
      .join("")
  }

  const handleCreateTopic = async () => {
    if (!newTopic.title || !newTopic.subject || !newTopic.level) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, matéria e nível.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingTopic(true)

    try {
      const result = await createStudyTopic(newTopic.title, newTopic.subject, newTopic.level, newTopic.description)

      if (result.error) {
        toast({
          title: "Erro ao criar tópico",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Tópico criado!",
          description: `Conteúdo gerado com ${result.aiProvider}`,
        })

        // Atualizar lista de tópicos
        const updatedTopics = await getStudyTopics()
        setTopics(updatedTopics as StudyTopic[])

        // Limpar formulário
        setNewTopic({ title: "", subject: "", level: "", description: "" })

        // Selecionar o novo tópico automaticamente
        if (result.topic) {
          const fixedTopic: StudyTopic = {
            ...result.topic,
            description: result.topic.description ?? "",
          }
          await handleSelectTopic(fixedTopic)
        }

      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o tópico.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTopic(false)
    }
  }

  const handleStartStudy = async (topicId: number) => {
    try {
      const result = await startStudySession(topicId)
      if (result.success) {
        setCurrentSession({
          topicId,
          startTime: result.startTime,
          isActive: true,
        })
        setSessionNotes("")
        toast({
          title: "Sessão iniciada!",
          description: "Boa sorte nos estudos! Foque no conteúdo.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a sessão.",
        variant: "destructive",
      })
    }
  }

  const handleEndStudy = async () => {
    if (!currentSession) return

    try {
      const result = await endStudySession(currentSession.topicId, currentSession.startTime, 15, sessionNotes)
      if (result.success) {
        setCurrentSession(null)
        setSessionNotes("")
        toast({
          title: "Sessão concluída!",
          description: `Você estudou por ${result.durationMinutes} minutos. Progresso: ${result.newProgress}%`,
        })

        // Atualizar progresso do tópico
        if (selectedTopic && selectedTopic.id === currentSession.topicId) {
          setSelectedTopic({
            ...selectedTopic,
            progress: result.newProgress,
          })
        }

        // Atualizar lista de tópicos
        const updatedTopics = await getStudyTopics()
        setTopics(updatedTopics as StudyTopic[])
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a sessão.",
        variant: "destructive",
      })
    }
  }

  const handleGoToExercises = () => {
    if (selectedTopic) {
      router.push(`/dashboard/assessments?topic=${selectedTopic.id}&title=${encodeURIComponent(selectedTopic.title)}`)
    }
  }

  const handleGoToAssessment = () => {
    if (selectedTopic) {
      router.push(
        `/dashboard/assessments?topic=${selectedTopic.id}&title=${encodeURIComponent(selectedTopic.title)}&mode=assessment`,
      )
    }
  }

  const playVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video)
    toast({
      title: "Reproduzindo vídeo",
      description: video.title,
    })
  }

  const closeVideo = () => {
    setSelectedVideo(null)
  }

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player de vídeo modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <Button variant="ghost" size="sm" onClick={closeVideo}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de busca e novo tópico */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tópicos de estudo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Remover qualquer botão ou opção de "Novo Tema" ou "Adicionar Tema" do componente */}
      </div>

      {/* Sessão ativa */}
      {currentSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Sessão de estudo ativa</span>
                  <Badge variant="secondary">{selectedTopic?.title || `Tópico ${currentSession.topicId}`}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEndStudy()}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button size="sm" onClick={() => handleEndStudy()}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="session-notes" className="text-sm">
                  Anotações da sessão (opcional)
                </Label>
                <Textarea
                  id="session-notes"
                  placeholder="Anote suas observações, dúvidas ou insights..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de tópicos */}
      {!selectedTopic && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={getLevelColor(topic.level)}>{topic.level}</Badge>
                  <Badge variant="outline">{topic.subject}</Badge>
                </div>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progresso: {topic.progress}%</span>
                    <Button size="sm" onClick={() => handleSelectTopic(topic)}>
                      <Play className="h-4 w-4 mr-2" />
                      Estudar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conteúdo do tópico selecionado */}
      {selectedTopic && (
        <div className="space-y-6">
          {/* Header do tópico */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTopic(null)}>
                      ← Voltar
                    </Button>
                    <Badge className={getLevelColor(selectedTopic.level)}>{selectedTopic.level}</Badge>
                    <Badge variant="outline">{selectedTopic.subject}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{selectedTopic.title}</CardTitle>
                  <CardDescription>{selectedTopic.description}</CardDescription>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-md">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${selectedTopic.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Progresso: {selectedTopic.progress}%</span>
                </div>
                {!currentSession && (
                  <Button onClick={() => handleStartStudy(selectedTopic.id)} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Estudo
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Conteúdo */}
          <Card>
            <CardContent className="p-6">
              {contentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando conteúdo...</span>
                </div>
              ) : (
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text">
                      <FileText className="h-4 w-4 mr-2" />
                      Conteúdo
                    </TabsTrigger>
                    <TabsTrigger value="videos">
                      <Video className="h-4 w-4 mr-2" />
                      Vídeos
                    </TabsTrigger>
                    <TabsTrigger value="exercises">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Exercícios
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-6">
                    <div className="max-w-none">
                      {selectedTopic.content ? (
                        <div
                          className="bg-white p-6 rounded-lg border shadow-sm"
                          dangerouslySetInnerHTML={{ __html: formatContent(selectedTopic.content) }}
                        />
                      ) : (
                        <div className="p-8 bg-muted rounded-lg text-center">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Conteúdo não disponível. Tente recarregar o tópico.</p>
                          <Button variant="outline" onClick={() => handleSelectTopic(selectedTopic)} className="mt-4">
                            Recarregar Conteúdo
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="videos" className="space-y-4 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {videos.length > 0 ? (
                        videos.map((video, index) => (
                          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative cursor-pointer" onClick={() => playVideo(video)}>
                              <Image
                                src={video.thumbnail || "/placeholder.svg"}
                                alt={video.title}
                                width={320}
                                height={180}
                                className="w-full aspect-video object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="bg-red-600 rounded-full p-3">
                                  <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                              </div>
                              <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2 line-clamp-2">{video.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                              <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => playVideo(video)}>
                                <Play className="h-4 w-4 mr-2" />
                                Assistir Vídeo
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-2 p-8 bg-muted rounded-lg text-center">
                          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Nenhum vídeo disponível para este tópico.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="exercises" className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-600" />
                            <h4 className="font-semibold mb-2">Exercícios Práticos</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Pratique com exercícios específicos sobre {selectedTopic.title}
                            </p>
                            <Button className="w-full" onClick={handleGoToExercises}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Fazer Exercícios
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                            <h4 className="font-semibold mb-2">Avaliação</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Teste seus conhecimentos sobre {selectedTopic.title}
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleGoToAssessment}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Fazer Avaliação
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
