import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { StudySuggestions } from "@/components/dashboard/study-suggestions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StudyProgress } from "@/components/dashboard/study-progress"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo do seu progresso.</p>
      </div>

      <DashboardOverview />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <StudySuggestions />
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>

      <StudyProgress />
    </div>
  )
}
