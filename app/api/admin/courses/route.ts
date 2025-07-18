import { NextRequest, NextResponse } from "next/server"
import { getCourses, createCourse } from "@/app/actions/admin"

export async function GET(req: NextRequest) {
  try {
    const courses = await getCourses()
    return NextResponse.json(courses)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar cursos" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const level = formData.get("level") as string
    const durationMonths = parseInt(formData.get("durationMonths") as string)

    if (!name || !description || !level || !durationMonths) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const result = await createCourse(name, description, level, durationMonths)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao criar curso" }, { status: 500 })
  }
} 