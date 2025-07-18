import { NextResponse } from "next/server"
import { getStudySchedule } from "@/app/actions/study"

export async function GET() {
  const data = await getStudySchedule()
  return NextResponse.json(data)
}
