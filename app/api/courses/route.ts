import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const courses = await query("SELECT * FROM courses WHERE is_active = true ORDER BY name")
    return NextResponse.json(courses)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar cursos" }, { status: 500 })
  }
} 