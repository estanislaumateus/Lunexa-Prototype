import { StudyHistory } from "@/components/history/study-history"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Histórico de Estudos</h2>
        <p className="text-muted-foreground">Acompanhe todo seu progresso e atividades realizadas</p>
      </div>

      <StudyHistory />
    </div>
  )
}
