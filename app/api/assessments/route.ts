// app/api/assessments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAssessments } from "@/app/actions/assessments"

export async function GET(req: NextRequest) {
  try {
    const data = await getAssessments()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar avaliações" }, { status: 401 })
  }
}
