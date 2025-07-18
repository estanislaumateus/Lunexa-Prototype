import { NextRequest, NextResponse } from "next/server"
import { getDisciplinesByCourse, createDiscipline } from "@/app/actions/admin"

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId)
    const disciplines = await getDisciplinesByCourse(courseId)
    return NextResponse.json(disciplines)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar disciplinas" }, { status: 401 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId)
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const code = formData.get("code") as string
    const credits = parseInt(formData.get("credits") as string) || 0
    const semester = parseInt(formData.get("semester") as string) || null

    if (!name || !description) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const result = await createDiscipline(courseId, name, description, code, credits, semester || undefined)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao criar disciplina" }, { status: 500 })
  }
} 