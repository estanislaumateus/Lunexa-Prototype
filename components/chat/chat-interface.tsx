"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendChatMessage, getChatHistory, clearChatHistory } from "@/app/actions/chat"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: number
  content: string
  sender: "user" | "ai" | "system"
  timestamp: Date
  aiProvider?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Carregar histórico de mensagens
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getChatHistory()
        const formattedMessages: Message[] = []

        // Adicionar mensagem de boas-vindas se não há histórico
        if (history.length === 0) {
          formattedMessages.push({
            id: 0,
            content:
              "Olá! Sou seu assistente de estudos inteligente. Como posso ajudá-lo hoje? Posso explicar conceitos, tirar dúvidas, criar exercícios ou sugerir métodos de estudo!",
            sender: "ai",
            timestamp: new Date(),
          })
        }

        // Converter histórico do banco para formato da interface
        history.forEach((msg: any) => {
          // Mensagem do usuário
          formattedMessages.push({
            id: msg.id * 2 - 1,
            content: msg.message,
            sender: "user",
            timestamp: new Date(msg.created_at),
          })

          // Resposta da IA
          if (msg.response) {
            formattedMessages.push({
              id: msg.id * 2,
              content: msg.response,
              sender: "ai",
              timestamp: new Date(msg.created_at),
              aiProvider: msg.ai_provider,
            })
          }
        })

        setMessages(formattedMessages)
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível carregar as mensagens anteriores.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [toast])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true) 

    try {
      const result = await sendChatMessage(inputMessage)

      if (result.error) {
        toast({
          title: "Erro no chat",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success && result.message) {
        const aiMessage: Message = {
          id: result.message.id,
          content: result.message.response || "Resposta não disponível",
          sender: "ai",
          timestamp: new Date(result.message.created_at),
          aiProvider: result.message.ai_provider,
        }
        
        if (result.notification) {
          const systemMessage: Message = {
            id: Date.now() + 1,
            content: result.notification,
            sender: "system",
            timestamp: new Date(),
            aiProvider: result.message.ai_provider,
          }
          setMessages((prev) => [...prev, aiMessage, systemMessage])
        } else {
          setMessages((prev) => [...prev, aiMessage])
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await clearChatHistory()
      setMessages([
        {
          id: 0,
          content: "Histórico limpo! Como posso ajudá-lo agora?",
          sender: "ai",
          timestamp: new Date(),
        },
      ])
      toast({
        title: "Histórico limpo",
        description: "Todas as mensagens foram removidas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar o histórico.",
        variant: "destructive",
      })
    }
  }

  if (isLoadingHistory) {
    return (
      <div className="space-y-6">
        <Card className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando histórico do chat...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seu assistente de IA é trocado automaticamente para garantir a melhor experiência.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleClearHistory}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Limpar Chat
        </Button>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat com IA
          </CardTitle>
          <CardDescription>Tire suas dúvidas e receba explicações personalizadas</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 max-h-[400px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender !== "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>{message.sender === "ai" ? <Bot className="h-4 w-4" /> : "S"}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[75%] rounded-lg p-3 break-words ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.sender === "system"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-muted"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {message.content}
                  </div>
                  {message.aiProvider && message.aiProvider !== "error" && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {message.aiProvider}
                    </Badge>
                  )}
                  <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
