import { StudyCalendar } from "@/components/calendar/study-calendar"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendário de Estudos</h2>
        <p className="text-muted-foreground">Visualize seus dias de estudo e planeje sua rotina</p>
      </div>

      <StudyCalendar />
    </div>
  )
}
