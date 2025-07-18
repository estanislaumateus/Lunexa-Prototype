"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, BookOpen, Users, Loader2 } from "lucide-react"

interface Course {
  id: number
  name: string
  description: string
  level: string
  duration_months: number
  is_active: boolean
}

interface Discipline {
  id: number
  course_id: number
  name: string
  description: string
  code: string
  credits: number
  semester: number
  is_active: boolean
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showDisciplineForm, setShowDisciplineForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Erro ao buscar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDisciplines = async (courseId: number) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/disciplines`)
      if (response.ok) {
        const data = await response.json()
        setDisciplines(data)
      }
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
    }
  }

  const handleCreateCourse = async (formData: FormData) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast({
          title: "Curso criado!",
          description: "O curso foi adicionado com sucesso.",
        })
        setShowCourseForm(false)
        fetchCourses()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao criar curso",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar curso",
        variant: "destructive",
      })
    }
  }

  const handleCreateDiscipline = async (formData: FormData) => {
    if (!selectedCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}/disciplines`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast({
          title: "Disciplina criada!",
          description: "A disciplina foi adicionada com sucesso.",
        })
        setShowDisciplineForm(false)
        fetchDisciplines(selectedCourse.id)
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao criar disciplina",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar disciplina",
        variant: "destructive",
      })
    }
  }

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
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Cursos</h2>
          <p className="text-muted-foreground">Gerencie cursos e disciplinas do sistema</p>
        </div>
        <Button onClick={() => setShowCourseForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {/* Lista de Cursos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card 
            key={course.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedCourse(course)
              fetchDisciplines(course.id)
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {course.name}
              </CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{course.level}</span>
                <span>{course.duration_months} meses</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disciplinas do Curso Selecionado */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Disciplinas - {selectedCourse.name}</CardTitle>
                <CardDescription>Gerencie as disciplinas deste curso</CardDescription>
              </div>
              <Button onClick={() => setShowDisciplineForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Disciplina
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {disciplines.map((discipline) => (
                <Card key={discipline.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <h4 className="font-semibold">{discipline.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{discipline.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Código: {discipline.code || 'N/A'}</span>
                    <span>{discipline.credits} créditos</span>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para Criar Curso */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Novo Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleCreateCourse} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Curso</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div>
                  <Label htmlFor="level">Nível</Label>
                  <Select name="level" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fundamental">Fundamental</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="universitario">Universitário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="durationMonths">Duração (meses)</Label>
                  <Input id="durationMonths" name="durationMonths" type="number" required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Criar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCourseForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Criar Disciplina */}
      {showDisciplineForm && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nova Disciplina</CardTitle>
              <CardDescription>Curso: {selectedCourse.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleCreateDiscipline} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Disciplina</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input id="code" name="code" />
                </div>
                <div>
                  <Label htmlFor="credits">Créditos</Label>
                  <Input id="credits" name="credits" type="number" defaultValue="0" />
                </div>
                <div>
                  <Label htmlFor="semester">Semestre</Label>
                  <Input id="semester" name="semester" type="number" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Criar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowDisciplineForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 