"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Clock, BookOpen, Loader2 } from "lucide-react"
import { getStudySchedule, createStudySchedule } from "@/app/actions/calendar"
import { getStudyTopics } from "@/app/actions/study"
import { useToast } from "@/hooks/use-toast"


interface StudyEvent {
  id: number
  title: string
  subject: string
  topic_id?: number
  date: string
  start_time: string
  end_time: string
  description?: string
  completed: boolean
}

interface StudyTopic {
  id: number
  title: string
  subject: string
}

export function StudyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [newEvent, setNewEvent] = useState({
    title: "",
    subject: "",
    topic_id: "",
    date: "",
    start_time: "",
    end_time: "",
    description: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsData, topicsData] = await Promise.all([getStudySchedule(), getStudyTopics()])

        setEvents(eventsData as StudyEvent[]);
        setTopics(topicsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar o calendário.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.start_time || !newEvent.end_time) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, data, horário de início e fim.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const result = await createStudySchedule({
        title: newEvent.title,
        subject: newEvent.subject,
        topic_id: newEvent.topic_id ? Number.parseInt(newEvent.topic_id) : undefined,
        date: newEvent.date,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        description: newEvent.description,
      })

      if (result.success) {
        toast({
          title: "Evento criado!",
          description: "Seu agendamento foi salvo com sucesso.",
        })

        // Atualizar lista de eventos
        const updatedEvents = await getStudySchedule()
        setEvents(updatedEvents as StudyEvent[]);

        // Limpar formulário
        setNewEvent({
          title: "",
          subject: "",
          topic_id: "",
          date: "",
          start_time: "",
          end_time: "",
          description: "",
        })
        setSelectedDate("")
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível criar o evento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateStr)
    setNewEvent({ ...newEvent, date: dateStr })
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <p className="text-sm text-muted-foreground">Clique em um dia para agendar estudos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agendar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agendar Estudo</DialogTitle>
                <DialogDescription>Crie um novo agendamento de estudo</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Título</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ex: Estudar Matemática"
                  />
                </div>

                <div>
                  <Label htmlFor="event-topic">Tópico (opcional)</Label>
                  <Select
                    value={newEvent.topic_id}
                    onValueChange={(value) => {
                      const topic = topics.find((t) => t.id.toString() === value)
                      setNewEvent({
                        ...newEvent,
                        topic_id: value,
                        subject: topic?.subject || "",
                        title: topic ? `Estudar ${topic.title}` : newEvent.title,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tópico..." />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.title} - {topic.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="event-subject">Matéria</Label>
                  <Input
                    id="event-subject"
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                    placeholder="Ex: Matemática"
                  />
                </div>

                <div>
                  <Label htmlFor="event-date">Data</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Início</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">Fim</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="event-description">Descrição (opcional)</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Notas sobre o que estudar..."
                    rows={2}
                  />
                </div>

                <Button onClick={handleCreateEvent} disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    "Agendar Estudo"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário de Estudos</CardTitle>
          <CardDescription>Dias com atividades agendadas são destacados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((day, index) => {
              if (day === null) {
                return <div key={index} className="p-2"></div>
              }

              const dayEvents = getEventsForDay(day)
              const hasEvents = dayEvents.length > 0
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors ${hasEvents ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" : "hover:bg-muted"
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : ""}`}>{day}</div>
                  {dayEvents.map((event, eventIndex) => (
                    <div key={eventIndex} className="mb-1">
                      <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                        {event.start_time} - {event.title}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Próximos eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Estudos</CardTitle>
          <CardDescription>Seus agendamentos para os próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events
              .filter((event) => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.start_time} - {event.end_time}
                      </span>
                      {event.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {event.subject}
                        </Badge>
                      )}
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.topic_id && (
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Estudar
                      </Button>
                    )}
                  </div>
                </div>
              ))}

            {events.filter((event) => new Date(event.date) >= new Date()).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">

                <p>Nenhum estudo agendado.</p>
                <p className="text-sm">Clique em um dia do calendário para agendar.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do mês */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-muted-foreground">Estudos Agendados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{events.filter((e) => e.completed).length}</div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {events.filter((e) => !e.completed && new Date(e.date) < new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Perdidos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
