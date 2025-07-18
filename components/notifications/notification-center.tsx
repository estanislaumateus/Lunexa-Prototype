"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, AlertTriangle, BookOpen, Calendar, Trophy, MessageSquare } from "lucide-react"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserSettings,
  updateUserSettings,
} from "@/app/actions/notifications"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read_at?: string
  metadata?: any
  created_at: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState({
    studyReminders: true,
    assessmentAlerts: true,
    achievementNotifications: true,
    weeklyReports: true,
    emailNotifications: false,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [notificationsData, settingsData] = await Promise.all([getNotifications(), getUserSettings()])

        setNotifications(
          Array.isArray(notificationsData) && notificationsData.every((n) => typeof n === "object" && n.id)
            ? notificationsData as unknown as Notification[]
            : []
        )


        if (settingsData) {
          setSettings({
            studyReminders: settingsData.study_reminders,
            assessmentAlerts: settingsData.assessment_alerts,
            achievementNotifications: settingsData.achievement_notifications,
            weeklyReports: settingsData.weekly_reports,
            emailNotifications: settingsData.email_notifications,
          })
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as notificações.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida
    if (!notification.read_at) {
      try {
        await markNotificationAsRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)),
        )
      } catch (error) {
        console.error("Erro ao marcar notificação:", error)
      }
    }

    // Navegar baseado no tipo de notificação
    switch (notification.type) {
      case "reminder":
        // Se for lembrete de estudo, ir para área de estudo
        if (notification.metadata?.topicId) {
          router.push(`/dashboard/study?topic=${notification.metadata.topicId}`)
        } else {
          router.push("/dashboard/study")
        }
        break

      case "assessment":
        // Se for sobre avaliação, ir para avaliações
        if (notification.metadata?.assessmentId) {
          router.push(`/dashboard/assessments?assessment=${notification.metadata.assessmentId}`)
        } else {
          router.push("/dashboard/assessments")
        }
        break

      case "achievement":
        // Se for conquista, ir para histórico
        router.push("/dashboard/history")
        break

      case "schedule":
        // Se for agendamento, ir para calendário
        router.push("/dashboard/calendar")
        break

      case "chat":
        // Se for sobre chat, ir para chat
        router.push("/dashboard/chat")
        break

      default:
        // Padrão: ir para dashboard
        router.push("/dashboard")
        break
    }

    toast({
      title: "Redirecionando",
      description: "Levando você para a seção relacionada...",
    })
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
      toast({
        title: "Notificações marcadas",
        description: "Todas as notificações foram marcadas como lidas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações.",
        variant: "destructive",
      })
    }
  }

  const handleSettingsChange = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      await updateUserSettings({
        study_reminders: newSettings.studyReminders,
        assessment_alerts: newSettings.assessmentAlerts,
        achievement_notifications: newSettings.achievementNotifications,
        weekly_reports: newSettings.weeklyReports,
        email_notifications: newSettings.emailNotifications,
      })

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return BookOpen
      case "assessment":
        return AlertTriangle
      case "achievement":
        return Trophy
      case "schedule":
        return Calendar
      case "chat":
        return MessageSquare
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "text-blue-600"
      case "assessment":
        return "text-orange-600"
      case "achievement":
        return "text-green-600"
      case "schedule":
        return "text-purple-600"
      case "chat":
        return "text-indigo-600"
      default:
        return "text-gray-600"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Carregando notificações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notificações</h3>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notificações Recentes</CardTitle>
              <CardDescription>Clique em uma notificação para ir diretamente ao local relacionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma notificação ainda.</p>
                    <p className="text-sm">Suas notificações aparecerão aqui.</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    const color = getNotificationColor(notification.type)

                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${!notification.read_at
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                          : ""
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`p-2 rounded-full bg-white dark:bg-gray-800 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          {!notification.read_at && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Personalize suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="study-reminders" className="text-sm">
                    Lembretes de Estudo
                  </Label>
                  <Switch
                    id="study-reminders"
                    checked={settings.studyReminders}
                    onCheckedChange={(checked) => handleSettingsChange("studyReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="assessment-alerts" className="text-sm">
                    Alertas de Avaliação
                  </Label>
                  <Switch
                    id="assessment-alerts"
                    checked={settings.assessmentAlerts}
                    onCheckedChange={(checked) => handleSettingsChange("assessmentAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="achievement-notifications" className="text-sm">
                    Conquistas
                  </Label>
                  <Switch
                    id="achievement-notifications"
                    checked={settings.achievementNotifications}
                    onCheckedChange={(checked) => handleSettingsChange("achievementNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports" className="text-sm">
                    Relatórios Semanais
                  </Label>
                  <Switch
                    id="weekly-reports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingsChange("weeklyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-sm">
                    Notificações por Email
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingsChange("emailNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Resumo de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Notificações não lidas</span>
                <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>{unreadCount}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total de notificações</span>
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
