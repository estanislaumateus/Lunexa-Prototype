import { NotificationCenter } from "@/components/notifications/notification-center"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
        <p className="text-muted-foreground">Acompanhe lembretes, tarefas e atualizações importantes</p>
      </div>

      <NotificationCenter />
    </div>
  )
}
